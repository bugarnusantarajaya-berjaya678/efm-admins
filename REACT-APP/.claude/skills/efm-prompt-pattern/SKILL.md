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
