import { query } from '../../db/index.js'
import { notFound } from '../../shared/errors.js'
import {
  getAllPrograms, getProgramById,
  getOfferingsByProgram, getOfferingById,
  getPackagesByOffering, getPackageById,
  getCurrentPrice,
} from './catalog.repository.js'

export async function listPrograms() {
  return getAllPrograms()
}

export async function getProgram(id) {
  const program = await getProgramById(id)
  if (!program) throw notFound('Program', id)
  return program
}

export async function listOfferings(programId) {
  if (programId) {
    await getProgram(programId) // throws if not found
    return getOfferingsByProgram(programId)
  }
  const { rows } = await query(`SELECT * FROM offerings ORDER BY created_at ASC`)
  return rows
}

export async function getOffering(id) {
  const offering = await getOfferingById(id)
  if (!offering) throw notFound('Offering', id)
  return offering
}

export async function listPackages(offeringId) {
  if (offeringId) {
    await getOffering(offeringId) // throws if not found
    return getPackagesByOffering(offeringId)
  }
  const { rows } = await query(
    `SELECT p.*, pp.price
     FROM packages p
     LEFT JOIN package_prices pp ON pp.package_id = p.id
       AND pp.effective_from <= NOW() AND (pp.effective_to IS NULL OR pp.effective_to > NOW())
     ORDER BY p.created_at ASC`
  )
  return rows
}

export async function getPackage(id) {
  const pkg = await getPackageById(id)
  if (!pkg) throw notFound('Package', id)
  return pkg
}

/**
 * Resolve current price for a package. Throws if no active price exists.
 */
export async function resolvePackagePrice(packageId) {
  const priceRow = await getCurrentPrice(packageId)
  if (!priceRow) throw notFound('Price', `package:${packageId}`)
  return parseFloat(priceRow.price)
}
