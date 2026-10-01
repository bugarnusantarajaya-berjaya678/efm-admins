/**
 * Supabase Storage bucket setup script.
 * Run once after provisioning a new Supabase project:
 *   node scripts/setup-buckets.js
 *
 * Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment.
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const BUCKETS = [
  // Private buckets — access only via signed URLs
  { name: 'agreements',      public: false, fileSizeLimit: 10 * 1024 * 1024, allowedMimeTypes: ['application/pdf'] },
  { name: 'invoices',        public: false, fileSizeLimit: 10 * 1024 * 1024, allowedMimeTypes: ['application/pdf'] },
  { name: 'receipts',        public: false, fileSizeLimit: 10 * 1024 * 1024, allowedMimeTypes: ['application/pdf'] },
  { name: 'payment-proofs',  public: false, fileSizeLimit: 10 * 1024 * 1024, allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'] },
  { name: 'attendance',      public: false, fileSizeLimit: 20 * 1024 * 1024, allowedMimeTypes: ['image/jpeg', 'image/png'] },
  { name: 'attendance-raw',  public: false, fileSizeLimit: 20 * 1024 * 1024, allowedMimeTypes: ['image/jpeg', 'image/png'] },
  { name: 'pii-documents',   public: false, fileSizeLimit: 20 * 1024 * 1024, allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'] },
  { name: 'exports',         public: false, fileSizeLimit: 50 * 1024 * 1024, allowedMimeTypes: ['application/zip', 'application/json', 'text/csv'] },
  // Public bucket — company assets (logos, brochures)
  { name: 'company-assets',  public: true,  fileSizeLimit: 5  * 1024 * 1024, allowedMimeTypes: ['image/jpeg', 'image/png', 'image/svg+xml', 'application/pdf'] },
]

async function main() {
  console.log(`Setting up ${BUCKETS.length} Supabase Storage buckets...\n`)
  let created = 0
  let skipped = 0

  for (const bucket of BUCKETS) {
    const { data: existing } = await supabase.storage.getBucket(bucket.name)
    if (existing) {
      console.log(`  SKIP  ${bucket.name} (already exists)`)
      skipped++
      continue
    }

    const { error } = await supabase.storage.createBucket(bucket.name, {
      public:           bucket.public,
      fileSizeLimit:    bucket.fileSizeLimit,
      allowedMimeTypes: bucket.allowedMimeTypes,
    })

    if (error) {
      console.error(`  ERROR ${bucket.name}: ${error.message}`)
    } else {
      console.log(`  OK    ${bucket.name} (${bucket.public ? 'public' : 'private'})`)
      created++
    }
  }

  console.log(`\nDone. Created: ${created}, Skipped: ${skipped}`)
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
