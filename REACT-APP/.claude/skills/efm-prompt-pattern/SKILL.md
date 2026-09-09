---
name: efm-prompt-pattern
description: Workflow discipline and execution rules for Claude Code when working on the EFM V2 (Essential Fitness Management) React admin dashboard project — covers when to split a task into multiple chunks vs a single pass, the mandatory read-before-edit and scope-confirmation workflow, pre-build/post-build verification checklist, and project conventions like clone-first pattern reuse and preserving multi-tab pages. MUST be checked FIRST, before efm-design-standards and before writing any code, for every task in this project — new features, bug fixes, refactors, or edits of any size. Always consult this skill even for tasks that seem simple or fully specified, since skipping the read-first/scope-confirmation/build-verification discipline is a recurring source of broken or incomplete results in this project.
---

# EFM V2 Prompt & Workflow Pattern

Execution discipline for Claude Code on the EFM V2 project. This skill governs HOW to approach a task (chunking, reading, scoping, verifying) — for visual/styling rules, see the companion skill `efm-design-standards`.

## 1. When to Split a Task Into Multiple Chunks vs Single Prompt

**Split into multiple chunks** when ANY of these apply:
- Task touches more than ~3-4 distinct sections/components within one file
- Task requires BOTH significant new UI structure AND porting/duplicating complex logic from another file
- Task spans multiple files that each need substantial changes (not just a one-line import)
- The person's instructions describe more than 3 separate numbered changes/fixes in one message
- Estimated output would exceed ~300-400 lines of new/changed code in a single response

**Keep as single prompt** when:
- Task is confined to 1-2 sections of one file
- It's a targeted bug fix (e.g. "this button doesn't navigate correctly", "this font is too big")
- It's a straightforward clone of an existing pattern with minor adjustments
- Total estimated changes are under ~150 lines

**How to chunk (when splitting is needed):**
- Chunk 1 = foundational structure change (e.g. restructuring sections, adding new fields/state)
- Later chunks build on top of Chunk 1 (e.g. calculation logic, connecting components)
- Each chunk must end in a working, buildable state — never leave the codebase broken between chunks
- Explicitly tell the person which chunk is next and what it covers, so they know to wait before testing

**If a task arrives that should have been chunked but wasn't:** pause and recommend splitting, briefly explaining why (e.g. "this touches 5 sections and duplicates complex calculation logic — I recommend 2 passes to avoid errors"), rather than attempting the entire scope in one pass and risking an incomplete or broken result.

---

## 2. Standard Prompt Structure / Execution Steps

Every task follows this discipline, regardless of how the prompt is phrased.

**Step 1 — Always read before editing**
- Read the full target file(s) before making any changes, even if the prompt seems detailed enough to skip this
- If the task references another file as a pattern/template (e.g. "match the style of B2BOrderDetailPage.jsx"), read that reference file too before writing any code
- Never assume file structure or state from memory of a previous session — always verify current content first

**Step 2 — Confirm scope before writing code**
- Identify exactly which sections/components/tabs are in-scope
- Identify what is explicitly OUT of scope and must be preserved untouched
- If the prompt doesn't state what to leave alone, infer conservatively: assume everything not mentioned should be preserved exactly as-is, not improved or refactored as a side effect

**Step 3 — Execute with minimal blast radius**
- Prefer targeted edits (str_replace-style) over full file rewrites whenever possible
- Do not rename variables, reorganize imports, or "clean up" code that wasn't part of the requested change, even if it looks improvable
- Do not delete state, functions, or dummy data that might be used elsewhere without first checking if it's referenced elsewhere

**Step 4 — Flag ambiguity instead of guessing**
- If a requirement is ambiguous (e.g. unclear which of two existing patterns to follow, unclear exact field names), ask a clarifying question rather than picking an interpretation and proceeding
- Exception: minor implementation details (e.g. exact Tailwind spacing value) can be inferred from `efm-design-standards` without asking

**Step 5 — Communicate clearly what was done**
- After completing a task, summarize what was changed in plain language — which sections were touched, what was preserved, what to check visually
- If something couldn't be completed as described (e.g. a referenced file/component doesn't exist), state that clearly rather than silently skipping it or improvising a workaround

---

## 3. Pre-Build / Post-Build Checklist

