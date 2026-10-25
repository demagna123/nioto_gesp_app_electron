import { EmployeeType } from "../constant";

export type Team = {
    id: number;
    name: string;
}

export type Employee = {
    id: number;
    employeeNumber: string | null;
    lastName: string;
    firstName: string;
    jobTitle: string;
    type: EmployeeType;
    hireDate: string; // "YYYY-MM-DD"
    email: string | null;
    isActive: boolean;
    team: Team | null; // car l'include Sequelize peut renvoyer null si pas d'équipe
}