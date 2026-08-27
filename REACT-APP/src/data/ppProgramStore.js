import { PROGRAMS_INIT } from './ppProgramDBData'

let _programs = null

function init() {
  if (!_programs) _programs = PROGRAMS_INIT.map(p => ({ ...p }))
}

export function getStoredPrograms() {
  init()
  return _programs
}

export function getProgramById(id) {
  init()
  return _programs.find(p => p.id === id) || null
}

export function addStoredProgram(prog) {
  init()
  _programs = [..._programs, prog]
}

export function updateStoredProgram(id, updates) {
  init()
  _programs = _programs.map(p => p.id === id ? { ...p, ...updates } : p)
}

export function deleteStoredProgram(id) {
  init()
  _programs = _programs.filter(p => p.id !== id)
}

export function getExistingIds() {
  init()
  return _programs.map(p => p.id)
}
