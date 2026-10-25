export type Permission = {
    id: number;
    code: string;
    description: string;
    isGranted?: boolean; // Rempli uniquement dans le contexte d'un utilisateur
}