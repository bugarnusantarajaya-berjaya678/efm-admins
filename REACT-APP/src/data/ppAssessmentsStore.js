import { PP_ASSESSMENTS } from './ppAssessmentsData.js'

let _store = { ...PP_ASSESSMENTS }

export function getAllAssessments() {
  return _store
}

export function getAssessmentById(id) {
  const data = _store[id]
  return data ? { id, ...data } : null
}

export function getAssessmentByOrderId(orderId) {
  const entry = Object.entries(_store).find(([, a]) => a.orderId === orderId)
  return entry ? { id: entry[0], ...entry[1] } : null
}

export function getNextAssessmentId() {
  const yy = String(new Date().getFullYear()).slice(-2)
  const prefix = `SCR-${yy}-`
  const maxSeq = Object.keys(_store)
    .filter(k => k.startsWith(prefix))
    .reduce((max, k) => {
      const n = parseInt(k.slice(prefix.length), 10)
      return isNaN(n) ? max : Math.max(max, n)
    }, 0)
  return `${prefix}${String(maxSeq + 1).padStart(4, '0')}`
}

export function addAssessment(id, data) {
  _store = { ..._store, [id]: data }
}

export function updateAssessment(id, patch) {
  if (!_store[id]) return
  _store = { ..._store, [id]: { ..._store[id], ...patch } }
}
