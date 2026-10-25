import { Team } from '@renderer/data/models/Team'
import { handle } from '../../client'
import { Employee } from '@renderer/data/models/Employee'

// Type pour la création (ce que le back attend dans le body)
export type CreateTeamPayload = {
  name: string
  description: string
  isActive: boolean
}

export type UpdateTeamPayload = {
  name: string
  description: string
  isActive: boolean
}

export const teamApi = {
  // Récupère la liste des employés
  getTeams: async (filters?: { isActive?: boolean }): Promise<Team[]> => {
    const params = new URLSearchParams()

    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive))

    const queryString = params.toString()
    const path = queryString ? `/teams?${queryString}` : '/teams'

    const result = await window.api.request({ method: 'GET', path })
    return handle<Team>(result).data
  },

  // Crée un nouvel employé
  createTeam: async (payload: CreateTeamPayload): Promise<Team> => {
    const result = await window.api.request({
      method: 'POST',
      path: '/teams/create',
      body: payload
    })

    // Le back renvoie data: [employee], donc on prend le premier élément
    return handle<Team>(result).data[0]
  },

  getTeamById: async (id: number): Promise<Team> => {
    const result = await window.api.request({ method: 'GET', path: `/teams/${id}` })
    return handle<Team>(result).data[0]
  },

  // Met à jour un employé
  updateTeam: async (id: number, payload: UpdateTeamPayload): Promise<Team> => {
    const result = await window.api.request({
      method: 'PATCH',
      path: `/teams/${id}`,
      body: payload
    })
    return handle<Team>(result).data[0]
  },

  // Dans teamApi
  addMember: async (employeeId: number, teamId: number): Promise<Employee> => {
    const result = await window.api.request({
      method: 'PATCH',
      path: `/employees/${employeeId}`,
      body: { teamId }
    })
    return handle<Employee>(result).data[0]
  },

  removeMember: async (employeeId: number): Promise<Employee> => {
    const result = await window.api.request({
      method: 'PATCH',
      path: `/employees/${employeeId}`,
      body: { teamId: null }
    })
    return handle<Employee>(result).data[0]
  },

  // Dans teamApi
assignEmployees: async (teamId: number, employeeIds: number[]): Promise<Team> => {
    const result = await window.api.request({
        method: "POST",
        path: `/teams/${teamId}/assign`,
        body: { employeeIds }
    })
    return handle<Team>(result).data[0]
},


}
