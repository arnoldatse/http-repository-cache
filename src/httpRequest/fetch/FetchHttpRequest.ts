import DefaultHttpExceptionType from "../exception/DefaultHttpExceptionType";
import HttpException from "../exception/HttpException";
import HttpMethod from "../HttpMethod";
import HttpRequestAdapter, { HttpRequestParams } from "../HttpRequestAdapter";

export interface FetchRequestOptions extends Omit<RequestInit, "method" | "headers" | "body"> { }

/**
 * A class that implements the `HttpRequestAdapter` interface using the Fetch API.
 * This class provides methods for making HTTP requests with various HTTP methods
 * (GET, POST, PATCH, PUT, DELETE) and includes support for authentication tokens,
 * custom error handling, and credentials.
 *
 * @template T - The type of the response custom http exception type. Defaults to `unknown`.
 */
export default class FetchHttpRequest<T = unknown> implements HttpRequestAdapter<FetchRequestOptions> {
  /**
   * The authentication token used for making HTTP requests.
   * This token is used to authenticate the user and authorize access to resources.
   * It can be null if no token is available or the user is not authenticated.
   * 
   * @default null
   */
  private authToken: string | null = null;

  /**
   * Indicates whether credentials such as cookies, authorization headers, or TLS client certificates 
   * should be included with the request. Defaults to `false`.
   */
  private _includeCredentials: boolean = false;

  /**
   * A custom error status handling function that can be used to handle HTTP response status codes.
   * This function takes a status code and an optional response body as parameters.
   * It can either perform some side effects and return void, or it can return an instance of `HttpException<T>`.
   * 
   * @param status - The HTTP status code of the response.
   * @param body - Optional. The body of the response.
   * @returns Either void or an instance of `HttpException<T>`.
   * 
   * @default null
   */
  private customErrorStatusHandling: ((status: number, body?: unknown) => void | HttpException<T>) | null = null;

  /**
   * Sets the authorization token to be used in HTTP requests.
   *
   * @param authToken - The token to be set for authorization.
   */
  setAuthToken(authToken: string): void {
    this.authToken = authToken;
  }

  /**
   * Removes the authentication token from the current instance.
   * This method sets the `authToken` property to `null`, effectively
   * removing any stored authentication token.
   */
  removeAuthToken(): void {
    this.authToken = null;
  }

  /**
   * Enables the inclusion of credentials (such as cookies, authorization headers, or TLS client certificates)
   * in the HTTP request. When this method is called, the request will be sent with credentials.
   */
  includeCredentials(): void {
    this._includeCredentials = true;
  }

  /**
   * Disables the inclusion of credentials in the HTTP request.
   * This method sets the `_includeCredentials` property to `false`,
   * ensuring that credentials such as cookies or authorization headers
   * are not sent with the request.
   */
  notIncludeCredentials(): void {
    this._includeCredentials = false;
  }

  /**
   * Sets a custom error status handling function.
   *
   * @param customErrorStatusHandling - A function that takes an HTTP status code and an optional response body,
   * and either returns void or an instance of `HttpException<T>`.
   */
  setCustomErrorStatusHandling(customErrorStatusHandling: (status: number, body?: unknown) => void | HttpException<T>): void {
    this.customErrorStatusHandling = customErrorStatusHandling;
  }

  /**
   * Unset the custom error status handling by setting it to null.
   * This method is used to remove any previously set custom error status handling logic.
   */
  unsetCustomErrorStatusHandling(): void {
    this.customErrorStatusHandling = null;
  }

  /**
   * Generates the authorization header if an authentication token is available.
   *
   * @returns An object containing the Authorization header with the Bearer token,
   *          or undefined if no authentication token is present.
   */
  private getAuthorizationHeader() {
    return (
      this.authToken && {
        Authorization: `Bearer ${this.authToken}`,
      }
    );
  }

