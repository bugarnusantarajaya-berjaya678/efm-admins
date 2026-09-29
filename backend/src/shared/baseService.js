/**
 * BaseService — establishes the route/controller → service → repository convention.
 * All PP module services extend this class.
 * Services own business validation; repositories own data access.
 */

export class BaseService {
  /** @param {BaseRepository} repository */
  constructor(repository) {
    this.repository = repository
  }

  async getById(id) {
    return this.repository.findById(id)
  }

  async list(options) {
    return this.repository.findAll(options)
  }
}
