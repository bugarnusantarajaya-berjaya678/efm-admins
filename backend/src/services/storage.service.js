/**
 * Supabase Storage Service — Phase 3.
 *
 * All storage operations go through this module.
 * The frontend NEVER receives the service_role key and NEVER calls Storage directly.
 * The backend generates short-lived signed URLs (1 hour default) for every object read.
 *
 * Lazy initialises the Supabase client on first use.
 * Throws a clear error if SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set.
 */

import { createClient } from '@supabase/supabase-js'
import { env } from '../config/env.js'

let _supabase = null

function getSupabase() {
  if (_supabase) return _supabase

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'Supabase storage is not configured. ' +
      'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.'
    )
  }

  _supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  return _supabase
}

/**
 * Upload a file buffer to a Supabase Storage bucket.
 *
 * @param {string} bucket   - bucket name (e.g. 'payment-proofs')
 * @param {string} path     - object path within bucket (e.g. 'PP-26-0001/PAY-PP-26-0001.jpg')
 * @param {Buffer} buffer   - file content
 * @param {string} mimeType - MIME type (e.g. 'image/jpeg')
 * @returns {Promise<string>} the stored path (same as `path` parameter)
 */
export async function uploadFile(bucket, path, buffer, mimeType) {
  const supabase = getSupabase()
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType: mimeType,
      upsert: false,
    })
  if (error) throw new Error(`Storage upload failed [${bucket}/${path}]: ${error.message}`)
  return path
}

/**
 * Replace an existing file (upsert).
 * Use for updating a file that already exists (e.g. re-generated PDF).
 */
export async function replaceFile(bucket, path, buffer, mimeType) {
  const supabase = getSupabase()
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType: mimeType,
      upsert: true,
    })
  if (error) throw new Error(`Storage replace failed [${bucket}/${path}]: ${error.message}`)
  return path
}

/**
 * Generate a short-lived signed URL for a stored object.
 *
 * @param {string} bucket     - bucket name
 * @param {string} path       - object path
 * @param {number} expiresIn  - seconds until URL expires (default: 3600 = 1 hour)
 * @returns {Promise<string>} signed URL
 */
export async function getSignedUrl(bucket, path, expiresIn = 3600) {
  const supabase = getSupabase()
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)
  if (error) throw new Error(`Failed to create signed URL [${bucket}/${path}]: ${error.message}`)
  return data.signedUrl
}

/**
 * Delete one or more files from a bucket.
 *
 * @param {string} bucket   - bucket name
 * @param {string[]} paths  - object paths to delete
 */
export async function deleteFiles(bucket, paths) {
  if (!paths.length) return
  const supabase = getSupabase()
  const { error } = await supabase.storage.from(bucket).remove(paths)
  if (error) throw new Error(`Storage delete failed [${bucket}]: ${error.message}`)
}

/** Convenience single-file delete. */
export async function deleteFile(bucket, path) {
  return deleteFiles(bucket, [path])
}

/**
 * Validate a file buffer's MIME type by reading magic bytes.
 * Prevents MIME-sniffing attacks where the Content-Type header is forged.
 *
 * @param {Buffer} buffer
 * @param {string[]} allowedMimes - list of allowed MIME types
 * @throws {Error} if the detected type is not in allowedMimes
 */
export function validateMagicBytes(buffer, allowedMimes) {
  const detected = detectMimeType(buffer)
  if (!allowedMimes.includes(detected)) {
    throw new Error(
      `Invalid file type: detected ${detected ?? 'unknown'}, ` +
      `allowed: ${allowedMimes.join(', ')}`
    )
  }
  return detected
}

function detectMimeType(buffer) {
  if (!buffer || buffer.length < 4) return null

  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return 'image/jpeg'
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buffer[0] === 0x89 && buffer[1] === 0x50 &&
      buffer[2] === 0x4E && buffer[3] === 0x47) {
    return 'image/png'
  }
  // PDF: 25 50 44 46 (%PDF)
  if (buffer[0] === 0x25 && buffer[1] === 0x50 &&
      buffer[2] === 0x44 && buffer[3] === 0x46) {
    return 'application/pdf'
  }
  return null
}