  /**
   * Constructs and returns the headers for an HTTP request.
   *
   * @param headers - Optional additional headers to include in the request.
   * @param conteTypeJSON - A boolean indicating whether to include the "Content-Type: application/json" header. Defaults to true.
   * @returns An object containing the combined headers.
   */
  private getHeaders(headers?: Record<string, string>, conteTypeJSON = true) {
    return {
      ...headers,
      ...(conteTypeJSON && { "Content-Type": "application/json" }),
      ...this.getAuthorizationHeader(),
    };
  }

  /**
   * Generates and throws an HttpException based on the provided status code and optional body.
   * If custom error status handling is set, it will use the custom handler to generate the exception.
   * Otherwise, it will use the default exception handling based on the status code.
   *
   * @param status - The HTTP status code.
   * @param body - Optional. The body of the HTTP response.
   * @throws {HttpException<T>} - Throws an HttpException with a type corresponding to the status code.
   */
  private generateException = (status: number, body?: unknown): HttpException<T> => {
    //if custom exception handling is set, use it
    if (this.customErrorStatusHandling) {
      const customHttpException = this.customErrorStatusHandling(status, body);
      if (customHttpException) {
        throw customHttpException;
      }
    }

    //if no custom status error handling thrown HttpException proceed default exception handling
    switch (status) {
      case 400:
        throw {
          type: DefaultHttpExceptionType.BAD_REQUEST,
          body
        };
      case 401:
        throw {
          type: DefaultHttpExceptionType.UNAUTHORIZED,
          body
        };
      case 402:
        throw {
          type: DefaultHttpExceptionType.PAYMENT_REQUIRED,
          body
        };
      case 403:
        throw {
          type: DefaultHttpExceptionType.FORBIDDEN,
          body
        };
      case 404:
        throw {
          type: DefaultHttpExceptionType.NOT_FOUND,
          body
        };
      case 409:
        throw {
          type: DefaultHttpExceptionType.CONFLICT,
          body
        };
      case 500:
        throw {
          type: DefaultHttpExceptionType.SERVER_ERROR,
          body
        };
      case 503:
        throw {
          type: DefaultHttpExceptionType.SERVER_UNAVAILABLE,
          body
        };
      default:
        throw {
          type: DefaultHttpExceptionType.UNKNOWN_ERROR,
          body
        };
    }
  }

  /**
   * Handles errors from HTTP requests.
   *
   * @param response - The response object which can be an Error or HttpException.
   * @throws {Object} Throws an object with a type of `DefaultHttpExceptionType.ABORT_REQUEST` if the error is an AbortError.
   * @throws {HttpException} Throws the response if it is an HttpException with a type and body.
   * @throws {Object} Throws an object with a type of `DefaultHttpExceptionType.UNKNOWN_ERROR` and the response as the body for any other errors.
   */
  private handleError(response: unknown): never {
    if ((response as Error).name === "AbortError") {
      throw {
        type: DefaultHttpExceptionType.ABORT_REQUEST,
      };
    }
    else if ((response as HttpException).type && (response as HttpException).body) {
      throw response;
    }
    throw { type: DefaultHttpExceptionType.UNKNOWN_ERROR, body: response };
  }

  /**
   * Handles the response callback for an HTTP request.
   *
   * @template R - The type of the response body.
   * @param {number[]} successStatusCodes - An array of additional status codes that should be considered successful.
   * @returns {Function} An asynchronous function that processes the response.
   * @throws Will throw an exception if the response status is not in the list of success status codes.
   */
  private handleResponseCallback<R>(successStatusCodes: number[]) {
    const defaultSuccessStatusCodes = [200, 201, 204];

    return async (response: Response) => {
      const body: R = await response.json();

      if (defaultSuccessStatusCodes.includes(response.status) || successStatusCodes.includes(response.status)) {
        return body;
      }

      //if not a success response throw Exception
      throw this.generateException(response.status, body)
    }
  }

