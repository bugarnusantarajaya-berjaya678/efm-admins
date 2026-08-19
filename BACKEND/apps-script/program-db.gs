/**
 * EFM Program Database — Google Apps Script Backend
 * Deploy: Extensions → Apps Script → Deploy → Web App
 *
 * DEPLOYMENT NOTES:
 * - Deploy dua versi berbeda (atau filter via parameter):
 *   1. PUBLIC_ENDPOINT  : "Execute as: Me | Who has access: Anyone"  → untuk getKategoriList, getProgram*, getTermsCondition
 *   2. ADMIN_ENDPOINT   : "Execute as: Me | Who has access: Anyone"  → untuk semua endpoint write (dilindungi dengan ADMIN_TOKEN)
 *
 * SHEET NAMES (wajib sama persis, case-sensitive):
 *   PROGRAM_DB           — sudah ada, tambahkan kolom baru sesuai Phase 0
 *   KATEGORI_PROGRAM     — buat baru
 *   PROFIL_PELATIH_PUBLIC — buat baru
 *   PROGRAM_VARIAN_HARGA — buat baru
 *   CONFIG               — buat baru (kolom: key, value)
 */

const SS_ID      = 'PASTE_SPREADSHEET_ID_DISINI'; // Ganti dengan ID Google Spreadsheet
const ADMIN_TOKEN = 'GANTI_TOKEN_RAHASIA_ADMIN';   // Ganti dengan token rahasia

// ─── Sheet column maps ───────────────────────────────────────────────────────

const COL_PROGRAM = {
  id:0, namaLatihan:1, namaPaket:2, sesi:3, pertemuan:4, partisipan:5,
  masa:6, picId:6+1, biayaSesiPIC:7+1, harga:8+1, hargaPersesi:9+1,
  diskonPaket:10+1, status:11+1,
  kategori_program:13, pakai_ratecard_efm:14, deskripsi_program:15,
  batas_minggu:16, pertemuan_per_minggu:17, durasi_menit:18,
  kapasitas_min:19, kapasitas_max:20, level_kelas:21, item_tidak_termasuk:22,
  benefits:23, terms_condition:24,
};

const COL_KATEGORI = { id_kategori:0, nama_kategori:1, urutan_tampil:2, status:3 };

const COL_PELATIH = {
  kode_pic:0, nama_lengkap:1, nama_panggilan:2, sertifikat:3, foto_url:4, status:5
};

const COL_VARIAN = {
  id_varian:0, id_program:1, label_varian:2, harga_sebelum_diskon:3,
  harga_akhir:4, diskon_persen:5, harga_per_unit:6
};

// ─── Utility ─────────────────────────────────────────────────────────────────

function getSheet(name) {
  return SpreadsheetApp.openById(SS_ID).getSheetByName(name);
}

function sheetToObjects(sheet, colMap) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = Object.keys(colMap);
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach(h => { obj[h] = row[colMap[h]] !== undefined ? row[colMap[h]] : ''; });
    return obj;
  });
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, data }))
    .setMimeType(ContentService.MimeType.JSON);
}

function errResponse(msg) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: false, error: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}

function checkAdminToken(params) {
  return params.token === ADMIN_TOKEN;
}

// ─── doGet — main router ─────────────────────────────────────────────────────

