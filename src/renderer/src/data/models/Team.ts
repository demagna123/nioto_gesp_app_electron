import { Employee } from "./Employee";

export type Team = {
    id: number;
    name: string;
    description: string
    membersCount: number;
    isActive:boolean
    employees?: Employee[];
}