**Before starting to write code:**
- [ ] Confirm the target file(s) have been read in full
- [ ] Confirm reference/pattern files (if mentioned) have been read
- [ ] Confirm scope boundaries are clear (in-scope vs must-preserve)
- [ ] If task should be chunked per Section 1, confirm chunking plan before writing code

**After making changes, before reporting completion:**
- [ ] Run `npm run build` (or `npm run dev` if build isn't applicable) to verify no errors
- [ ] If build fails, fix the error before reporting back — never report "done" with a known broken build
- [ ] Re-check that sections marked out-of-scope were not accidentally modified
- [ ] Verify no unused imports or dead state were left behind from removed code
- [ ] Verify dummy/placeholder data follows `efm-design-standards` ID formatting (if applicable)

**If build fails and the fix isn't obvious:**
- Report the exact error message to the person rather than attempting multiple blind fixes in a row
- Only attempt up to 2 self-corrections before pausing to report the issue clearly

---

## 4. Common Project Conventions

**Clone-first approach**
- This project has 3 parallel modules (PP, B2B, Event) with intentionally similar structure. When building something new in one module, always check if an equivalent already exists in another module first, and clone/adapt it rather than designing from scratch
- Example: B2B was used as the base pattern for Event and PP invoice pages, then adapted with module-specific fields
- When cloning, preserve the structural pattern (component layout, state shape, styling approach) but adapt terminology/fields to the target module

**Preserving multi-tab / multi-section pages**
- Several pages use a tab structure (e.g. Order Detail: Tab 1 Kontrak & Keuangan, Tab 2 Dokumen Kerjasama, Tab 3 Operasional Lapangan)
- When a task only concerns one tab, never touch code belonging to other tabs, even if in the same file and technically adjacent
- **Tab-merge decision after Related Records Panel conversion:** If converting a section to a Related Records Panel makes a tab too thin (e.g. the tab now only contains one small panel), merge that panel into the adjacent Overview/Kontrak tab as a standalone card — do not keep an almost-empty tab just to preserve tab count. Visual cue for pending-action panels: add `border-l-4 border-yellow-400` on the wrapper.

**No duplicate CTA buttons across header and tabs**
- Jika sebuah CTA (mis. "Buat Order", "Buat Invoice") sudah ada di dalam tab/section tertentu di badan halaman, JANGAN duplikat tombol yang sama di header action row halaman
- Duplikat membingungkan — user tidak tahu mana yang canonical, dan dua tombol dengan aksi identik di satu halaman adalah code smell
- Cara cek: sebelum menambahkan CTA ke header, baca semua tab/section di halaman tersebut untuk memastikan aksi yang sama belum ada di tempat lain

**Reuse vs duplicate decision**
- Default to duplicating structure/logic across files rather than extracting shared reusable components, UNLESS explicitly instructed to refactor into a shared component
- Reasoning: this project prioritizes shipping working UI quickly with dummy data first; component extraction is a deliberate later "polish" pass, not a default choice during feature-building

**Dummy data conventions**
- All dummy data must follow ID formats from `efm-design-standards`
- Use realistic Indonesian names, company names, and amounts (IDR) — not placeholder text like "Test Company" or "John Doe"
- Dates should be realistic relative to the current project timeline (2026)

**Dummy data sync on format change**
- Ketika format value sebuah field berubah (contoh: `programLatihan` berubah dari `"12 Sesi - Pro"` menjadi `"Private Training — 12 Sesi - Pro"`), SEMUA data existing di `*Data.js` terkait WAJIB diupdate mengikuti format baru
- Tidak sync menyebabkan tampilan tidak konsisten antara data baru dan data lama
- Setelah mengubah format apapun, grep field terkait di semua `*Data.js` dan update setiap entri

**Info Perusahaan sync — getCompanySettings() convention**
- Semua PP pages (Invoice, Receipt, Agreement, Documents, Leads) WAJIB membaca data perusahaan dari `getCompanySettings()` di `src/utils/companySettings.js` — TIDAK boleh hardcode nama perusahaan, alamat, email, atau rekening bank
- Import: `import { getCompanySettings } from '../../utils/companySettings'`
- Panggil di dalam komponen atau fungsi yang membutuhkannya: `const cs = getCompanySettings()`
- Field yang tersedia: `namaPerusahaan`, `namaLegal`, `alamat`, `email`, `telepon`, `website`, `whatsapp`, `namaBank`, `nomorRekening`, `atasNamaRekening`, `rekeningList` (array multi-bank), `logoPerusahaan`, `tandaTanganCEO`, `namaPenandatangan`, `jabatanPenandatangan`
- `rekeningList` adalah array `[{ bank, rek, an }]` — gunakan ini untuk daftar rekening di invoice/receipt, dengan fallback: `(cs.rekeningList || [{ bank: cs.namaBank, rek: cs.nomorRekening, an: cs.atasNamaRekening }])`
- Untuk template teks (syarat & ketentuan, WA message): ubah dari konstanta array statis menjadi fungsi yang memanggil `getCompanySettings()` di dalamnya, agar nilai selalu fresh
- Jika sebuah file punya private `getCompanySettings()` sendiri yang return `{}` saat localStorage kosong — HAPUS dan ganti dengan import dari utility (yang return defaults lengkap saat localStorage kosong)

**PR chaining merge conflict pattern**
- Project ini menggunakan squash merge ke main. Ketika PR di-chain pada branch yang sama, setiap PR baru yang menambahkan import di file yang sama dengan PR sebelumnya akan menyebabkan merge conflict saat push berikutnya
- Lokasi konflik yang sering terjadi: bagian import di file yang terus bertambah importnya antar-PR (contoh: `PPFitnessAssessmentPage.jsx` import tumbuh dari PR #101 sampai #104)
- Fix: `git fetch origin main && git merge origin/main` → resolve conflict dengan keep HEAD (semua akumulasi import/logic baru) → `npm run build` → commit → push → retry merge
- Saat resolve: konflik di import block → keep HEAD; konflik di logic block → keep HEAD dan verifikasi correctness

**PP Module — PIC (trainer) data lookup**
- `PROGRAMS_INIT` di `ppProgramDBData.js` menyimpan `picId` sebagai string (contoh: `'EFM-PIC-003'`) — BUKAN embedded object `pic: { nama: '...' }`
- Untuk mendapatkan data trainer, selalu lookup via `PIC_DB[prog.picId]` — import dari `ppProgramDBData.js`
- Jangan gunakan `prog?.pic?.nama` — ini akan selalu undefined dan menyebabkan nama pelatih tidak muncul di halaman
- Pattern yang benar:
  ```js
  import { PIC_DB } from '../../data/ppProgramDBData'
  // di dalam komponen:
  const picData = prog ? (PIC_DB[prog.picId] || null) : null
  // Gunakan: picData?.fullname, picData?.spesialis, picData?.biayaSesi
  ```

**PP Invoice — view-only; semua edit dari Order Detail**
- `PPInvoiceDetailPage.jsx` adalah **read-only** — tidak ada tombol "Edit Invoice" di halaman ini. Jangan tambahkan sticky footer edit ke file ini.
- Semua field yang tampil di invoice (kode promo, biaya tambahan, tanggal invoice, jatuh tempo, catatan) hanya bisa diubah dari `PPOrderDetailPage.jsx` di section "Detail Program & Operasional" saat edit mode aktif.
- B2B dan Event Invoice tetap punya edit mode lengkap — aturan ini khusus PP.

**`toPaket()` — wajib map `diskonPaket`**
- Fungsi `toPaket(p)` di `PPOrderDetailPage.jsx` memetakan record program DB ke objek UI. Selalu sertakan `diskonPaket: p.diskonPaket || 0` di return object-nya.
- Tanpa ini, diskon paket yang sudah diset di `ppProgramDBData.js` tidak akan pernah muncul di invoice.

**`saveInfoDeal()` — wajib sync promo ke invoice**
- Setiap kali `saveInfoDeal()` menyimpan perubahan order, semua field promo harus di-sync ke invoice terkait via `invChanges`:
  ```js
  const invChanges = {
    // ... field lain,
    promoKode:         promoApplied?.kode || '',
    promoType:         promoApplied?.subTipe || '',
    promoTema:         promoApplied?.tema || null,
    promoBenefitBonus: promoApplied?.tipe === 'bonus' ? (promoApplied.keterangan || promoApplied.benefitBonus || null) : null,
    promoVal:          finalPromoVal,
  }
  ```
- Dan ke order store via `updateOrder()`:
  ```js
  updateOrder(order.id, {
    // ... field lain,
    promoKode:         promoApplied?.kode || '',
    promoType:         promoApplied?.subTipe || '',
    promoTema:         promoApplied?.tema || null,
    promoBenefitBonus: promoApplied?.tipe === 'bonus' ? ... : null,
    nilaiDiskon:       finalPromoVal,
  })
  ```
- Jangan hanya simpan ke salah satu — order dan invoice harus selalu sinkron.

---

## 5. Claude Code Web — Branch & PR Workflow

- Setiap task dikerjakan di branch terpisah, hasil akhir berupa PR
- Jangan kerjakan banyak task besar secara paralel di branch berbeda tanpa sepengetahuan pengguna - selesaikan dan minta merge 1 task dulu sebelum mulai task besar berikutnya, supaya tidak ada branch menumpuk yang belum di-review
- Task kecil/independen (bug fix satu file, ubah teks) boleh langsung jalan tanpa menunggu PR sebelumnya di-merge
- Setelah build sukses tapi SEBELUM melapor selesai, jalankan pengecekan skill (lihat skill efm-skill-maintenance)

**Mendapatkan link Vercel Preview yang benar:**
- JANGAN konstruksi URL preview secara manual dari nama branch. Formula `efm-admins-git-[nama-branch]-bugar-nusantara-jaya.vercel.app` hanya benar kalau nama branch pendek (< 40 karakter termasuk prefix `efm-admins-git-` dan suffix `-bugar-nusantara-jaya`). Branch dengan nama panjang akan di-truncate oleh Vercel dan ditambah hash acak — URL yang dikonstruksi manual TIDAK BISA dibuka.
- Setelah PR dibuat, selalu panggil `mcp__github__pull_request_read` dengan method `get_comments` untuk membaca komentar Vercel bot di PR tersebut. Komentar Vercel bot berisi field `previewUrl` yang merupakan URL yang benar dan bisa dibuka.
- Ambil URL preview dari komentar itu (bukan dari formula), lalu sertakan di laporan akhir ke pengguna.

**Cek merge conflict setelah push — WAJIB sebelum lapor selesai:**
- Setelah push dan PR dibuat/diperbarui, SELALU cek apakah PR punya merge conflict menggunakan `mcp__github__pull_request_read`
- Cek field `mergeable` dan `mergeable_state` di response — jika `mergeable: false` atau `mergeable_state: "dirty"`, ada conflict
- Jika ada conflict: resolve LANGSUNG saat itu juga di branch yang sama, JANGAN tunggu pengguna melaporkan
  1. `git fetch origin main && git merge origin/main`
  2. Resolve conflict — untuk squash merge project ini: keep HEAD untuk import dan logic baru milik kita; keep origin/main untuk bagian yang memang baru di main (bukan milik kita)
  3. `npm run build` untuk verifikasi
  4. `git add` + `git commit` (merge commit) + `git push`
- Baru laporkan PR ke pengguna setelah dipastikan `mergeable: true`
- Ini menghemat 1 round-trip interaction yang selalu berulang ("masih ada conflict" → resolve → lapor ulang)

**Stop push setelah pengguna konfirmasi merge:**
- Begitu pengguna berkata "ya merge" atau "sudah merge", HENTIKAN semua push ke branch tersebut — meskipun ada follow-up yang ingin di-commit (skill update, typo fix, dll)
- Alasan: push ke branch yang sudah/akan di-merge akan membuat PR "Already merged" tapi branch masih ada commit baru, yang memaksa pengguna buka PR lama atau buat PR baru yang membingungkan
- Jika ada sesuatu yang belum selesai saat pengguna konfirmasi merge: catat dulu, buat branch baru setelah merge selesai, lanjutkan di sana
- Skill updates yang baru disadari setelah konfirmasi merge → buat branch baru, JANGAN push ke branch yang sedang/sudah di-merge

**Buat PR sebagai ready-for-review, bukan draft — mencegah rate limit saat merge:**
- JANGAN buat PR dengan `draft: true`. Selalu buat PR dalam status **ready for review** (`draft: false` atau omit parameter `draft`).
- Alasan: GitHub API rate limit untuk akun ini (user ID 289648120) terkena sangat mudah. Merge PR yang masih draft membutuhkan 2 API call: (1) undraft → (2) merge. Jika call pertama kena rate limit, PR tidak bisa di-merge via API sama sekali — pengguna harus merge manual. Buat PR langsung ready memangkas kebutuhan menjadi 1 API call saja.
- Saat pengguna berkata "ya merge": langsung panggil `mcp__github__merge_pull_request` dengan `merge_method: "squash"` — tanpa perlu undraft terlebih dahulu.
- Jika merge tetap gagal karena rate limit: beritahu pengguna dan sertakan link PR langsung (`https://github.com/bugarnusantarajaya-berjaya678/efm-admins/pull/<nomor>`) agar bisa merge manual. JANGAN retry API call berkali-kali.
- **KRITIS — setelah menyuruh merge manual: HENTIKAN semua push ke branch.** Pengguna kemungkinan besar langsung merge manual saat itu juga. Push commit baru setelah itu = commit masuk ke branch yang sudah di-merge, TIDAK akan ikut di-squash.
- **Sebelum panggil `merge_pull_request`: selalu cek dulu PR masih open.** Panggil `pull_request_read` dan cek field `state === "open"`. Jika `state === "closed"` atau `merged === true`, PR sudah di-merge sebelumnya — `merge_pull_request` akan return state lama (`"merged": true`) tanpa error, yang terlihat seperti sukses baru padahal bukan. Commit-commit setelah merge manual tidak akan ikut masuk main.

**⛔ WAJIB SETELAH PR DI-MERGE — sync branch sebelum sentuh apapun:**
- Begitu pengguna mengkonfirmasi PR sudah di-merge (atau kita tahu PR sudah merged via API), LANGSUNG jalankan ini sebelum task apapun:
  ```bash
  git fetch origin main && git merge origin/main
  ```
- **Tidak ada pengecualian.** Task kecil, fix 1 baris, update teks — semuanya tetap harus sync dulu. Squash merge selalu membuat branch diverge dari main, sehingga setiap push berikutnya tanpa sync = conflict.
- Jika ada conflict saat merge: `git checkout --ours <file-yang-conflict>` → `git add` → `npm run build` → commit merge → push.
- **Jangan tunggu GitHub menampilkan "This branch has conflicts."** Lakukan proaktif sebelum menulis satu baris kode pun.
- Pelanggaran aturan ini adalah penyebab utama conflict berulang di project ini.

**Branch reset setelah squash merge — WAJIB sebelum task berikutnya:**
- Project ini squash merge ke main. Setelah PR di-merge, branch lama punya riwayat commit yang sudah tidak relevan — main punya squash commit baru yang tidak ada di branch. Task berikutnya di branch yang sama = conflict hampir pasti.
- Sebelum memulai task baru APAPUN di branch yang sudah pernah di-merge, selalu reset branch ke main terlebih dahulu:
  ```bash
  git fetch origin main
  git checkout -B <nama-branch> origin/main
  git push --force-with-lease origin <nama-branch>
  ```
- Baru setelah reset → buat perubahan → commit → push → buat PR baru
- Ini menghilangkan conflict sama sekali karena branch selalu mulai dari tip main yang bersih
- Cek apakah branch sudah pernah di-merge: `git log --oneline origin/main..HEAD` — jika tidak ada output (0 commit ahead), branch sudah sinkron. Jika ada commit yang tidak seharusnya ada (commit lama dari PR yang sudah di-merge), lakukan reset.
- `--force-with-lease` aman dipakai di sini karena kita sengaja reset branch kerja ke main, bukan menghapus commit orang lain

**⛔ SATU COMMIT PER PR — squash merge hanya menjamin commit yang sudah ada saat merge terjadi:**
- Squash merge project ini terbukti bermasalah ketika PR punya banyak commit yang di-push secara bertahap: commit terakhir sering tidak ikut masuk ke squash result, terutama saat merge dilakukan manual oleh pengguna di antara push-push tersebut.
- **Aturan wajib:** Sebelum meminta approval merge, pastikan SEMUA perubahan sudah dalam **satu commit tunggal** di branch. Jika ada perubahan tambahan setelah commit pertama, consolidate dulu:
  ```bash
  # Jika belum push: amend commit terakhir
  git add <file> && git commit --amend --no-edit

  # Jika sudah push sebelumnya tapi belum ada PR: squash lokal
  git reset --soft HEAD~N  # N = jumlah commit yang ingin digabung
  git commit -m "pesan commit baru yang menggabungkan semua"
  git push --force-with-lease
  ```
- **Jangan buat PR dulu saat masih ada perubahan yang belum selesai.** Selesaikan semua, build hijau, baru satu commit, baru PR.
- Jika karena sesuatu hal perlu push commit tambahan ke PR yang sudah ada: lakukan SEBELUM minta merge approval. Setelah pengguna bilang "ya", STOP — jangan push apapun lagi.
- Pola yang terbukti bekerja: 1 PR = 1 commit = 1 squash commit di main yang berisi semua perubahan.

**✅ Verifikasi isi file setelah branch reset — jangan asumsikan main sudah benar:**
- Setelah branch reset ke main, jangan langsung mulai task baru. READ dulu file-file kunci yang seharusnya berubah dari PR terakhir untuk memastikan perubahan benar-benar masuk ke main.
- Cara cek cepat: baca section yang baru diubah dan bandingkan dengan expected state. Jika ternyata file masih di state lama (commit terakhir tidak ikut squash), apply ulang perubahan tersebut sebagai commit baru SEBELUM melanjutkan task berikutnya.
- Jangan tunggu pengguna melaporkan bahwa halaman "tidak berubah" — proaktif verifikasi setelah setiap reset.
- Contoh yang pernah terjadi: 3 PR berturut-turut (461, 462, 463) karena commit 4-col flat grid tidak ikut squash di PR #461 maupun #462. Seharusnya terdeteksi dan difix langsung setelah reset pertama.

**⛔ WAJIB: Verifikasi konten di main SEBELUM lapor "Merged" ke pengguna:**
- Setelah merge berhasil (via API maupun konfirmasi manual dari pengguna), JANGAN langsung lapor "Merged. X sudah masuk ke main."
- Selalu jalankan dulu cek satu baris kunci:
  ```bash
  git fetch origin main
  git show origin/main:REACT-APP/path/to/file.jsx | grep "kata_kunci_perubahan"
  ```
- Jika output muncul → perubahan masuk → baru lapor ke pengguna
- Jika output TIDAK muncul → perubahan tidak ikut squash → apply ulang sebagai commit baru, push, buat PR baru, BARU lapor
- Ini mencegah pengguna membuka browser dan mendapati halaman tidak berubah — yang menyebabkan round-trip debugging yang sia-sia

**🔄 Workflow "ya + task baru" dalam satu pesan:**
- Ketika pengguna menjawab "ya" untuk merge SEKALIGUS memberi task baru di pesan yang sama, urutan eksekusinya WAJIB:
  1. Selesaikan merge (API atau minta manual) → verifikasi konten di main (lihat di atas)
  2. `git fetch origin main && git checkout -B <branch> origin/main && git push --force-with-lease` — reset branch ke main yang sudah include hasil merge
  3. BARU mulai kerjakan task baru dari branch yang bersih
- Jangan skip step 2 meskipun task baru terasa kecil. Branch yang tidak di-reset setelah squash merge PASTI conflict di push berikutnya.
- Kalau reset (`git checkout -B`) ditolak oleh permission classifier, gunakan alternatif: `git fetch origin main && git merge origin/main` untuk sync, lalu jika ada conflict resolve dengan keep HEAD

**🔍 Session start check — cek kondisi branch saat awal sesi:**
- Di awal setiap sesi baru (konteks sebelumnya sudah ter-compress), jalankan ini sebelum mengerjakan apapun:
  ```bash
  git fetch origin main
  git log --oneline origin/main..HEAD  # Jika ada output = branch punya commit yang belum/tidak di-merge
  ```
- Jika ada commit di branch yang tidak ada di main (bukan karena task sedang berjalan):
  - Cek apakah PR untuk commit itu masih open atau sudah merged
  - Jika PR sudah merged tanpa commit ini → commit "terjatuh", apply ulang
  - Jika PR sudah closed/tidak relevan → reset branch ke main
- Jangan asumsikan kondisi branch dari memori sesi sebelumnya — selalu verifikasi dari git state aktual