function doGet(e) {
  const p = e.parameter || {};
  const action = p.action || '';
  try {
    switch (action) {
      // ── Public read ──
      case 'getKategoriList':           return getKategoriList();
      case 'getProgramByKategori':      return getProgramByKategori(p.idKategori);
      case 'getProgramByCoachKategori': return getProgramByCoachKategori(p.kodePic, p.idKategori);
      case 'getProgramDetail':          return getProgramDetail(p.idProgram);
      case 'getTermsConditionGlobal':   return getTermsConditionGlobal();

      // ── Admin write (require token param) ──
      case 'createKategori':            return _adminOp(p, () => createKategori(JSON.parse(p.data)));
      case 'updateKategori':            return _adminOp(p, () => updateKategori(p.id, JSON.parse(p.data)));
      case 'setStatusKategori':         return _adminOp(p, () => setStatusKategori(p.id, p.status));
      case 'createProfilPelatih':       return _adminOp(p, () => createProfilPelatih(JSON.parse(p.data)));
      case 'updateProfilPelatih':       return _adminOp(p, () => updateProfilPelatih(p.kodePic, JSON.parse(p.data)));
      case 'setStatusProfilPelatih':    return _adminOp(p, () => setStatusProfilPelatih(p.kodePic, p.status));
      case 'updateProgramKatalog':      return _adminOp(p, () => updateProgramKatalog(p.idProgram, JSON.parse(p.data)));
      case 'saveVarianHarga':           return _adminOp(p, () => saveVarianHarga(p.idProgram, JSON.parse(p.data)));

      default: return errResponse('Unknown action: ' + action);
    }
  } catch (err) {
    return errResponse(err.message);
  }
}

function _adminOp(params, fn) {
  if (!checkAdminToken(params)) return errResponse('Unauthorized — invalid token');
  return jsonResponse(fn());
}

// ─── PUBLIC READ FUNCTIONS ────────────────────────────────────────────────────

function getKategoriList() {
  const sheet = getSheet('KATEGORI_PROGRAM');
  const rows  = sheetToObjects(sheet, COL_KATEGORI)
    .filter(k => k.status === 'Aktif')
    .sort((a, b) => Number(a.urutan_tampil) - Number(b.urutan_tampil));
  return jsonResponse(rows);
}

function getProgramByKategori(idKategori) {
  if (!idKategori) return errResponse('idKategori wajib diisi');
  const programs = sheetToObjects(getSheet('PROGRAM_DB'), COL_PROGRAM)
    .filter(p => p.status === 'aktif' && p.kategori_program === idKategori);

  const ratecardPrograms = programs.filter(p => _toBool(p.pakai_ratecard_efm));
  const customPrograms   = programs.filter(p => !_toBool(p.pakai_ratecard_efm));

  // Unique coaches yang punya program custom di kategori ini
  const coachIds = [...new Set(customPrograms.map(p => p.picId).filter(Boolean))];
  const pelatihAll = sheetToObjects(getSheet('PROFIL_PELATIH_PUBLIC'), COL_PELATIH);
  const coaches = coachIds.map(id => pelatihAll.find(t => t.kode_pic === id)).filter(Boolean);

  return jsonResponse({ ratecard_programs: ratecardPrograms, coaches });
}

function getProgramByCoachKategori(kodePic, idKategori) {
  if (!kodePic || !idKategori) return errResponse('kodePic dan idKategori wajib diisi');
  const programs = sheetToObjects(getSheet('PROGRAM_DB'), COL_PROGRAM)
    .filter(p => p.status === 'aktif' && p.picId === kodePic && p.kategori_program === idKategori);
  const varianAll = sheetToObjects(getSheet('PROGRAM_VARIAN_HARGA'), COL_VARIAN);
  programs.forEach(prog => {
    prog.varian_harga = varianAll.filter(v => v.id_program === prog.id);
  });
  return jsonResponse(programs);
}

function getProgramDetail(idProgram) {
  if (!idProgram) return errResponse('idProgram wajib diisi');
  const programs = sheetToObjects(getSheet('PROGRAM_DB'), COL_PROGRAM);
  const prog = programs.find(p => p.id === idProgram);
  if (!prog) return errResponse('Program tidak ditemukan: ' + idProgram);

  const varianAll = sheetToObjects(getSheet('PROGRAM_VARIAN_HARGA'), COL_VARIAN);
  prog.varian_harga = varianAll.filter(v => v.id_program === prog.id);

  if (!_toBool(prog.pakai_ratecard_efm) && prog.picId) {
    const pelatihAll = sheetToObjects(getSheet('PROFIL_PELATIH_PUBLIC'), COL_PELATIH);
    prog.profil_pelatih = pelatihAll.find(t => t.kode_pic === prog.picId) || null;
  } else {
    prog.profil_pelatih = null;
  }

  return jsonResponse(prog);
}

