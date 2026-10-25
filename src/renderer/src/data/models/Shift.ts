export type Shift = {
    id: number;
    name: "morning" | "afternoon" | "night";
    startTime: string; // "HH:MM:SS"
    endTime: string;   // "HH:MM:SS"
    crossesMidnight: boolean;
    isActive: boolean;
}