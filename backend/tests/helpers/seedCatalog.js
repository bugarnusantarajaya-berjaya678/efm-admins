/**
 * Seed a minimal PP catalog for integration tests.
 * Returns { program, offering, package: pkg, price }
 */
import { query } from '../../src/db/index.js'

export async function seedCatalog() {
  const programId = 'PRG-TEST-01'
  const offeringId = 'OFF-TEST-01'
  const packageId = 'PKG-TEST-01'
  const priceId = 'PRC-TEST-01'

  await query(
    `INSERT INTO programs (id, module, name) VALUES ($1, 'PP', 'Private Training')
     ON CONFLICT (id) DO NOTHING`,
    [programId]
  )
  await query(
    `INSERT INTO offerings (id, program_id, name) VALUES ($1, $2, 'PT Standard')
     ON CONFLICT (id) DO NOTHING`,
    [offeringId, programId]
  )
  await query(
    `INSERT INTO packages (id, offering_id, name, session_count) VALUES ($1, $2, '12 Sesi - Pro', 12)
     ON CONFLICT (id) DO NOTHING`,
    [packageId, offeringId]
  )
  await query(
    `INSERT INTO package_prices (id, package_id, price) VALUES ($1, $2, 200000)
     ON CONFLICT (id) DO NOTHING`,
    [priceId, packageId]
  )

  return {
    programId,
    offeringId,
    packageId,
    unitPrice: 200000,
    sessionsTotal: 12,
    baseAmount: 200000 * 12,
  }
}

export async function seedPic() {
  const picId = 'PIC-26-0001'
  await query(
    `INSERT INTO pic_master (id, full_name, email, status)
     VALUES ($1, 'Test PIC', 'pic@test.com', 'active')
     ON CONFLICT (id) DO NOTHING`,
    [picId]
  )
  return picId
}
