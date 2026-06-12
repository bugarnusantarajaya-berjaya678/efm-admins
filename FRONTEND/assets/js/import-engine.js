/**
 * import-engine.js — Shared Import Leads engine
 *
 * Usage: call initImportEngine(config) after DOMContentLoaded.
 *
 * config = {
 *   tbodyId   : string   — id of the <tbody> to append rows into
 *   apiEndpoint: string  — fetch POST URL for production backend
 *   fields    : Array<{ id, label, required, hint }>
 *                        — mapping fields to show in Step 2
 *   buildRow  : function(lead, index, tbody) → HTMLTableRowElement
 *                        — caller-defined row renderer
 *   onImportDone: function(insertedCount) — optional callback after insert
 * }
 */

(function (global) {
  'use strict';

  /* ── State ── */
  let _cfg             = null;
  let importStep       = 1;
  let importParsedData = [];
  let importHeaders    = [];
  let importFirstRow   = {};

  /* ════════════════════════════════════════════════════════════════
   *  PUBLIC: initialise
   * ════════════════════════════════════════════════════════════════ */
  function initImportEngine(config) {
    _cfg = config;
    /* Inject modal HTML into <body> if not already present */
    if (!document.getElementById('modalImportLeads')) {
      document.body.insertAdjacentHTML('beforeend', buildModalHTML(config.fields));
    }
    /* Wire open button(s) — any element with data-open-import */
    document.querySelectorAll('[data-open-import]').forEach(el => {
      el.addEventListener('click', openImportModal);
    });
  }

  /* ════════════════════════════════════════════════════════════════
   *  MODAL HTML BUILDER
   * ════════════════════════════════════════════════════════════════ */
  function buildModalHTML(fields) {
    const fieldRows = (fields || defaultFields()).map(f => `
      <tr>
        <td>
          <div class="field-label">${f.label}${f.required ? ' <span class="field-required">*</span>' : ''}</div>
          <div class="field-hint">${f.hint || ''}</div>
        </td>
        <td><select class="mapping-select" id="map_${f.id}"><option value="">— Pilih kolom —</option></select></td>
      </tr>`).join('');

    return `
<div class="modal-overlay" id="modalImportLeads">
  <div class="modal" style="max-width:600px;">
    <div class="modal-header">
      <h3>Import Leads dari File</h3>
      <button class="modal-close" onclick="closeImportModal()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="modal-body">

      <!-- Step indicator -->
      <div class="import-steps">
        <div class="import-step active" id="impStepInd1"><div class="step-num">1</div>Upload File</div>
        <div class="step-line" id="impStepLine1"></div>
        <div class="import-step" id="impStepInd2"><div class="step-num">2</div>Petakan Kolom</div>
      </div>

      <!-- STEP 1: Upload -->
      <div id="impStep1">
        <div class="drop-zone" id="impDropZone"
          onclick="document.getElementById('impFileInput').click()"
          ondragover="impHandleDragOver(event)"
          ondragleave="impHandleDragLeave(event)"
          ondrop="impHandleDrop(event)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <h4>Seret file ke sini atau klik untuk pilih</h4>
          <p>Dukung ekspor dari Google Form, Google Ads, Meta Ads, Landing Page, dll.</p>
          <div class="file-types">
            <span class="file-type-tag">CSV</span>
            <span class="file-type-tag">XLSX</span>
            <span class="file-type-tag">XLS</span>
          </div>
        </div>
        <input type="file" id="impFileInput" accept=".csv,.xlsx,.xls"
          style="display:none" onchange="impHandleFileSelect(this.files[0])"/>
        <div id="impFileInfo" style="display:none"></div>

        <!-- Row-start input -->
        <div style="margin-top:14px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          <label style="font-size:12px;font-weight:600;color:var(--navy);white-space:nowrap;">Mulai baca data dari baris ke:</label>
          <input type="number" id="impStartRow" value="1" min="1" max="100"
            style="width:64px;padding:6px 10px;border:1.5px solid var(--gray-border);border-radius:7px;font-family:'Poppins',sans-serif;font-size:13px;color:var(--text-dark);outline:none;"
            oninput="impOnStartRowChange()"
            onfocus="this.style.borderColor='var(--navy)'"
            onblur="this.style.borderColor='var(--gray-border)'"/>
          <span style="font-size:11px;color:var(--gray-text);">(ubah jika baris 1 bukan header — mis. laporan Google Ads)</span>
        </div>
        <div id="impAutoDetectHint" style="display:none;margin-top:8px;padding:8px 12px;background:#FEF9E7;border:1px solid #F9D86B;border-radius:8px;font-size:12px;color:#856404;"></div>

        <div style="margin-top:14px;padding:12px 16px;background:#EBF5FB;border-radius:8px;border:1px solid #AED6F1;">
          <p style="font-size:12px;color:#2980B9;line-height:1.6;">
            <strong>Tips format file:</strong><br/>
            • <strong>Google Form:</strong> Respons → Unduh sebagai CSV (header biasanya baris 1)<br/>
            • <strong>Google Ads / Meta Ads:</strong> Export leads → baris 1-2 sering berisi judul laporan, coba mulai dari baris 3<br/>
            • <strong>Landing Page:</strong> Export kontak → CSV/XLSX<br/>
            • Kolom tidak perlu urut — Anda bisa petakan di langkah berikutnya.
          </p>
        </div>
      </div>

      <!-- STEP 2: Mapping -->
      <div id="impStep2" style="display:none">
        <div class="import-preview" id="impPreviewInfo"></div>
        <p style="font-size:13px;color:var(--gray-text);margin:16px 0 10px;">Petakan kolom dari file Anda ke field database kami:</p>
        <table class="mapping-table">
          <thead>
            <tr>
              <th style="width:40%">Field Database Kami</th>
              <th>Kolom dari File Anda</th>
            </tr>
          </thead>
          <tbody>${fieldRows}</tbody>
        </table>
      </div>

      <!-- STEP 3: Result -->
      <div id="impStep3" style="display:none">
        <div class="import-result" id="impResultContent"></div>
      </div>

    </div>
    <div class="modal-footer" id="impModalFooter">
      <button class="btn-cancel" onclick="closeImportModal()">Batal</button>
      <button class="btn-primary" id="impNextBtn" onclick="impNextStep()"
        disabled style="opacity:0.5;cursor:not-allowed">Lanjut →</button>
    </div>
  </div>
</div>`;
  }

  function defaultFields() {
    return [
      { id:'nama',    label:'Nama Lengkap',       required:true,  hint:'Nama prospek/lead' },
      { id:'no_hp',   label:'No HP / WhatsApp',   required:true,  hint:'Nomor yang bisa dihubungi' },
      { id:'email',   label:'Email',              required:false, hint:'Alamat email kontak' },
      { id:'sumber',  label:'Sumber Lead',        required:false, hint:'Asal perolehan lead' },
      { id:'program', label:'Program Diminati',   required:false, hint:'Jenis olahraga/program' },
      { id:'catatan', label:'Catatan Tambahan',   required:false, hint:'Info lain yang relevan' },
    ];
  }

  /* ════════════════════════════════════════════════════════════════
   *  OPEN / CLOSE / RESET
   * ════════════════════════════════════════════════════════════════ */
  function openImportModal() {
    resetImportModal();
    document.getElementById('modalImportLeads').classList.add('show');
  }
  global.openImportModal  = openImportModal;

  function closeImportModal() {
    document.getElementById('modalImportLeads').classList.remove('show');
  }
  global.closeImportModal = closeImportModal;

  function resetImportModal() {
    importStep       = 1;
    importParsedData = [];
    importHeaders    = [];
    importFirstRow   = {};

    _show('impStep1'); _hide('impStep2'); _hide('impStep3');
    _hide('impFileInfo'); _hide('impAutoDetectHint');
    _show('impModalFooter');
    document.getElementById('impFileInput').value  = '';
    document.getElementById('impStartRow').value   = '1';
    _setBtn(false, 'Lanjut →');
    _setStepIndicators(1);
  }

  /* ════════════════════════════════════════════════════════════════
   *  STEP INDICATORS
   * ════════════════════════════════════════════════════════════════ */
  function _setStepIndicators(active) {
    [1,2].forEach(n => {
      const el = document.getElementById('impStepInd' + n);
      if (!el) return;
      el.classList.remove('active','done');
      if (n < active)      el.classList.add('done');
      else if (n === active) el.classList.add('active');
    });
    const line = document.getElementById('impStepLine1');
    if (line) line.className = 'step-line' + (active > 1 ? ' done' : '');
  }

  function _setBtn(enabled, label) {
    const btn = document.getElementById('impNextBtn');
    if (!btn) return;
    btn.textContent    = label;
    btn.disabled       = !enabled;
    btn.style.opacity  = enabled ? '1' : '0.5';
    btn.style.cursor   = enabled ? 'pointer' : 'not-allowed';
  }

  /* ════════════════════════════════════════════════════════════════
   *  DRAG & DROP
   * ════════════════════════════════════════════════════════════════ */
  global.impHandleDragOver  = e => { e.preventDefault(); document.getElementById('impDropZone').classList.add('dragover'); };
  global.impHandleDragLeave = ()=> { document.getElementById('impDropZone').classList.remove('dragover'); };
  global.impHandleDrop      = e => {
    e.preventDefault();
    document.getElementById('impDropZone').classList.remove('dragover');
    const f = e.dataTransfer.files[0];
    if (f) impHandleFileSelect(f);
  };

  /* ════════════════════════════════════════════════════════════════
   *  FILE SELECTION
   * ════════════════════════════════════════════════════════════════ */
  global.impHandleFileSelect = function(file) {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['csv','xlsx','xls'].includes(ext)) {
      alert('Format file tidak didukung. Gunakan CSV atau Excel (.xlsx/.xls).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) { alert('Ukuran file maksimal 10 MB.'); return; }
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    _showFileCard(file.name, sizeMB, ext.toUpperCase());
    ext === 'csv' ? _parseCSV(file) : _parseExcel(file);
  };

  function _showFileCard(name, sizeMB, type) {
    const box = document.getElementById('impFileInfo');
    box.style.display = 'flex';
    box.innerHTML = `
      <div class="file-selected">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <div class="file-info">
          <div class="file-name">${name}</div>
          <div class="file-meta">${type} · ${sizeMB} MB</div>
        </div>
        <button class="remove-file" onclick="impRemoveFile()" title="Hapus">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>`;
  }

  global.impRemoveFile = function() {
    document.getElementById('impFileInput').value = '';
    _hide('impFileInfo'); _hide('impAutoDetectHint');
    importParsedData = []; importHeaders = []; importFirstRow = {};
    _setBtn(false, 'Lanjut →');
  };

  global.impOnStartRowChange = function() {
    if (!importParsedData.length) return;
    const fi = document.getElementById('impFileInput');
    if (fi.files && fi.files[0]) impHandleFileSelect(fi.files[0]);
  };

  /* ════════════════════════════════════════════════════════════════
   *  ROW-DENSITY AUTO-DETECT
   * ════════════════════════════════════════════════════════════════ */
  function _detectHeaderRow(rawRows, limit) {
    const n = Math.min(limit || 20, rawRows.length);
    let best = 0, bestCount = 0;
    for (let i = 0; i < n; i++) {
      const c = rawRows[i].filter(v => v !== null && v !== undefined && v.toString().trim() !== '').length;
      if (c > bestCount) { bestCount = c; best = i; }
    }
    return best;
  }

  function _showAutoDetectHint(detected, override) {
    const box = document.getElementById('impAutoDetectHint');
    if (detected !== override) {
      box.style.display = 'block';
      box.innerHTML = `⚠️ <strong>Auto-detect:</strong> Header paling padat terdeteksi di baris <strong>${detected}</strong>, bukan baris ${override}. Pertimbangkan mengubah "Mulai baca dari baris ke" jika kolom tidak sesuai.`;
    } else {
      box.style.display = 'none';
    }
  }

  function _getStartRow() {
    const v = parseInt(document.getElementById('impStartRow').value, 10);
    return (isNaN(v) || v < 1) ? 1 : v;
  }

  function _applyParsed(headers, data) {
    if (!headers.length || !data.length) {
      alert('Tidak ada data yang dapat dibaca. Coba ubah "Mulai baca dari baris ke".');
      return;
    }
    importHeaders    = headers;
    importParsedData = data;
    importFirstRow   = data[0] || {};
    _setBtn(true, 'Lanjut →');
  }

  /* ════════════════════════════════════════════════════════════════
   *  PARSERS
   * ════════════════════════════════════════════════════════════════ */
  function _parseCSV(file) {
    Papa.parse(file, {
      header: false, skipEmptyLines: false,
      complete: function(raw) {
        const allRows  = raw.data;
        const startRow = _getStartRow();
        const detected = _detectHeaderRow(allRows, 20) + 1;
        _showAutoDetectHint(detected, startRow);
        const headerIdx = startRow - 1;
        if (headerIdx >= allRows.length) {
          alert('Baris ke-' + startRow + ' tidak ditemukan. File hanya memiliki ' + allRows.length + ' baris.'); return;
        }
        const headers = allRows[headerIdx].map((h, i) =>
          (h != null && h.toString().trim()) ? h.toString().trim() : ('Kolom ' + (i + 1)));
        Papa.parse(file, {
          header: true, skipEmptyLines: true,
          beforeFirstChunk: chunk => chunk.split('\n').slice(headerIdx).join('\n'),
          complete: r  => _applyParsed(r.meta.fields || headers, r.data),
          error:    err => alert('Gagal membaca CSV: ' + err.message)
        });
      },
      error: err => alert('Gagal membaca CSV: ' + err.message)
    });
  }

  function _parseExcel(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const wb     = XLSX.read(new Uint8Array(e.target.result), { type:'array' });
        const ws     = wb.Sheets[wb.SheetNames[0]];
        const rawAoA = XLSX.utils.sheet_to_json(ws, { header:1, defval:'' });
        const startRow  = _getStartRow();
        const detected  = _detectHeaderRow(rawAoA, 20) + 1;
        _showAutoDetectHint(detected, startRow);
        const headerIdx = startRow - 1;
        if (headerIdx >= rawAoA.length) {
          alert('Baris ke-' + startRow + ' tidak ditemukan. Sheet hanya memiliki ' + rawAoA.length + ' baris.'); return;
        }
        const seen = {};
        const headers = rawAoA[headerIdx].map((h, i) => {
          const base = (h != null && h.toString().trim()) ? h.toString().trim() : ('Kolom ' + (i + 1));
          if (seen[base] === undefined) { seen[base] = 0; return base; }
          return base + '_' + (++seen[base]);
        });
        const dataRows = rawAoA.slice(headerIdx + 1)
          .filter(row => row.some(c => c != null && c.toString().trim()))
          .map(row => {
            const obj = {};
            headers.forEach((h, i) => { obj[h] = row[i] != null ? row[i].toString() : ''; });
            return obj;
          });
        _applyParsed(headers, dataRows);
      } catch(err) { alert('Gagal membaca Excel: ' + err.message); }
    };
    reader.readAsArrayBuffer(file);
  }

  /* ════════════════════════════════════════════════════════════════
   *  NAVIGATION
   * ════════════════════════════════════════════════════════════════ */
  global.impNextStep = function() {
    if (importStep === 1) _goToMappingStep();
    else if (importStep === 2) _runImport();
  };

  function _goToMappingStep() {
    importStep = 2;
    _hide('impStep1'); _show('impStep2');
    _setStepIndicators(2);

    const fields = _cfg ? (_cfg.fields || defaultFields()) : defaultFields();
    fields.forEach(f => {
      const sel = document.getElementById('map_' + f.id);
      if (!sel) return;
      while (sel.options.length > 1) sel.remove(1);
      importHeaders.forEach(col => {
        const opt     = document.createElement('option');
        opt.value     = col;
        const sample  = (importFirstRow[col] || '').toString().trim();
        const preview = sample.length > 30 ? sample.substring(0, 30) + '…' : sample;
        opt.textContent = sample ? `${col}  —  contoh: ${preview}` : col;
        sel.appendChild(opt);
      });
    });

    _autoDetectMapping(fields);

    const samplePairs = importHeaders.slice(0, 5).map(h => {
      const v = (importFirstRow[h] || '').toString().trim();
      return v ? `<em>${h}</em>: "${v}"` : `<em>${h}</em>`;
    }).join(' · ');
    document.getElementById('impPreviewInfo').innerHTML =
      `<p>📄 <strong>${importParsedData.length} baris</strong> data · <strong>${importHeaders.length} kolom</strong> terdeteksi</p>
       <p style="margin-top:6px;font-size:11px;color:var(--gray-text);">Baris pertama: ${samplePairs}${importHeaders.length > 5 ? ' · …' : ''}</p>`;

    _setBtn(true, 'Import Sekarang →');
  }

  function _autoDetectMapping(fields) {
    const patterns = {
      nama:    [/nama/i, /name/i, /full.?name/i],
      no_hp:   [/hp/i, /phone/i, /wa/i, /whatsapp/i, /telp/i, /no.?hp/i, /handphone/i],
      email:   [/email/i, /e-?mail/i, /surel/i],
      sumber:  [/sumber/i, /source/i, /channel/i, /media/i, /referral/i],
      program: [/program/i, /produk/i, /layanan/i, /service/i, /interest/i, /minat/i],
      catatan: [/catatan/i, /notes?/i, /keterangan/i, /message/i, /pesan/i, /comment/i],
      /* extra aliases for corporate / apartment / event */
      perusahaan: [/perusahaan/i, /company/i, /instansi/i, /klien/i, /client/i, /organisasi/i],
      jenis_event:[/jenis/i, /type/i, /event/i, /acara/i],
      peserta:    [/peserta/i, /pax/i, /attendee/i, /participant/i],
      nilai:      [/nilai/i, /value/i, /budget/i, /harga/i, /price/i, /kontrak/i],
    };
    importHeaders.forEach(col => {
      fields.forEach(f => {
        const sel = document.getElementById('map_' + f.id);
        if (!sel || sel.value) return;
        const pats = patterns[f.id] || [];
        if (pats.some(r => r.test(col))) sel.value = col;
      });
    });
  }

  /* ════════════════════════════════════════════════════════════════
   *  RUN IMPORT
   * ════════════════════════════════════════════════════════════════ */
  function _runImport() {
    const fields    = _cfg ? (_cfg.fields || defaultFields()) : defaultFields();
    const reqFields = fields.filter(f => f.required);
    const mapping   = {};
    fields.forEach(f => {
      mapping[f.id] = (document.getElementById('map_' + f.id) || {}).value || '';
    });

    /* Validate required */
    const missing = reqFields.filter(f => !mapping[f.id]);
    if (missing.length) {
      alert('Kolom wajib belum dipetakan: ' + missing.map(f => f.label).join(', '));
      return;
    }

    /* Normalise rows */
    const rows = importParsedData.map(row => {
      const obj = {};
      fields.forEach(f => { obj[f.id] = (row[mapping[f.id]] || '').toString().trim(); });
      return obj;
    }).filter(r => reqFields.every(f => r[f.id]));

    const skipped = importParsedData.length - rows.length;

    /* ── INTEGRATION POINT ────────────────────────────────────────
     * Replace the client-side insert below with a real API call:
     *
     * fetch(_cfg.apiEndpoint, {
     *   method: 'POST',
     *   headers: { 'Content-Type':'application/json',
     *              'Authorization':'Bearer '+getCookie('efm_token') },
     *   body: JSON.stringify({ leads: rows })
     * }).then(r=>r.json()).then(result=>{
     *   _showResult(result.inserted, result.skipped);
     * });
     * ─────────────────────────────────────────────────────────────
     */

    /* Client-side DOM insert */
    const tbody = document.getElementById(_cfg.tbodyId || 'dataBody');
    let inserted = 0;
    if (_cfg && typeof _cfg.buildRow === 'function') {
      rows.forEach((lead, i) => {
        const tr = _cfg.buildRow(lead, i, tbody);
        if (tr) { tbody.appendChild(tr); inserted++; }
      });
    } else {
      /* Generic fallback row */
      const colors = ['#E05945','#2980B9','#27AE60','#8E44AD','#F39C12','#16A085','#E67E22'];
      rows.forEach((lead, i) => {
        const nameField = fields.find(f => f.id === 'nama') ? lead.nama : Object.values(lead)[0];
        const initials  = (nameField||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
        const color     = colors[i % colors.length];
        const today     = new Date().toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'});
        const tr        = document.createElement('tr');
        tr.innerHTML    = fields.map(f =>
          `<td>${f.id === 'nama'
            ? `<div style="display:flex;align-items:center;gap:8px;"><div style="width:32px;height:32px;border-radius:50%;background:${color};color:white;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">${initials}</div>${lead[f.id]||'—'}</div>`
            : (lead[f.id] || '—')
          }</td>`
        ).join('') + `<td>${today}</td>`;
        tbody.appendChild(tr);
        inserted++;
      });
    }

    /* Refresh pagination if engine is present on the page */
    if (typeof applyFilterAndPaginate === 'function') applyFilterAndPaginate();
    else if (typeof refreshPagination === 'function')  refreshPagination();

    _showResult(inserted, skipped);

    /* Optional callback */
    if (_cfg && typeof _cfg.onImportDone === 'function') _cfg.onImportDone(inserted);
  }

  function _showResult(inserted, skipped) {
    _hide('impStep2');
    _show('impStep3');
    _hide('impModalFooter');
    document.getElementById('impResultContent').innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="#27AE60" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <h4>Import Berhasil!</h4>
      <p>Data leads telah ditambahkan ke tabel.</p>
      <div class="result-stats">
        <div class="result-stat success">${inserted} leads diimport</div>
        ${skipped > 0 ? `<div class="result-stat skip">${skipped} baris dilewati</div>` : ''}
      </div>
      <br/>
      <button class="btn-primary" onclick="closeImportModal()" style="margin-top:8px">Selesai</button>`;
  }

  /* ════════════════════════════════════════════════════════════════
   *  HELPERS
   * ════════════════════════════════════════════════════════════════ */
  function _show(id) { const el=document.getElementById(id); if(el) el.style.display=''; }
  function _hide(id) { const el=document.getElementById(id); if(el) el.style.display='none'; }

  /* Expose public API */
  global.initImportEngine = initImportEngine;

}(window));