function getTermsConditionGlobal() {
  const sheet = getSheet('CONFIG');
  const data  = sheet.getDataRange().getValues();
  const row   = data.slice(1).find(r => r[0] === 'terms_condition_global');
  return jsonResponse({ terms_condition_global: row ? row[1] : '' });
}

// ─── ADMIN WRITE FUNCTIONS — KATEGORI ────────────────────────────────────────

function createKategori(data) {
  const sheet = getSheet('KATEGORI_PROGRAM');
  sheet.appendRow([data.id_kategori, data.nama_kategori, data.urutan_tampil || 99, data.status || 'Aktif']);
  return { created: data.id_kategori };
}

function updateKategori(id, data) {
  const sheet = getSheet('KATEGORI_PROGRAM');
  const rows  = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][COL_KATEGORI.id_kategori] === id) {
      sheet.getRange(i + 1, 1, 1, 4).setValues([[
        data.id_kategori || id,
        data.nama_kategori,
        data.urutan_tampil,
        data.status,
      ]]);
      return { updated: id };
    }
  }
  throw new Error('Kategori tidak ditemukan: ' + id);
}

function setStatusKategori(id, status) {
  const sheet = getSheet('KATEGORI_PROGRAM');
  const rows  = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][COL_KATEGORI.id_kategori] === id) {
      sheet.getRange(i + 1, COL_KATEGORI.status + 1).setValue(status);
      return { updated: id, status };
    }
  }
  throw new Error('Kategori tidak ditemukan: ' + id);
}

// ─── ADMIN WRITE FUNCTIONS — PROFIL PELATIH ──────────────────────────────────

function createProfilPelatih(data) {
  const sheet = getSheet('PROFIL_PELATIH_PUBLIC');
  sheet.appendRow([data.kode_pic, data.nama_lengkap, data.nama_panggilan, data.sertifikat || '', data.foto_url || '', data.status || 'Aktif']);
  return { created: data.kode_pic };
}

function updateProfilPelatih(kodePic, data) {
  const sheet = getSheet('PROFIL_PELATIH_PUBLIC');
  const rows  = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][COL_PELATIH.kode_pic] === kodePic) {
      sheet.getRange(i + 1, 1, 1, 6).setValues([[
        data.kode_pic || kodePic,
        data.nama_lengkap,
        data.nama_panggilan,
        data.sertifikat || '',
        data.foto_url || '',
        data.status,
      ]]);
      return { updated: kodePic };
    }
  }
  throw new Error('Pelatih tidak ditemukan: ' + kodePic);
}

function setStatusProfilPelatih(kodePic, status) {
  const sheet = getSheet('PROFIL_PELATIH_PUBLIC');
  const rows  = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][COL_PELATIH.kode_pic] === kodePic) {
      sheet.getRange(i + 1, COL_PELATIH.status + 1).setValue(status);
      return { updated: kodePic, status };
    }
  }
  throw new Error('Pelatih tidak ditemukan: ' + kodePic);
}

// ─── ADMIN WRITE FUNCTIONS — PROGRAM KATALOG FIELDS ──────────────────────────

function updateProgramKatalog(idProgram, data) {
  const sheet = getSheet('PROGRAM_DB');
  const rows  = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][COL_PROGRAM.id] === idProgram) {
      // Update kolom katalog (index 13–24)
      sheet.getRange(i + 1, 14, 1, 12).setValues([[
        data.kategori_program    || '',
        data.pakai_ratecard_efm  ? 'TRUE' : 'FALSE',
        data.deskripsi_program   || '',
        data.batas_minggu        || '',
        data.pertemuan_per_minggu|| '',
        data.durasi_menit        || '',
        data.kapasitas_min       || '',
        data.kapasitas_max       || '',
        data.level_kelas         || '',
        data.item_tidak_termasuk || '',
        data.benefits            || '',
        data.terms_condition     || '',
      ]]);
      return { updated: idProgram };
    }
  }
  throw new Error('Program tidak ditemukan: ' + idProgram);
}

