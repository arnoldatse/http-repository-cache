/**
 * @template T - request body type
 * @template O - request options type
 */
export interface HttpRequestParams<T = unknown, O = unknown> {
    url: string;
    body?: T;
    headers?: Record<string, string>;
    successStatusCodes?: number[];
    contentTypeJSON?: boolean;
    options?: O;
}

/**
 * Interface representing an HTTP request adapter.
 * 
 * @template O - The type of the options parameter.
 */
export default interface HttpRequestAdapter<O = unknown> {
    /**
     * Builds the request header.
     * This method should be used to build the headers of all requests types.
     * 
     * @param httpRequestParams - The parameters for the HTTP request.
     * @returns The request header.
     */
    buildRequestHeader(httpRequestParams: HttpRequestParams<unknown, O>): Record<string, string>;

    /**
     * Sends a GET request.
     * 
     * @template R - The type of the response.
     * @param httpRequestParams - The parameters for the HTTP request.
     * @returns A promise that resolves to the response.
     */
    get<R>(httpRequestParams: HttpRequestParams<never, O>): Promise<R>;

    /**
     * Sends a POST request.
     * 
     * @template R - The type of the response.
     * @template B - The type of the request body.
     * @param httpRequestParams - The parameters for the HTTP request.
     * @returns A promise that resolves to the response.
     */
    post<R, B = unknown>(httpRequestParams: HttpRequestParams<B, O>): Promise<R>;

    /**
     * Sends a PATCH request.
     * 
     * @template R - The type of the response.
     * @template B - The type of the request body.
     * @param httpRequestParams - The parameters for the HTTP request.
     * @returns A promise that resolves to the response.
     */
    patch<R, B = unknown>(httpRequestParams: HttpRequestParams<B, O>): Promise<R>;

    /**
     * Sends a PUT request.
     * 
     * @template R - The type of the response.
     * @template B - The type of the request body.
     * @param httpRequestParams - The parameters for the HTTP request.
     * @returns A promise that resolves to the response.
     */
    put<R, B = unknown>(httpRequestParams: HttpRequestParams<B, O>): Promise<R>;

    /**
     * Sends a DELETE request.
     * 
     * @template R - The type of the response.
     * @param httpRequestParams - The parameters for the HTTP request.
     * @returns A promise that resolves to the response.
     */
    delete<R>(httpRequestParams: HttpRequestParams<never, O>): Promise<R>;
}