  /**
   * Makes an HTTP request using the Fetch API.
   *
   * @template R - The expected response type.
   * @param {HttpMethod} httpMethod - The HTTP method to use for the request (e.g., GET, POST).
   * @param {HttpRequestParams<unknown, FetchRequestOptions>} httpRequestParams - The parameters for the HTTP request.
   * @param {string} httpRequestParams.url - The URL to which the request is sent.
   * @param {Record<string, string>} [httpRequestParams.headers] - Optional headers to include in the request.
   * @param {boolean} [httpRequestParams.contentTypeJSON=true] - Whether to set the `Content-Type` header to `application/json`.
   * @param {unknown} [httpRequestParams.body] - The body of the request, which will be stringified if present.
   * @param {boolean} [this._includeCredentials] - Whether to include credentials in the request.
   * @param {FetchRequestOptions} [httpRequestParams.options] - Additional options to pass to the Fetch API.
   * @param {number[]} [httpRequestParams.successStatusCodes] - An array of status codes that are considered successful.
   * @returns {Promise<R>} A promise that resolves to the response of the request.
   */
  private fetch<R>(httpMethod: HttpMethod, httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions>): Promise<R> {
    return fetch(httpRequestParams.url, {
      method: httpMethod,
      headers: this.getHeaders(httpRequestParams.headers, httpRequestParams.contentTypeJSON ?? true),
      ...(!!httpRequestParams.body && { body: JSON.stringify(httpRequestParams.body) }),
      ...(this._includeCredentials && { credentials: "include" }),
      ...httpRequestParams.options
    }).then(this.handleResponseCallback<R>(httpRequestParams.successStatusCodes ?? [])).catch(this.handleError);
  }

  /**
   * Sends a GET request using the Fetch API.
   *
   * @template R - The expected response type.
   * @param {HttpRequestParams<never, FetchRequestOptions>} httpRequestParams - The parameters for the HTTP request.
   * @returns {Promise<R>} - A promise that resolves to the response of type R.
   */
  get<R>(httpRequestParams: HttpRequestParams<never, FetchRequestOptions>): Promise<R> {
    return this.fetch<R>(HttpMethod.GET, { ...httpRequestParams, contentTypeJSON: false });
  }

  /**
   * Sends a POST HTTP request using the Fetch API.
   *
   * @template R - The expected response type.
   * @template B - The type of the request body, defaults to `unknown`.
   * @param {HttpRequestParams<B, FetchRequestOptions>} httpRequestParams - The parameters for the HTTP request.
   * @returns {Promise<R>} A promise that resolves to the response of type `R`.
   */
  post<R, B = unknown>(httpRequestParams: HttpRequestParams<B, FetchRequestOptions>): Promise<R> {
    return this.fetch<R>(HttpMethod.POST, httpRequestParams);
  }

  /**
   * Sends a PATCH HTTP request using the Fetch API.
   *
   * @template R - The expected response type.
   * @template B - The type of the request body, defaults to `unknown`.
   * @param {HttpRequestParams<B, FetchRequestOptions>} httpRequestParams - The parameters for the HTTP request.
   * @returns {Promise<R>} - A promise that resolves to the response of type `R`.
   */
  patch<R, B = unknown>(httpRequestParams: HttpRequestParams<B, FetchRequestOptions>): Promise<R> {
    return this.fetch<R>(HttpMethod.PATCH, httpRequestParams);
  }

  /**
   * Sends an HTTP PUT request using the Fetch API.
   *
   * @template R - The expected response type.
   * @template B - The type of the request body. Defaults to `unknown`.
   * @param {HttpRequestParams<B, FetchRequestOptions>} httpRequestParams - The parameters for the HTTP request.
   * @returns {Promise<R>} - A promise that resolves to the response of type `R`.
   */
  put<R, B = unknown>(httpRequestParams: HttpRequestParams<B, FetchRequestOptions>): Promise<R> {
    return this.fetch<R>(HttpMethod.PUT, httpRequestParams);
  }

  /**
   * Sends an HTTP DELETE request using the Fetch API.
   *
   * @template R - The expected response type.
   * @param {HttpRequestParams<never, FetchRequestOptions>} httpRequestParams - The parameters for the HTTP request.
   * @returns {Promise<R>} - A promise that resolves to the response of type R.
   */
  delete<R>(httpRequestParams: HttpRequestParams<never, FetchRequestOptions>): Promise<R> {
    return this.fetch<R>(HttpMethod.DELETE, { ...httpRequestParams, contentTypeJSON: false });
  }
}