// ─── ADMIN WRITE FUNCTIONS — VARIAN HARGA ────────────────────────────────────

function saveVarianHarga(idProgram, varianList) {
  const sheet = getSheet('PROGRAM_VARIAN_HARGA');
  const rows  = sheet.getDataRange().getValues();

  // Hapus semua baris yang punya id_program ini (mulai dari belakang agar index tetap valid)
  for (let i = rows.length - 1; i >= 1; i--) {
    if (rows[i][COL_VARIAN.id_program] === idProgram) sheet.deleteRow(i + 1);
  }

  // Tambahkan baris baru
  varianList.forEach((v, idx) => {
    sheet.appendRow([
      v.id_varian || (idProgram + '-VAR-' + (idx + 1)),
      idProgram,
      v.label_varian,
      v.harga_sebelum_diskon || '',
      v.harga_akhir || '',
      v.diskon_persen || '',
      v.harga_per_unit || '',
    ]);
  });

  return { saved: varianList.length, id_program: idProgram };
}

// ─── HELPER ──────────────────────────────────────────────────────────────────

function _toBool(val) {
  if (typeof val === 'boolean') return val;
  return String(val).toUpperCase() === 'TRUE';
}

// ─── SETUP — buat sheet baru jika belum ada ──────────────────────────────────
// Jalankan sekali manual dari Apps Script Editor → Run → setupSheets()

function setupSheets() {
  const ss = SpreadsheetApp.openById(SS_ID);
  const sheets = { 'KATEGORI_PROGRAM': null, 'PROFIL_PELATIH_PUBLIC': null, 'PROGRAM_VARIAN_HARGA': null, 'CONFIG': null };

  Object.keys(sheets).forEach(name => {
    if (!ss.getSheetByName(name)) {
      const s = ss.insertSheet(name);
      sheets[name] = s;
    }
  });

  // Set headers
  const k = ss.getSheetByName('KATEGORI_PROGRAM');
  if (k && k.getLastRow() === 0) k.appendRow(['id_kategori','nama_kategori','urutan_tampil','status']);

  const p = ss.getSheetByName('PROFIL_PELATIH_PUBLIC');
  if (p && p.getLastRow() === 0) p.appendRow(['kode_pic','nama_lengkap','nama_panggilan','sertifikat','foto_url','status']);

  const v = ss.getSheetByName('PROGRAM_VARIAN_HARGA');
  if (v && v.getLastRow() === 0) v.appendRow(['id_varian','id_program','label_varian','harga_sebelum_diskon','harga_akhir','diskon_persen','harga_per_unit']);

  const c = ss.getSheetByName('CONFIG');
  if (c && c.getLastRow() === 0) {
    c.appendRow(['key','value']);
    c.appendRow(['terms_condition_global','']);
  }

  // Tambahkan kolom baru ke PROGRAM_DB jika belum ada (kolom 14–25)
  const db = ss.getSheetByName('PROGRAM_DB');
  if (db) {
    const header = db.getRange(1, 1, 1, db.getLastColumn()).getValues()[0];
    const newCols = ['kategori_program','pakai_ratecard_efm','deskripsi_program','batas_minggu','pertemuan_per_minggu','durasi_menit','kapasitas_min','kapasitas_max','level_kelas','item_tidak_termasuk','benefits','terms_condition'];
    newCols.forEach(col => {
      if (!header.includes(col)) db.getRange(1, db.getLastColumn() + 1).setValue(col);
    });
  }

  SpreadsheetApp.getUi().alert('Setup selesai! Sheet baru dan header sudah dibuat.');
}
