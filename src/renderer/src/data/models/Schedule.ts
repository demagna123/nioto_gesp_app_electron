export type Schedule = {
    id: number;
    weekStartDate: string; // "YYYY-MM-DD"
    employeeId: number;
    shiftId: number;
    originTeamId: number | null;
    employee: {
        id: number;
        employeeNumber: string | null;
        lastName: string;
        firstName: string;
        jobTitle: string;
    };
    shift: {
        id: number;
        name: "morning" | "afternoon" | "night";
    };
    originTeam: {
        id: number;
        name: string;
    } | null;
}