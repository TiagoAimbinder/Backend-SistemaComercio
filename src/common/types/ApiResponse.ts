/**
 * Formato de respuesta compartido con el front (core/models/response.model.ts).
 */
export type Pagination = {
    page: number,
    totalPages: number,
    total?: number,
    limit: number,
};

export type ApiResponse<T = undefined> = {
    message: string,
    data?: T,
    pagination?: Pagination,
};

export type ApiError = {
    message: string,
    errCode: string,
};
