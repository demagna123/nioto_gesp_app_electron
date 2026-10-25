// Forme commune de toutes les réponses du backend
export type ApiResponse<T> = {
    responseCode: string
    responseMessage: string
    data: T[] // toujours un tableau, même pour le détail (data[0])
}