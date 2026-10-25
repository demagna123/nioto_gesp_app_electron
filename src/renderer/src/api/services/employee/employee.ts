import { Employee } from '@renderer/data/models/Employee'
import { handle } from '../../client'
import { EmployeeType } from '@renderer/data/constant'

// Type pour la création (ce que le back attend dans le body)
export type CreateEmployeePayload = {
  lastName: string
  firstName: string
  jobTitle: string
  type: EmployeeType
  hireDate: string // "YYYY-MM-DD"
  email?: string | null
}


export type UpdateEmployeePayload = {
    lastName?: string;
    firstName?: string;
    jobTitle?: string;
    email?: string | null;
    isActive?: boolean;
    teamId?: number | null;
}

export const employeeApi = {
  // Récupère la liste des employés
  getEmployees: async (filters?: {
    type?: EmployeeType
    isActive?: boolean
  }): Promise<Employee[]> => {
    const params = new URLSearchParams()
    if (filters?.type) params.append('type', filters.type)
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive))

    const queryString = params.toString()
    const path = queryString ? `/employees?${queryString}` : '/employees'

    const result = await window.api.request({ method: 'GET', path })
    return handle<Employee>(result).data
  },

  // Crée un nouvel employé
  createEmployee: async (payload: CreateEmployeePayload): Promise<Employee> => {
    const result = await window.api.request({
      method: 'POST',
      path: '/employees/create',
      body: payload
    })

    // Le back renvoie data: [employee], donc on prend le premier élément
    return handle<Employee>(result).data[0]
  },

   getEmployeeById: async (id: number): Promise<Employee> => {
        const result = await window.api.request({ method: "GET", path: `/employees/${id}` })
        return handle<Employee>(result).data[0]
    },

    // Met à jour un employé
    updateEmployee: async (id: number, payload: UpdateEmployeePayload): Promise<Employee> => {
        const result = await window.api.request({
            method: "PATCH",
            path: `/employees/${id}`,
            body: payload
        })
        return handle<Employee>(result).data[0]
    },
}
