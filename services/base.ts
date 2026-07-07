import { logger } from "@/lib/logger"
import type { BaseRepository } from "@/repositories/base"

export class BaseService<T, TCreate, TUpdate> {
  constructor(
    protected repository: BaseRepository<T, TCreate, TUpdate>,
    protected entityName: string
  ) {}

  async findById(id: string, organizationId: string): Promise<{ data?: T; error?: string }> {
    try {
      const data = await this.repository.findById(id, organizationId)
      if (!data) return { error: `${this.entityName} não encontrado(a)` }
      return { data }
    } catch (error) {
      logger.error({ error }, `Erro ao buscar ${this.entityName}`)
      return { error: `Erro ao buscar ${this.entityName}` }
    }
  }

  async findMany(organizationId: string, params?: any): Promise<{ data?: T[]; error?: string }> {
    try {
      const data = await this.repository.findMany(organizationId, params)
      return { data }
    } catch (error) {
      logger.error({ error }, `Erro ao listar ${this.entityName}s`)
      return { error: `Erro ao listar ${this.entityName}s` }
    }
  }

  async create(data: TCreate): Promise<{ data?: T; error?: string }> {
    try {
      const created = await this.repository.create(data)
      return { data: created }
    } catch (error) {
      logger.error({ error }, `Erro ao criar ${this.entityName}`)
      return { error: `Erro ao criar ${this.entityName}` }
    }
  }

  async update(id: string, organizationId: string, data: TUpdate): Promise<{ data?: T; error?: string }> {
    try {
      const existing = await this.repository.findById(id, organizationId)
      if (!existing) return { error: `${this.entityName} não encontrado(a)` }
      const updated = await this.repository.update(id, organizationId, data)
      return { data: updated }
    } catch (error) {
      logger.error({ error }, `Erro ao atualizar ${this.entityName}`)
      return { error: `Erro ao atualizar ${this.entityName}` }
    }
  }

  async delete(id: string, organizationId: string): Promise<{ success?: boolean; error?: string }> {
    try {
      const existing = await this.repository.findById(id, organizationId)
      if (!existing) return { error: `${this.entityName} não encontrado(a)` }
      await this.repository.softDelete(id, organizationId)
      return { success: true }
    } catch (error) {
      logger.error({ error }, `Erro ao excluir ${this.entityName}`)
      return { error: `Erro ao excluir ${this.entityName}` }
    }
  }
}
