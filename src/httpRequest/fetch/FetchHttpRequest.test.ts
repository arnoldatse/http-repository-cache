import DefaultHttpExceptionType from "../exception/DefaultHttpExceptionType";
import HttpException from "../exception/HttpException";
import { HttpRequestParams } from "../HttpRequestAdapter";
import FetchHttpRequest, { FetchRequestOptions } from "./FetchHttpRequest";

describe('FetchHttpRequest', () => {
    const url = "http://localhost:3000";
    const token = "er5wf464f5e6w456f4we646f4";
    const body = { lastName: 'Doe', firstName: 'Jhon' };

    beforeEach(() => {
        globalThis.fetch = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('removeAuthToken', () => {
        it("Should not call fetch with Authorization header with Bearer Token after removed auth token", async () => {
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({}),
            });

            const fetchHttpRequest = new FetchHttpRequest();
            fetchHttpRequest.setAuthToken(token);
            fetchHttpRequest.removeAuthToken();

            // Act
            await fetchHttpRequest.get({ url });

            // Assert
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "GET",
                headers: {}
            });
        });
    });

    describe('notIncludeCredentials', () => {
        it("Should not call fetch with credentials option after not include credentials", async () => {
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({}),
            });

            const fetchHttpRequest = new FetchHttpRequest();
            fetchHttpRequest.includeCredentials();
            fetchHttpRequest.notIncludeCredentials();

            // Act
            await fetchHttpRequest.get({ url });

            // Assert
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "GET",
                headers: {}
            });
        });
    });

    describe('unsetCustomErrorStatusHandling', () => {
        it("Should not handle custom status code after unset custom status handling", async () => {
            const status = 418;
            const body = { message: "I'm a teapot" };

            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: false,
                status,
                json: jest.fn().mockResolvedValue(body),
            });

            const fetchHttpRequest = new FetchHttpRequest();
            fetchHttpRequest.setCustomErrorStatusHandling((status: number, body?: unknown): HttpException => {
                return { type: status, body };
            });
            fetchHttpRequest.unsetCustomErrorStatusHandling();

            // Act
            await expect(fetchHttpRequest.get({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.UNKNOWN_ERROR, body });
        });
    });

    describe('buildRequestHeader', () => {
        let defaultHttpRequestParams: HttpRequestParams<unknown, FetchRequestOptions> = {
            url,
            headers: {
                accept: '*/*',
                "user-agent": 'Jest'
            },
        };

        let fetchHttpRequest: FetchHttpRequest;
        beforeEach(() => {
            fetchHttpRequest = new FetchHttpRequest();
        });

        it("Should only contain custom defined header", () => {
            // Act
            const result = fetchHttpRequest.buildRequestHeader({ ...defaultHttpRequestParams, contentTypeJSON: false });

            // Assert
            expect(result).toEqual(defaultHttpRequestParams.headers);
        });
        it("Should contain custom defined header with only content type header property", () => {
            // Act
            const result = fetchHttpRequest.buildRequestHeader({ ...defaultHttpRequestParams });

            // Assert
            expect(result).toEqual({ ...defaultHttpRequestParams.headers, "Content-Type": "application/json" });
        });
        it("Should contain custom defined header with only authorization header property", () => {
            fetchHttpRequest.setAuthToken(token);
            // Act
            const result = fetchHttpRequest.buildRequestHeader({ ...defaultHttpRequestParams, contentTypeJSON: false });

            // Assert
            expect(result).toEqual({ ...defaultHttpRequestParams.headers, Authorization: `Bearer ${token}` });
        });
        it("Should contain custom defined header with content type header and authorization header properties", () => {
            fetchHttpRequest.setAuthToken(token);
            // Act
            const result = fetchHttpRequest.buildRequestHeader({ ...defaultHttpRequestParams });

            // Assert
            expect(result).toEqual({ ...defaultHttpRequestParams.headers, "Content-Type": "application/json", Authorization: `Bearer ${token}` });
        });
    });

    describe('get', () => {
        it("Should call fetch without header", async () => {
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({}),
            });

            const fetchHttpRequest = new FetchHttpRequest();
            // Act
            await fetchHttpRequest.get({ url });

            // Assert
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "GET",
                headers: {}
            });
        });

        it("Should call fetch with defined authToken in Authorization header property", async () => {
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({}),
            });

            const fetchHttpRequest = new FetchHttpRequest();
            fetchHttpRequest.setAuthToken(token);
            // Act
            await fetchHttpRequest.get({ url });

            // Assert
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` }
            });
        });

        it("Should call fetch with custom headers", async () => {
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({}),
            });

            const customHeaders = { "user-agent": "Jest" }

            const fetchHttpRequest = new FetchHttpRequest();
            // Act
            await fetchHttpRequest.get({ url, headers: customHeaders });

            // Assert
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "GET",
                headers: customHeaders
            });
        });

        it("Should call fetch with request options", async () => {
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({}),
            });

            const fetchHttpRequest = new FetchHttpRequest();
            const requestOptions: RequestInit = { mode: "cors", keepalive: true }
            // Act
            await fetchHttpRequest.get({ url, options: requestOptions });

            // Assert
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "GET",
                headers: {},
                ...requestOptions
            });
        });

        it("Should call fetch with credentials option defined to include", async () => {
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({}),
            });

            const fetchHttpRequest = new FetchHttpRequest();
            fetchHttpRequest.includeCredentials();

            // Act
            await fetchHttpRequest.get({ url });

            // Assert
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "GET",
                headers: {},
                credentials: "include"
            });
        });

        it("Should return fetch response", async () => {
            const response = { data: "data" };
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue(response),
            });

            const fetchHttpRequest = new FetchHttpRequest();
            // Act
            const result = await fetchHttpRequest.get({ url });

            // Assert
            expect(result).toEqual(response);
        });

        it("Should return fetch response with default success status code ", async () => {
            const response = { data: "data" };

            // Code  200
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue(response),
            });

            let fetchHttpRequest = new FetchHttpRequest();

            // Act
            let result = await fetchHttpRequest.get({ url });

            // Assert
            expect(result).toEqual(response);

            // Code  201
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 201,
                json: jest.fn().mockResolvedValue(response),
            });

            fetchHttpRequest = new FetchHttpRequest();

            // Act
            result = await fetchHttpRequest.get({ url });

            // Assert
            expect(result).toEqual(response);

            // Code  204
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 204,
                json: jest.fn().mockResolvedValue(response),
            });

            fetchHttpRequest = new FetchHttpRequest();

            // Act
            result = await fetchHttpRequest.get({ url });

            // Assert
            expect(result).toEqual(response);
        });

        it("Should return fetch response with custom success status code ", async () => {
            const response = { data: "data" };
            const status = 207;

            // Code  201
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status,
                json: jest.fn().mockResolvedValue(response),
            });

            let fetchHttpRequest = new FetchHttpRequest();

            // Act
            let result = await fetchHttpRequest.get({ url, successStatusCodes: [status] });

            // Assert
            expect(result).toEqual(response);
        });

        describe("Should reject HttpException", () => {
            describe("status 400", () => {
                it("status 400 with body", async () => {
                    const status = 400;
                    const body = { message: "Bad Request" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.get({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.BAD_REQUEST, body });
                });

                it("status 400 without body", async () => {
                    const status = 400;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.get({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.BAD_REQUEST });
                });
            });

            describe("Status 401", () => {
                it("status 401 with body", async () => {
                    const status = 401;
                    const body = { message: "Unauthorized" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.get({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.UNAUTHORIZED, body });
                });

                it("status 401 without body", async () => {
                    const status = 401;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.get({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.UNAUTHORIZED });
                });
            });

            describe("Status 402", () => {
                it("status 401 with body", async () => {
                    const status = 402;
                    const body = { message: "Payment Required" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.get({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.PAYMENT_REQUIRED, body });
                });

                it("status 401 without body", async () => {
                    const status = 402;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.get({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.PAYMENT_REQUIRED });
                });
            });

            describe("Status 403", () => {
                it("status 403 with body", async () => {
                    const status = 403;
                    const body = { message: "Forbidden" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.get({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.FORBIDDEN, body });
                });

                it("status 403 without body", async () => {
                    const status = 403;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.get({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.FORBIDDEN });
                });
            });
            describe("Status 404", () => {
                it("status 404 with body", async () => {
                    const status = 404;
                    const body = { message: "Not Found" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.get({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.NOT_FOUND, body });
                });

                it("status 404 without body", async () => {
                    const status = 404;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.get({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.NOT_FOUND });
                });
            });
            describe("Status 409", () => {
                it("status 409 with body", async () => {
                    const status = 409;
                    const body = { message: "Conflict" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.get({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.CONFLICT, body });
                });

                it("status 409 without body", async () => {
                    const status = 409;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.get({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.CONFLICT });
                });
            });
            describe("Status 500", () => {
                it("status 409 with body", async () => {
                    const status = 500;
                    const body = { message: "Internal Server Error" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.get({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.SERVER_ERROR, body });
                });

                it("status 500 without body", async () => {
                    const status = 500;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.get({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.SERVER_ERROR });
                });
            });
            describe("Status 503", () => {
                it("status 503 with body", async () => {
                    const status = 503;
                    const body = { message: "Conflict" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.get({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.SERVER_UNAVAILABLE, body });
                });

                it("status 503 without body", async () => {
                    const status = 503;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.get({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.SERVER_UNAVAILABLE });
                });
            });

            describe("unhandled status", () => {
                it("unhandled with body", async () => {
                    const status = 418;
                    const body = { message: "Conflict" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.get({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.UNKNOWN_ERROR, body });
                });

                it("unhandled without body", async () => {
                    const status = 418;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.get({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.UNKNOWN_ERROR });
                });
            });

            it("override default failure status code handle", async () => {
                const status = 400;
                const customStatus = 418;
                const body = { message: "Bad Request" };
                const customBody = { message: "I'm a teapot" };

                (globalThis.fetch as jest.Mock).mockResolvedValue({
                    ok: false,
                    status,
                    json: jest.fn().mockResolvedValue(body),
                });

                const fetchHttpRequest = new FetchHttpRequest();
                fetchHttpRequest.setCustomErrorStatusHandling((): HttpException => {
                    return { type: customStatus, body: customBody };
                });

                // Act
                await expect(fetchHttpRequest.get({ url })).rejects.toMatchObject({ type: customStatus, body: customBody });
            });

            it("handle custom status code", async () => {
                const status = 418;
                const body = { message: "I'm a teapot" };

                (globalThis.fetch as jest.Mock).mockResolvedValue({
                    ok: false,
                    status,
                    json: jest.fn().mockResolvedValue(body),
                });

                const fetchHttpRequest = new FetchHttpRequest();
                fetchHttpRequest.setCustomErrorStatusHandling((status: number, body?: unknown): HttpException => {
                    return { type: status, body };
                });

                // Act
                await expect(fetchHttpRequest.get({ url })).rejects.toMatchObject({ type: status, body });
            });

            it("Should return exception with Abort Request type", async () => {
                const abortError = new Error("Abort");
                abortError.name = "AbortError";
                (globalThis.fetch as jest.Mock).mockRejectedValue(abortError);

                const fetchHttpRequest = new FetchHttpRequest();
                // Act
                await expect(fetchHttpRequest.get({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.ABORT_REQUEST });
            });

            it("Should return exception with Unknown Error type", async () => {
                const error = new Error("Unknown Error");

                (globalThis.fetch as jest.Mock).mockRejectedValue(error);

                const fetchHttpRequest = new FetchHttpRequest();
                // Act
                await expect(fetchHttpRequest.get({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.UNKNOWN_ERROR });
            });
        })
    });

    describe('post', () => {
        it("Should call fetch with body", async () => {
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({}),
            });

            const fetchHttpRequest = new FetchHttpRequest();
            // Act
            await fetchHttpRequest.post({ url, body });

            // Assert
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
        });

        it("Should call fetch without header", async () => {
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({}),
            });

            const fetchHttpRequest = new FetchHttpRequest();
            // Act
            await fetchHttpRequest.post({ url, contentTypeJSON: false });

            // Assert
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "POST",
                headers: {}
            });
        });

        it("Should call fetch with only Content-Type header with value application/json", async () => {
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({}),
            });

            const fetchHttpRequest = new FetchHttpRequest();
            // Act
            await fetchHttpRequest.post({ url });

            // Assert
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });
        });

        it("Should call fetch with defined authToken in Authorization header property", async () => {
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({}),
            });

            const fetchHttpRequest = new FetchHttpRequest();
            fetchHttpRequest.setAuthToken(token);
            // Act
            await fetchHttpRequest.post({ url });

            // Assert
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
            });
        });

        it("Should call fetch with custom headers", async () => {
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({}),
            });

            const customHeaders = { "user-agent": "Jest" }

            const fetchHttpRequest = new FetchHttpRequest();
            // Act
            await fetchHttpRequest.post({ url, headers: customHeaders });

            // Assert
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...customHeaders }
            });
        })

        it("Should call fetch with request options", async () => {
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({}),
            });

            const fetchHttpRequest = new FetchHttpRequest();
            const requestOptions: RequestInit = { mode: "cors", keepalive: true }
            // Act
            await fetchHttpRequest.post({ url, options: requestOptions });

            // Assert
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                ...requestOptions
            });
        });

        it("Should call fetch with credentials option defined to include", async () => {
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({}),
            });

            const fetchHttpRequest = new FetchHttpRequest();
            fetchHttpRequest.includeCredentials();

            // Act
            await fetchHttpRequest.post({ url });

            // Assert
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });
        });

        it("Should return fetch response", async () => {
            const response = { data: "data" };
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue(response),
            });

            const fetchHttpRequest = new FetchHttpRequest();
            // Act
            const result = await fetchHttpRequest.post({ url });

            // Assert
            expect(result).toEqual(response);
        });

        it("Should return fetch response with default success status code ", async () => {
            const response = { data: "data" };

            // Code  200
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue(response),
            });

            let fetchHttpRequest = new FetchHttpRequest();

            // Act
            let result = await fetchHttpRequest.post({ url });

            // Assert
            expect(result).toEqual(response);

            // Code  201
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 201,
                json: jest.fn().mockResolvedValue(response),
            });

            fetchHttpRequest = new FetchHttpRequest();

            // Act
            result = await fetchHttpRequest.post({ url });

            // Assert
            expect(result).toEqual(response);

            // Code  204
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 204,
                json: jest.fn().mockResolvedValue(response),
            });

            fetchHttpRequest = new FetchHttpRequest();

            // Act
            result = await fetchHttpRequest.post({ url });

            // Assert
            expect(result).toEqual(response);
        });

        it("Should return fetch response with custom success status code ", async () => {
            const response = { data: "data" };
            const status = 207;

            // Code  201
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status,
                json: jest.fn().mockResolvedValue(response),
            });

            let fetchHttpRequest = new FetchHttpRequest();

            // Act
            let result = await fetchHttpRequest.post({ url, successStatusCodes: [status] });

            // Assert
            expect(result).toEqual(response);
        });

        it("Should call fetch with formData body and no headers \"Content-Type\": \"application/json\"", async () => {
            const formData = new FormData();
            formData.append("file", "file");

            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({}),
            });

            const fetchHttpRequest = new FetchHttpRequest();
            // Act
            await fetchHttpRequest.post({ url, body: formData, contentTypeJSON: false });

            // Assert
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "POST",
                headers: {},
                body: formData
            });
        });

        describe("Should reject HttpException", () => {
            describe("status 400", () => {
                it("status 400 with body", async () => {
                    const status = 400;
                    const body = { message: "Bad Request" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.post({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.BAD_REQUEST, body });
                });

                it("status 400 without body", async () => {
                    const status = 400;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.post({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.BAD_REQUEST });
                });
            });

            describe("Status 401", () => {
                it("status 401 with body", async () => {
                    const status = 401;
                    const body = { message: "Unauthorized" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.post({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.UNAUTHORIZED, body });
                });

                it("status 401 without body", async () => {
                    const status = 401;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.post({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.UNAUTHORIZED });
                });
            });

            describe("Status 402", () => {
                it("status 401 with body", async () => {
                    const status = 402;
                    const body = { message: "Payment Required" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.post({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.PAYMENT_REQUIRED, body });
                });

                it("status 401 without body", async () => {
                    const status = 402;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.post({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.PAYMENT_REQUIRED });
                });
            });

            describe("Status 403", () => {
                it("status 403 with body", async () => {
                    const status = 403;
                    const body = { message: "Forbidden" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.post({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.FORBIDDEN, body });
                });

                it("status 403 without body", async () => {
                    const status = 403;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.post({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.FORBIDDEN });
                });
            });
            describe("Status 404", () => {
                it("status 404 with body", async () => {
                    const status = 404;
                    const body = { message: "Not Found" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.post({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.NOT_FOUND, body });
                });

                it("status 404 without body", async () => {
                    const status = 404;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.post({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.NOT_FOUND });
                });
            });
            describe("Status 409", () => {
                it("status 409 with body", async () => {
                    const status = 409;
                    const body = { message: "Conflict" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.post({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.CONFLICT, body });
                });

                it("status 409 without body", async () => {
                    const status = 409;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.post({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.CONFLICT });
                });
            });
            describe("Status 500", () => {
                it("status 409 with body", async () => {
                    const status = 500;
                    const body = { message: "Internal Server Error" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.post({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.SERVER_ERROR, body });
                });

                it("status 500 without body", async () => {
                    const status = 500;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.post({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.SERVER_ERROR });
                });
            });
            describe("Status 503", () => {
                it("status 503 with body", async () => {
                    const status = 503;
                    const body = { message: "Conflict" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.post({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.SERVER_UNAVAILABLE, body });
                });

                it("status 503 without body", async () => {
                    const status = 503;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.post({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.SERVER_UNAVAILABLE });
                });
            });

            describe("unhandled status", () => {
                it("unhandled with body", async () => {
                    const status = 418;
                    const body = { message: "Conflict" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.post({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.UNKNOWN_ERROR, body });
                });

                it("unhandled without body", async () => {
                    const status = 418;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.post({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.UNKNOWN_ERROR });
                });
            });

            it("override default failure status code handle", async () => {
                const status = 400;
                const customStatus = 418;
                const body = { message: "Bad Request" };
                const customBody = { message: "I'm a teapot" };

                (globalThis.fetch as jest.Mock).mockResolvedValue({
                    ok: false,
                    status,
                    json: jest.fn().mockResolvedValue(body),
                });

                const fetchHttpRequest = new FetchHttpRequest();
                fetchHttpRequest.setCustomErrorStatusHandling((): HttpException => {
                    return { type: customStatus, body: customBody };
                });

                // Act
                await expect(fetchHttpRequest.post({ url })).rejects.toMatchObject({ type: customStatus, body: customBody });
            });

            it("handle custom status code", async () => {
                const status = 418;
                const body = { message: "I'm a teapot" };

                (globalThis.fetch as jest.Mock).mockResolvedValue({
                    ok: false,
                    status,
                    json: jest.fn().mockResolvedValue(body),
                });

                const fetchHttpRequest = new FetchHttpRequest();
                fetchHttpRequest.setCustomErrorStatusHandling((status: number, body?: unknown): HttpException => {
                    return { type: status, body };
                });

                // Act
                await expect(fetchHttpRequest.post({ url })).rejects.toMatchObject({ type: status, body });
            });

            it("Should return exception with Abort Request type", async () => {
                const abortError = new Error("Abort");
                abortError.name = "AbortError";
                (globalThis.fetch as jest.Mock).mockRejectedValue(abortError);

                const fetchHttpRequest = new FetchHttpRequest();
                // Act
                await expect(fetchHttpRequest.post({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.ABORT_REQUEST });
            });

            it("Should return exception with Unknown Error type", async () => {
                const error = new Error("Unknown Error");

                (globalThis.fetch as jest.Mock).mockRejectedValue(error);

                const fetchHttpRequest = new FetchHttpRequest();
                // Act
                await expect(fetchHttpRequest.post({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.UNKNOWN_ERROR });
            });
        })
    });

    describe('patch', () => {
        it("Should call fetch with body", async () => {
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({}),
            });

            const fetchHttpRequest = new FetchHttpRequest();
            // Act
            await fetchHttpRequest.patch({ url, body });

            // Assert
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
        });

        it("Should call fetch without header", async () => {
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({}),
            });

            const fetchHttpRequest = new FetchHttpRequest();
            // Act
            await fetchHttpRequest.patch({ url, contentTypeJSON: false });

            // Assert
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "PATCH",
                headers: {}
            });
        });

        it("Should call fetch with only Content-Type header with value application/json", async () => {
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({}),
            });

            const fetchHttpRequest = new FetchHttpRequest();
            // Act
            await fetchHttpRequest.patch({ url });

            // Assert
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" }
            });
        });

        it("Should call fetch with defined authToken in Authorization header property", async () => {
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({}),
            });

            const fetchHttpRequest = new FetchHttpRequest();
            fetchHttpRequest.setAuthToken(token);
            // Act
            await fetchHttpRequest.patch({ url });

            // Assert
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
            });
        });

        it("Should call fetch with custom headers", async () => {
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({}),
            });

            const customHeaders = { "user-agent": "Jest" }

            const fetchHttpRequest = new FetchHttpRequest();
            // Act
            await fetchHttpRequest.patch({ url, headers: customHeaders });

            // Assert
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", ...customHeaders }
            });
        })

        it("Should call fetch with request options", async () => {
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({}),
            });

            const fetchHttpRequest = new FetchHttpRequest();
            const requestOptions: RequestInit = { mode: "cors", keepalive: true }
            // Act
            await fetchHttpRequest.patch({ url, options: requestOptions });

            // Assert
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                ...requestOptions
            });
        });

        it("Should call fetch with credentials option defined to include", async () => {
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({}),
            });

            const fetchHttpRequest = new FetchHttpRequest();
            fetchHttpRequest.includeCredentials();

            // Act
            await fetchHttpRequest.patch({ url });

            // Assert
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });
        });

        it("Should return fetch response", async () => {
            const response = { data: "data" };
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue(response),
            });

            const fetchHttpRequest = new FetchHttpRequest();
            // Act
            const result = await fetchHttpRequest.patch({ url });

            // Assert
            expect(result).toEqual(response);
        });

        it("Should return fetch response with default success status code ", async () => {
            const response = { data: "data" };

            // Code  200
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue(response),
            });

            let fetchHttpRequest = new FetchHttpRequest();

            // Act
            let result = await fetchHttpRequest.patch({ url });

            // Assert
            expect(result).toEqual(response);

            // Code  201
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 201,
                json: jest.fn().mockResolvedValue(response),
            });

            fetchHttpRequest = new FetchHttpRequest();

            // Act
            result = await fetchHttpRequest.patch({ url });

            // Assert
            expect(result).toEqual(response);

            // Code  204
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 204,
                json: jest.fn().mockResolvedValue(response),
            });

            fetchHttpRequest = new FetchHttpRequest();

            // Act
            result = await fetchHttpRequest.patch({ url });

            // Assert
            expect(result).toEqual(response);
        });

        it("Should return fetch response with custom success status code ", async () => {
            const response = { data: "data" };
            const status = 207;

            // Code  201
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status,
                json: jest.fn().mockResolvedValue(response),
            });

            let fetchHttpRequest = new FetchHttpRequest();

            // Act
            let result = await fetchHttpRequest.patch({ url, successStatusCodes: [status] });

            // Assert
            expect(result).toEqual(response);
        });

        it("Should call fetch with formData body and no headers \"Content-Type\": \"application/json\"", async () => {
            const formData = new FormData();
            formData.append("file", "file");

            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({}),
            });

            const fetchHttpRequest = new FetchHttpRequest();
            // Act
            await fetchHttpRequest.patch({ url, body: formData, contentTypeJSON: false });

            // Assert
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "PATCH",
                headers: {},
                body: formData
            });
        });

        describe("Should reject HttpException", () => {
            describe("status 400", () => {
                it("status 400 with body", async () => {
                    const status = 400;
                    const body = { message: "Bad Request" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.patch({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.BAD_REQUEST, body });
                });

                it("status 400 without body", async () => {
                    const status = 400;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.patch({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.BAD_REQUEST });
                });
            });

            describe("Status 401", () => {
                it("status 401 with body", async () => {
                    const status = 401;
                    const body = { message: "Unauthorized" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.patch({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.UNAUTHORIZED, body });
                });

                it("status 401 without body", async () => {
                    const status = 401;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.patch({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.UNAUTHORIZED });
                });
            });

            describe("Status 402", () => {
                it("status 401 with body", async () => {
                    const status = 402;
                    const body = { message: "Payment Required" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.patch({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.PAYMENT_REQUIRED, body });
                });

                it("status 401 without body", async () => {
                    const status = 402;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.patch({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.PAYMENT_REQUIRED });
                });
            });

            describe("Status 403", () => {
                it("status 403 with body", async () => {
                    const status = 403;
                    const body = { message: "Forbidden" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.patch({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.FORBIDDEN, body });
                });

                it("status 403 without body", async () => {
                    const status = 403;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.patch({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.FORBIDDEN });
                });
            });
            describe("Status 404", () => {
                it("status 404 with body", async () => {
                    const status = 404;
                    const body = { message: "Not Found" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.patch({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.NOT_FOUND, body });
                });

                it("status 404 without body", async () => {
                    const status = 404;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.patch({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.NOT_FOUND });
                });
            });
            describe("Status 409", () => {
                it("status 409 with body", async () => {
                    const status = 409;
                    const body = { message: "Conflict" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.patch({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.CONFLICT, body });
                });

                it("status 409 without body", async () => {
                    const status = 409;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.patch({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.CONFLICT });
                });
            });
            describe("Status 500", () => {
                it("status 409 with body", async () => {
                    const status = 500;
                    const body = { message: "Internal Server Error" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.patch({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.SERVER_ERROR, body });
                });

                it("status 500 without body", async () => {
                    const status = 500;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.patch({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.SERVER_ERROR });
                });
            });
            describe("Status 503", () => {
                it("status 503 with body", async () => {
                    const status = 503;
                    const body = { message: "Conflict" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.patch({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.SERVER_UNAVAILABLE, body });
                });

                it("status 503 without body", async () => {
                    const status = 503;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.patch({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.SERVER_UNAVAILABLE });
                });
            });

            describe("unhandled status", () => {
                it("unhandled with body", async () => {
                    const status = 418;
                    const body = { message: "Conflict" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.patch({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.UNKNOWN_ERROR, body });
                });

                it("unhandled without body", async () => {
                    const status = 418;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.patch({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.UNKNOWN_ERROR });
                });
            });

            it("override default failure status code handle", async () => {
                const status = 400;
                const customStatus = 418;
                const body = { message: "Bad Request" };
                const customBody = { message: "I'm a teapot" };

                (globalThis.fetch as jest.Mock).mockResolvedValue({
                    ok: false,
                    status,
                    json: jest.fn().mockResolvedValue(body),
                });

                const fetchHttpRequest = new FetchHttpRequest();
                fetchHttpRequest.setCustomErrorStatusHandling((): HttpException => {
                    return { type: customStatus, body: customBody };
                });

                // Act
                await expect(fetchHttpRequest.patch({ url })).rejects.toMatchObject({ type: customStatus, body: customBody });
            });

            it("handle custom status code", async () => {
                const status = 418;
                const body = { message: "I'm a teapot" };

                (globalThis.fetch as jest.Mock).mockResolvedValue({
                    ok: false,
                    status,
                    json: jest.fn().mockResolvedValue(body),
                });

                const fetchHttpRequest = new FetchHttpRequest();
                fetchHttpRequest.setCustomErrorStatusHandling((status: number, body?: unknown): HttpException => {
                    return { type: status, body };
                });

                // Act
                await expect(fetchHttpRequest.patch({ url })).rejects.toMatchObject({ type: status, body });
            });

            it("Should return exception with Abort Request type", async () => {
                const abortError = new Error("Abort");
                abortError.name = "AbortError";
                (globalThis.fetch as jest.Mock).mockRejectedValue(abortError);

                const fetchHttpRequest = new FetchHttpRequest();
                // Act
                await expect(fetchHttpRequest.patch({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.ABORT_REQUEST });
            });

            it("Should return exception with Unknown Error type", async () => {
                const error = new Error("Unknown Error");

                (globalThis.fetch as jest.Mock).mockRejectedValue(error);

                const fetchHttpRequest = new FetchHttpRequest();
                // Act
                await expect(fetchHttpRequest.patch({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.UNKNOWN_ERROR });
            });
        })
    });

    describe('put', () => {
        it("Should call fetch with body", async () => {
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({}),
            });

            const fetchHttpRequest = new FetchHttpRequest();
            // Act
            await fetchHttpRequest.put({ url, body });

            // Assert
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
        });

        it("Should call fetch without header", async () => {
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({}),
            });

            const fetchHttpRequest = new FetchHttpRequest();
            // Act
            await fetchHttpRequest.put({ url, contentTypeJSON: false });

            // Assert
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "PUT",
                headers: {}
            });
        });

        it("Should call fetch with only Content-Type header with value application/json", async () => {
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({}),
            });

            const fetchHttpRequest = new FetchHttpRequest();
            // Act
            await fetchHttpRequest.put({ url });

            // Assert
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" }
            });
        });

        it("Should call fetch with defined authToken in Authorization header property", async () => {
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({}),
            });

            const fetchHttpRequest = new FetchHttpRequest();
            fetchHttpRequest.setAuthToken(token);
            // Act
            await fetchHttpRequest.put({ url });

            // Assert
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
            });
        });

        it("Should call fetch with custom headers", async () => {
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({}),
            });

            const customHeaders = { "user-agent": "Jest" }

            const fetchHttpRequest = new FetchHttpRequest();
            // Act
            await fetchHttpRequest.put({ url, headers: customHeaders });

            // Assert
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json", ...customHeaders }
            });
        })

        it("Should call fetch with request options", async () => {
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({}),
            });

            const fetchHttpRequest = new FetchHttpRequest();
            const requestOptions: RequestInit = { mode: "cors", keepalive: true }
            // Act
            await fetchHttpRequest.put({ url, options: requestOptions });

            // Assert
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                ...requestOptions
            });
        });

        it("Should call fetch with credentials option defined to include", async () => {
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({}),
            });

            const fetchHttpRequest = new FetchHttpRequest();
            fetchHttpRequest.includeCredentials();

            // Act
            await fetchHttpRequest.put({ url });

            // Assert
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });
        });

        it("Should return fetch response", async () => {
            const response = { data: "data" };
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue(response),
            });

            const fetchHttpRequest = new FetchHttpRequest();
            // Act
            const result = await fetchHttpRequest.put({ url });

            // Assert
            expect(result).toEqual(response);
        });

        it("Should return fetch response with default success status code ", async () => {
            const response = { data: "data" };

            // Code  200
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue(response),
            });

            let fetchHttpRequest = new FetchHttpRequest();

            // Act
            let result = await fetchHttpRequest.put({ url });

            // Assert
            expect(result).toEqual(response);

            // Code  201
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 201,
                json: jest.fn().mockResolvedValue(response),
            });

            fetchHttpRequest = new FetchHttpRequest();

            // Act
            result = await fetchHttpRequest.put({ url });

            // Assert
            expect(result).toEqual(response);

            // Code  204
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 204,
                json: jest.fn().mockResolvedValue(response),
            });

            fetchHttpRequest = new FetchHttpRequest();

            // Act
            result = await fetchHttpRequest.put({ url });

            // Assert
            expect(result).toEqual(response);
        });

        it("Should return fetch response with custom success status code ", async () => {
            const response = { data: "data" };
            const status = 207;

            // Code  201
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status,
                json: jest.fn().mockResolvedValue(response),
            });

            let fetchHttpRequest = new FetchHttpRequest();

            // Act
            let result = await fetchHttpRequest.put({ url, successStatusCodes: [status] });

            // Assert
            expect(result).toEqual(response);
        });

        it("Should call fetch with formData body and no headers \"Content-Type\": \"application/json\"", async () => {
            const formData = new FormData();
            formData.append("file", "file");

            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({}),
            });

            const fetchHttpRequest = new FetchHttpRequest();
            // Act
            await fetchHttpRequest.put({ url, body: formData, contentTypeJSON: false });

            // Assert
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "PUT",
                headers: {},
                body: formData
            });
        });

        describe("Should reject HttpException", () => {
            describe("status 400", () => {
                it("status 400 with body", async () => {
                    const status = 400;
                    const body = { message: "Bad Request" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.put({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.BAD_REQUEST, body });
                });

                it("status 400 without body", async () => {
                    const status = 400;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.put({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.BAD_REQUEST });
                });
            });

            describe("Status 401", () => {
                it("status 401 with body", async () => {
                    const status = 401;
                    const body = { message: "Unauthorized" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.put({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.UNAUTHORIZED, body });
                });

                it("status 401 without body", async () => {
                    const status = 401;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.put({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.UNAUTHORIZED });
                });
            });

            describe("Status 402", () => {
                it("status 401 with body", async () => {
                    const status = 402;
                    const body = { message: "Payment Required" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.put({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.PAYMENT_REQUIRED, body });
                });

                it("status 401 without body", async () => {
                    const status = 402;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.put({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.PAYMENT_REQUIRED });
                });
            });

            describe("Status 403", () => {
                it("status 403 with body", async () => {
                    const status = 403;
                    const body = { message: "Forbidden" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.put({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.FORBIDDEN, body });
                });

                it("status 403 without body", async () => {
                    const status = 403;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.put({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.FORBIDDEN });
                });
            });
            describe("Status 404", () => {
                it("status 404 with body", async () => {
                    const status = 404;
                    const body = { message: "Not Found" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.put({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.NOT_FOUND, body });
                });

                it("status 404 without body", async () => {
                    const status = 404;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.put({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.NOT_FOUND });
                });
            });
            describe("Status 409", () => {
                it("status 409 with body", async () => {
                    const status = 409;
                    const body = { message: "Conflict" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.put({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.CONFLICT, body });
                });

                it("status 409 without body", async () => {
                    const status = 409;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.put({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.CONFLICT });
                });
            });
            describe("Status 500", () => {
                it("status 409 with body", async () => {
                    const status = 500;
                    const body = { message: "Internal Server Error" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.put({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.SERVER_ERROR, body });
                });

                it("status 500 without body", async () => {
                    const status = 500;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.put({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.SERVER_ERROR });
                });
            });
            describe("Status 503", () => {
                it("status 503 with body", async () => {
                    const status = 503;
                    const body = { message: "Conflict" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.put({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.SERVER_UNAVAILABLE, body });
                });

                it("status 503 without body", async () => {
                    const status = 503;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.put({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.SERVER_UNAVAILABLE });
                });
            });

            describe("unhandled status", () => {
                it("unhandled with body", async () => {
                    const status = 418;
                    const body = { message: "Conflict" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.put({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.UNKNOWN_ERROR, body });
                });

                it("unhandled without body", async () => {
                    const status = 418;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.put({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.UNKNOWN_ERROR });
                });
            });

            it("override default failure status code handle", async () => {
                const status = 400;
                const customStatus = 418;
                const body = { message: "Bad Request" };
                const customBody = { message: "I'm a teapot" };

                (globalThis.fetch as jest.Mock).mockResolvedValue({
                    ok: false,
                    status,
                    json: jest.fn().mockResolvedValue(body),
                });

                const fetchHttpRequest = new FetchHttpRequest();
                fetchHttpRequest.setCustomErrorStatusHandling((): HttpException => {
                    return { type: customStatus, body: customBody };
                });

                // Act
                await expect(fetchHttpRequest.put({ url })).rejects.toMatchObject({ type: customStatus, body: customBody });
            });

            it("handle custom status code", async () => {
                const status = 418;
                const body = { message: "I'm a teapot" };

                (globalThis.fetch as jest.Mock).mockResolvedValue({
                    ok: false,
                    status,
                    json: jest.fn().mockResolvedValue(body),
                });

                const fetchHttpRequest = new FetchHttpRequest();
                fetchHttpRequest.setCustomErrorStatusHandling((status: number, body?: unknown): HttpException => {
                    return { type: status, body };
                });

                // Act
                await expect(fetchHttpRequest.put({ url })).rejects.toMatchObject({ type: status, body });
            });

            it("Should return exception with Abort Request type", async () => {
                const abortError = new Error("Abort");
                abortError.name = "AbortError";
                (globalThis.fetch as jest.Mock).mockRejectedValue(abortError);

                const fetchHttpRequest = new FetchHttpRequest();
                // Act
                await expect(fetchHttpRequest.put({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.ABORT_REQUEST });
            });

            it("Should return exception with Unknown Error type", async () => {
                const error = new Error("Unknown Error");

                (globalThis.fetch as jest.Mock).mockRejectedValue(error);

                const fetchHttpRequest = new FetchHttpRequest();
                // Act
                await expect(fetchHttpRequest.put({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.UNKNOWN_ERROR });
            });
        })
    });

    describe('delete', () => {
        it("Should call fetch without header", async () => {
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({}),
            });

            const fetchHttpRequest = new FetchHttpRequest();
            // Act
            await fetchHttpRequest.delete({ url });

            // Assert
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "DELETE",
                headers: {}
            });
        });

        it("Should call fetch with defined authToken in Authorization header property", async () => {
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({}),
            });

            const fetchHttpRequest = new FetchHttpRequest();
            fetchHttpRequest.setAuthToken(token);
            // Act
            await fetchHttpRequest.delete({ url });

            // Assert
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
        });

        it("Should call fetch with custom headers", async () => {
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({}),
            });

            const customHeaders = { "user-agent": "Jest" }

            const fetchHttpRequest = new FetchHttpRequest();
            // Act
            await fetchHttpRequest.delete({ url, headers: customHeaders });

            // Assert
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "DELETE",
                headers: customHeaders
            });
        })

        it("Should call fetch with request options", async () => {
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({}),
            });

            const fetchHttpRequest = new FetchHttpRequest();
            const requestOptions: RequestInit = { mode: "cors", keepalive: true }
            // Act
            await fetchHttpRequest.delete({ url, options: requestOptions });

            // Assert
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "DELETE",
                headers: {},
                ...requestOptions
            });
        });

        it("Should call fetch with credentials option defined to include", async () => {
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({}),
            });

            const fetchHttpRequest = new FetchHttpRequest();
            fetchHttpRequest.includeCredentials();

            // Act
            await fetchHttpRequest.delete({ url });

            // Assert
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "DELETE",
                headers: {},
                credentials: "include"
            });
        });

        it("Should return fetch response", async () => {
            const response = { data: "data" };
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue(response),
            });

            const fetchHttpRequest = new FetchHttpRequest();
            // Act
            const result = await fetchHttpRequest.delete({ url });

            // Assert
            expect(result).toEqual(response);
        });

        it("Should return fetch response with default success status code ", async () => {
            const response = { data: "data" };

            // Code  200
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue(response),
            });

            let fetchHttpRequest = new FetchHttpRequest();

            // Act
            let result = await fetchHttpRequest.delete({ url });

            // Assert
            expect(result).toEqual(response);

            // Code  201
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 201,
                json: jest.fn().mockResolvedValue(response),
            });

            fetchHttpRequest = new FetchHttpRequest();

            // Act
            result = await fetchHttpRequest.delete({ url });

            // Assert
            expect(result).toEqual(response);

            // Code  204
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 204,
                json: jest.fn().mockResolvedValue(response),
            });

            fetchHttpRequest = new FetchHttpRequest();

            // Act
            result = await fetchHttpRequest.delete({ url });

            // Assert
            expect(result).toEqual(response);
        });

        it("Should return fetch response with custom success status code ", async () => {
            const response = { data: "data" };
            const status = 207;

            // Code  201
            (globalThis.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status,
                json: jest.fn().mockResolvedValue(response),
            });

            let fetchHttpRequest = new FetchHttpRequest();

            // Act
            let result = await fetchHttpRequest.delete({ url, successStatusCodes: [status] });

            // Assert
            expect(result).toEqual(response);
        });

        describe("Should reject HttpException", () => {
            describe("status 400", () => {
                it("status 400 with body", async () => {
                    const status = 400;
                    const body = { message: "Bad Request" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.delete({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.BAD_REQUEST, body });
                });

                it("status 400 without body", async () => {
                    const status = 400;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.delete({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.BAD_REQUEST });
                });
            });

            describe("Status 401", () => {
                it("status 401 with body", async () => {
                    const status = 401;
                    const body = { message: "Unauthorized" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.delete({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.UNAUTHORIZED, body });
                });

                it("status 401 without body", async () => {
                    const status = 401;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.delete({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.UNAUTHORIZED });
                });
            });

            describe("Status 402", () => {
                it("status 401 with body", async () => {
                    const status = 402;
                    const body = { message: "Payment Required" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.delete({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.PAYMENT_REQUIRED, body });
                });

                it("status 401 without body", async () => {
                    const status = 402;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.delete({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.PAYMENT_REQUIRED });
                });
            });

            describe("Status 403", () => {
                it("status 403 with body", async () => {
                    const status = 403;
                    const body = { message: "Forbidden" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.delete({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.FORBIDDEN, body });
                });

                it("status 403 without body", async () => {
                    const status = 403;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.delete({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.FORBIDDEN });
                });
            });
            describe("Status 404", () => {
                it("status 404 with body", async () => {
                    const status = 404;
                    const body = { message: "Not Found" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.delete({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.NOT_FOUND, body });
                });

                it("status 404 without body", async () => {
                    const status = 404;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.delete({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.NOT_FOUND });
                });
            });
            describe("Status 409", () => {
                it("status 409 with body", async () => {
                    const status = 409;
                    const body = { message: "Conflict" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.delete({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.CONFLICT, body });
                });

                it("status 409 without body", async () => {
                    const status = 409;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.delete({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.CONFLICT });
                });
            });
            describe("Status 500", () => {
                it("status 409 with body", async () => {
                    const status = 500;
                    const body = { message: "Internal Server Error" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.delete({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.SERVER_ERROR, body });
                });

                it("status 500 without body", async () => {
                    const status = 500;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.delete({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.SERVER_ERROR });
                });
            });
            describe("Status 503", () => {
                it("status 503 with body", async () => {
                    const status = 503;
                    const body = { message: "Conflict" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.delete({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.SERVER_UNAVAILABLE, body });
                });

                it("status 503 without body", async () => {
                    const status = 503;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.delete({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.SERVER_UNAVAILABLE });
                });
            });

            describe("unhandled status", () => {
                it("unhandled with body", async () => {
                    const status = 418;
                    const body = { message: "Conflict" };

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue(body),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.delete({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.UNKNOWN_ERROR, body });
                });

                it("unhandled without body", async () => {
                    const status = 418;

                    (globalThis.fetch as jest.Mock).mockResolvedValue({
                        ok: false,
                        status,
                        json: jest.fn().mockResolvedValue({}),
                    });

                    const fetchHttpRequest = new FetchHttpRequest();
                    // Act
                    await expect(fetchHttpRequest.delete({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.UNKNOWN_ERROR });
                });
            });

            it("override default failure status code handle", async () => {
                const status = 400;
                const customStatus = 418;
                const body = { message: "Bad Request" };
                const customBody = { message: "I'm a teapot" };

                (globalThis.fetch as jest.Mock).mockResolvedValue({
                    ok: false,
                    status,
                    json: jest.fn().mockResolvedValue(body),
                });

                const fetchHttpRequest = new FetchHttpRequest();
                fetchHttpRequest.setCustomErrorStatusHandling((): HttpException => {
                    return { type: customStatus, body: customBody };
                });

                // Act
                await expect(fetchHttpRequest.delete({ url })).rejects.toMatchObject({ type: customStatus, body: customBody });
            });

            it("handle custom status code", async () => {
                const status = 418;
                const body = { message: "I'm a teapot" };

                (globalThis.fetch as jest.Mock).mockResolvedValue({
                    ok: false,
                    status,
                    json: jest.fn().mockResolvedValue(body),
                });

                const fetchHttpRequest = new FetchHttpRequest();
                fetchHttpRequest.setCustomErrorStatusHandling((status: number, body?: unknown): HttpException => {
                    return { type: status, body };
                });

                // Act
                await expect(fetchHttpRequest.delete({ url })).rejects.toMatchObject({ type: status, body });
            });

            it("Should return exception with Abort Request type", async () => {
                const abortError = new Error("Abort");
                abortError.name = "AbortError";
                (globalThis.fetch as jest.Mock).mockRejectedValue(abortError);

                const fetchHttpRequest = new FetchHttpRequest();
                // Act
                await expect(fetchHttpRequest.delete({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.ABORT_REQUEST });
            });

            it("Should return exception with Unknown Error type", async () => {
                const error = new Error("Unknown Error");

                (globalThis.fetch as jest.Mock).mockRejectedValue(error);

                const fetchHttpRequest = new FetchHttpRequest();
                // Act
                await expect(fetchHttpRequest.delete({ url })).rejects.toMatchObject({ type: DefaultHttpExceptionType.UNKNOWN_ERROR });
            });
        })
    });
});