import { HttpRequestParams } from './../httpRequest/HttpRequestAdapter';
import FetchHttpRequest, { FetchRequestOptions } from "../httpRequest/fetch/FetchHttpRequest";
import HttpMethod from "../httpRequest/HttpMethod";
import RepositoryCache from "./RepositoryCache";
import DefaultHttpExceptionType from '../httpRequest/exception/DefaultHttpExceptionType';
import HttpException from '../httpRequest/exception/HttpException';

const defaultBaseUrl = 'http://localhost:3000';
const defaultId = 5;
const listUrl = `${defaultBaseUrl}/list`;
const getUrl = `${defaultBaseUrl}/get/${defaultId}`;
const defaultResponseData = { id: defaultId, data: 'data' };
const defaultValidityCacheTimeToAdvance = 30000;
const defaultExpiringCacheTimeToAdvance = 120000;

jest.useFakeTimers();
describe('RepositoryCache', () => {
    let fetchHttpRequest: FetchHttpRequest;

    beforeEach(() => {
        fetchHttpRequest = new FetchHttpRequest();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("setHttpRequest", () => {
        it('should set http request', () => {
            const firstHttpRequest = new FetchHttpRequest();
            const secondHttpRequest = new FetchHttpRequest();

            const spyFirstHttpRequestGet = jest.spyOn(firstHttpRequest, 'get').mockResolvedValue(defaultResponseData);
            const spySecondHttpRequestGet = jest.spyOn(secondHttpRequest, 'get').mockResolvedValue(defaultResponseData);

            const repositoryCache = new RepositoryCache(firstHttpRequest, 'id');
            repositoryCache.setHttpRequest(secondHttpRequest);

            repositoryCache.getList(HttpMethod.GET, { url: listUrl });

            expect(spyFirstHttpRequestGet).not.toHaveBeenCalled();
            expect(spySecondHttpRequestGet).toHaveBeenCalledTimes(1);
        });
    });

    describe("clearCache", () => {
        it('should clear the entire cache even when cache has lifetime', async () => {
            const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue(defaultResponseData);
            const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id');

            await repositoryCache.getList(HttpMethod.GET, { url: listUrl });
            await repositoryCache.get(HttpMethod.GET, { url: getUrl });

            //advance time to 30s
            jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

            //should not call fetchHttpRequest get method
            await repositoryCache.getList(HttpMethod.GET, { url: listUrl });
            await repositoryCache.get(HttpMethod.GET, { url: getUrl });

            await repositoryCache.clearCache();

            //After clearCache, should call fetchHttpRequest get method
            await repositoryCache.getList(HttpMethod.GET, { url: listUrl });
            await repositoryCache.get(HttpMethod.GET, { url: getUrl });

            expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(4)
        });

        it('should clear the entire cache even when cache are eternal', async () => {
            const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue(defaultResponseData);
            const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);

            await repositoryCache.getList(HttpMethod.GET, { url: listUrl });
            await repositoryCache.get(HttpMethod.GET, { url: getUrl });

            jest.advanceTimersByTime(defaultExpiringCacheTimeToAdvance);

            //should not call fetchHttpRequest get method
            await repositoryCache.getList(HttpMethod.GET, { url: listUrl });
            await repositoryCache.get(HttpMethod.GET, { url: getUrl });

            await repositoryCache.clearCache();

            //After clearCache, should call fetchHttpRequest get method
            await repositoryCache.getList(HttpMethod.GET, { url: listUrl });
            await repositoryCache.get(HttpMethod.GET, { url: getUrl });

            expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(4)
        });
    });

    describe("clearListsCache", () => {
        it('should clear only lists cache even when they has lifetime', async () => {
            const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue(defaultResponseData);
            const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id');

            await repositoryCache.getList(HttpMethod.GET, { url: listUrl });
            await repositoryCache.get(HttpMethod.GET, { url: getUrl });

            //advance time to 30s
            jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

            //should not call fetchHttpRequest get method
            await repositoryCache.getList(HttpMethod.GET, { url: listUrl });
            await repositoryCache.get(HttpMethod.GET, { url: getUrl });

            await repositoryCache.clearListsCache();

            //After clearListsCache, should call fetchHttpRequest get method for list request
            await repositoryCache.getList(HttpMethod.GET, { url: listUrl });

            //should not call fetchHttpRequest get method for occurrence requests
            await repositoryCache.get(HttpMethod.GET, { url: getUrl });
            await repositoryCache.get(HttpMethod.GET, { url: getUrl });
            await repositoryCache.get(HttpMethod.GET, { url: getUrl });

            expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(3);
        });

        it('should clear only lists cache even when cache are eternal', async () => {
            const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue(defaultResponseData);
            const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);

            await repositoryCache.getList(HttpMethod.GET, { url: listUrl });
            await repositoryCache.get(HttpMethod.GET, { url: getUrl });

            jest.advanceTimersByTime(defaultExpiringCacheTimeToAdvance);

            //should not call fetchHttpRequest get method
            await repositoryCache.getList(HttpMethod.GET, { url: listUrl });
            await repositoryCache.get(HttpMethod.GET, { url: getUrl });

            await repositoryCache.clearListsCache();

            //After clearListsCache, should call fetchHttpRequest get method for list request
            await repositoryCache.getList(HttpMethod.GET, { url: listUrl });

            //should not call fetchHttpRequest get method for occurrence requests
            await repositoryCache.get(HttpMethod.GET, { url: getUrl });
            await repositoryCache.get(HttpMethod.GET, { url: getUrl });
            await repositoryCache.get(HttpMethod.GET, { url: getUrl });

            expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(3);
        });
    });

    describe("clearOccurrenceCache", () => {
        it('should clear only occurrence cache even when they has lifetime', async () => {
            const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue(defaultResponseData);
            const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id');

            await repositoryCache.getList(HttpMethod.GET, { url: listUrl });
            await repositoryCache.get(HttpMethod.GET, { url: getUrl });

            //advance time to 30s
            jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

            //should not call fetchHttpRequest get method
            await repositoryCache.getList(HttpMethod.GET, { url: listUrl });
            await repositoryCache.get(HttpMethod.GET, { url: getUrl });

            await repositoryCache.clearOccurrenceCache(defaultId);

            //After clearOccurrenceCache, should call fetchHttpRequest get method for occurrence request
            await repositoryCache.get(HttpMethod.GET, { url: getUrl });

            //should not call fetchHttpRequest get method for list requests
            await repositoryCache.getList(HttpMethod.GET, { url: listUrl });
            await repositoryCache.getList(HttpMethod.GET, { url: listUrl });
            await repositoryCache.getList(HttpMethod.GET, { url: listUrl });
            await repositoryCache.getList(HttpMethod.GET, { url: listUrl });

            expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(3);
        });
        it('should clear only occurrence cache even when they are eternal', async () => {
            const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue(defaultResponseData);
            const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);

            await repositoryCache.getList(HttpMethod.GET, { url: listUrl });
            await repositoryCache.get(HttpMethod.GET, { url: getUrl });

            jest.advanceTimersByTime(defaultExpiringCacheTimeToAdvance);

            //should not call fetchHttpRequest get method
            await repositoryCache.getList(HttpMethod.GET, { url: listUrl });
            await repositoryCache.get(HttpMethod.GET, { url: getUrl });

            await repositoryCache.clearOccurrenceCache(defaultId);

            //After clearOccurrenceCache, should call fetchHttpRequest get method for occurrence request
            await repositoryCache.get(HttpMethod.GET, { url: getUrl });

            //should not call fetchHttpRequest get method for list requests
            await repositoryCache.getList(HttpMethod.GET, { url: listUrl });
            await repositoryCache.getList(HttpMethod.GET, { url: listUrl });
            await repositoryCache.getList(HttpMethod.GET, { url: listUrl });
            await repositoryCache.getList(HttpMethod.GET, { url: listUrl });

            expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(3);
        });

        it('should clear occurrence when get response has item in sub property', async () => {
            const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue({ property: { subProperty: defaultResponseData } });
            const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);

            await repositoryCache.getList(HttpMethod.GET, { url: listUrl });
            await repositoryCache.get(HttpMethod.GET, { url: getUrl });

            jest.advanceTimersByTime(defaultExpiringCacheTimeToAdvance);

            //should not call fetchHttpRequest get method
            await repositoryCache.getList(HttpMethod.GET, { url: listUrl });
            await repositoryCache.get(HttpMethod.GET, { url: getUrl });

            await repositoryCache.clearOccurrenceCache(defaultId, ['property', 'subProperty']);

            //After clearOccurrenceCache, should call fetchHttpRequest get method for occurrence request
            await repositoryCache.get(HttpMethod.GET, { url: getUrl });

            //should not call fetchHttpRequest get method for list requests
            await repositoryCache.getList(HttpMethod.GET, { url: listUrl });
            await repositoryCache.getList(HttpMethod.GET, { url: listUrl });
            await repositoryCache.getList(HttpMethod.GET, { url: listUrl });
            await repositoryCache.getList(HttpMethod.GET, { url: listUrl });

            expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(3);
        });
    });

    describe("doHttpRequest", () => {
        describe('should do http request with good method and HttpRequestParams', () => {
            let spyFetchHttpRequestGet: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<never, FetchRequestOptions>], any>;
            let spyFetchHttpRequestPost: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions>], any>;
            let spyFetchHttpRequestPatch: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions>], any>;
            let spyFetchHttpRequestPut: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions>], any>;
            let spyFetchHttpRequestDelete: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<never, FetchRequestOptions>], any>;

            beforeEach(() => {
                spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue({ property: { subProperty: defaultResponseData } });
                spyFetchHttpRequestPost = jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue({ property: { subProperty: defaultResponseData } });
                spyFetchHttpRequestPatch = jest.spyOn(fetchHttpRequest, 'patch').mockResolvedValue({ property: { subProperty: defaultResponseData } });
                spyFetchHttpRequestPut = jest.spyOn(fetchHttpRequest, 'put').mockResolvedValue({ property: { subProperty: defaultResponseData } });
                spyFetchHttpRequestDelete = jest.spyOn(fetchHttpRequest, 'delete').mockResolvedValue({ property: { subProperty: defaultResponseData } });
            });

            afterEach(() => {
                jest.resetAllMocks();
            });
            describe("should do http request with good methods", () => {
                it('should do http request with GET method', () => {
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    repositoryCache.doHttpRequest(HttpMethod.GET, { url: listUrl });

                    expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(1);
                    expect(spyFetchHttpRequestPost).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPatch).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPut).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestDelete).not.toHaveBeenCalled();
                });
                it('should do http request with POST method', () => {
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    repositoryCache.doHttpRequest(HttpMethod.POST, { url: listUrl });

                    expect(spyFetchHttpRequestPost).toHaveBeenCalledTimes(1);
                    expect(spyFetchHttpRequestGet).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPatch).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPut).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestDelete).not.toHaveBeenCalled();
                });
                it('should do http request with PATCH method', () => {
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    repositoryCache.doHttpRequest(HttpMethod.PATCH, { url: listUrl });

                    expect(spyFetchHttpRequestPatch).toHaveBeenCalledTimes(1);
                    expect(spyFetchHttpRequestGet).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPost).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPut).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestDelete).not.toHaveBeenCalled();
                });
                it('should do http request with PUT method', () => {
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    repositoryCache.doHttpRequest(HttpMethod.PUT, { url: listUrl });

                    expect(spyFetchHttpRequestPut).toHaveBeenCalledTimes(1);
                    expect(spyFetchHttpRequestGet).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPost).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPatch).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestDelete).not.toHaveBeenCalled();
                });
                it('should do http request with DELETE method', () => {
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    repositoryCache.doHttpRequest(HttpMethod.DELETE, { url: listUrl });

                    expect(spyFetchHttpRequestDelete).toHaveBeenCalledTimes(1);
                    expect(spyFetchHttpRequestGet).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPost).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPatch).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPut).not.toHaveBeenCalled();
                });
            });
            describe("should do http request with good HttpRequestParams", () => {
                const httpRequestParams: HttpRequestParams<never, FetchRequestOptions> = {
                    url: listUrl,
                    headers: { accept: '*/*', "user-agent": 'Jest' },
                    contentTypeJSON: true,
                    successStatusCodes: [206, 207, 208]
                };
                it("should do GET http request with good HttpRequestParams", async () => {
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    await repositoryCache.doHttpRequest(HttpMethod.GET, httpRequestParams);

                    expect(fetchHttpRequest.get).toHaveBeenCalledWith(httpRequestParams);
                });
                it("should do POST http request with good HttpRequestParams", async () => {
                    const body = { id: 5, data: 'data' };
                    const customHttpRequestParams = { ...httpRequestParams, body };

                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    await repositoryCache.doHttpRequest(HttpMethod.POST, customHttpRequestParams);

                    expect(fetchHttpRequest.post).toHaveBeenCalledWith(customHttpRequestParams);
                });
                it("should do PATCH http request with good HttpRequestParams", async () => {
                    const body = { id: 5, data: 'data' };
                    const customHttpRequestParams = { ...httpRequestParams, body };

                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    await repositoryCache.doHttpRequest(HttpMethod.PATCH, customHttpRequestParams);

                    expect(fetchHttpRequest.patch).toHaveBeenCalledWith(customHttpRequestParams);
                });
                it("should do PUT http request with good HttpRequestParams", async () => {
                    const body = { id: 5, data: 'data' };
                    const customHttpRequestParams = { ...httpRequestParams, body };

                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    await repositoryCache.doHttpRequest(HttpMethod.PUT, customHttpRequestParams);

                    expect(fetchHttpRequest.put).toHaveBeenCalledWith(customHttpRequestParams);
                });
                it("should do DELETE http request with good HttpRequestParams", async () => {
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    await repositoryCache.doHttpRequest(HttpMethod.DELETE, httpRequestParams);

                    expect(fetchHttpRequest.delete).toHaveBeenCalledWith(httpRequestParams);
                });
            });
        });

        describe('should return the response http request did', () => {
            const resolvedValue = { property: { subProperty: defaultResponseData } };

            it('should return the response http request did with GET method', async () => {
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue(resolvedValue);
                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                expect(repositoryCache.doHttpRequest(HttpMethod.GET, { url: listUrl })).resolves.toEqual(resolvedValue);
            });

            it('should return the response http request did with POST method', async () => {
                jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue(resolvedValue);
                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                expect(repositoryCache.doHttpRequest(HttpMethod.POST, { url: listUrl })).resolves.toEqual(resolvedValue);
            });

            it('should return the response http request did with PATCH method', async () => {
                jest.spyOn(fetchHttpRequest, 'patch').mockResolvedValue(resolvedValue);
                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                expect(repositoryCache.doHttpRequest(HttpMethod.PATCH, { url: listUrl })).resolves.toEqual(resolvedValue);
            });

            it('should return the response http request did with PUT method', async () => {
                jest.spyOn(fetchHttpRequest, 'put').mockResolvedValue(resolvedValue);
                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                expect(repositoryCache.doHttpRequest(HttpMethod.PUT, { url: listUrl })).resolves.toEqual(resolvedValue);
            });

            it('should return the response http request did with DELETE method', async () => {
                jest.spyOn(fetchHttpRequest, 'delete').mockResolvedValue(resolvedValue);
                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                expect(repositoryCache.doHttpRequest(HttpMethod.DELETE, { url: listUrl })).resolves.toEqual(resolvedValue);
            });
        });
    });

    describe("getList", () => {
        describe('should do http request with good method and HttpRequestParams', () => {
            let spyFetchHttpRequestGet: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<never, FetchRequestOptions>], any>;
            let spyFetchHttpRequestPost: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions>], any>;
            let spyFetchHttpRequestPatch: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions>], any>;
            let spyFetchHttpRequestPut: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions>], any>;
            let spyFetchHttpRequestDelete: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<never, FetchRequestOptions>], any>;

            beforeEach(() => {
                spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue({ property: { subProperty: defaultResponseData } });
                spyFetchHttpRequestPost = jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue({ property: { subProperty: defaultResponseData } });
                spyFetchHttpRequestPatch = jest.spyOn(fetchHttpRequest, 'patch').mockResolvedValue({ property: { subProperty: defaultResponseData } });
                spyFetchHttpRequestPut = jest.spyOn(fetchHttpRequest, 'put').mockResolvedValue({ property: { subProperty: defaultResponseData } });
                spyFetchHttpRequestDelete = jest.spyOn(fetchHttpRequest, 'delete').mockResolvedValue({ property: { subProperty: defaultResponseData } });
            });

            afterEach(() => {
                jest.resetAllMocks();
            });
            describe("should do http request with good methods", () => {
                it('should do http request with GET method', () => {
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    repositoryCache.getList(HttpMethod.GET, { url: listUrl });

                    expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(1);
                    expect(spyFetchHttpRequestPost).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPatch).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPut).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestDelete).not.toHaveBeenCalled();
                });
                it('should do http request with POST method', () => {
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    repositoryCache.getList(HttpMethod.POST, { url: listUrl });

                    expect(spyFetchHttpRequestPost).toHaveBeenCalledTimes(1);
                    expect(spyFetchHttpRequestGet).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPatch).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPut).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestDelete).not.toHaveBeenCalled();
                });
                it('should do http request with PATCH method', () => {
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    repositoryCache.getList(HttpMethod.PATCH, { url: listUrl });

                    expect(spyFetchHttpRequestPatch).toHaveBeenCalledTimes(1);
                    expect(spyFetchHttpRequestGet).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPost).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPut).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestDelete).not.toHaveBeenCalled();
                });
                it('should do http request with PUT method', () => {
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    repositoryCache.getList(HttpMethod.PUT, { url: listUrl });

                    expect(spyFetchHttpRequestPut).toHaveBeenCalledTimes(1);
                    expect(spyFetchHttpRequestGet).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPost).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPatch).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestDelete).not.toHaveBeenCalled();
                });
                it('should do http request with DELETE method', () => {
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    repositoryCache.getList(HttpMethod.DELETE, { url: listUrl });

                    expect(spyFetchHttpRequestDelete).toHaveBeenCalledTimes(1);
                    expect(spyFetchHttpRequestGet).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPost).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPatch).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPut).not.toHaveBeenCalled();
                });
            });
            describe("should do http request with good HttpRequestParams", () => {
                const httpRequestParams: HttpRequestParams<never, FetchRequestOptions> = {
                    url: listUrl,
                    headers: { accept: '*/*', "user-agent": 'Jest' },
                    contentTypeJSON: true,
                    successStatusCodes: [206, 207, 208]
                };
                it("should do GET http request with good HttpRequestParams", async () => {
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    await repositoryCache.getList(HttpMethod.GET, httpRequestParams);

                    expect(fetchHttpRequest.get).toHaveBeenCalledWith(httpRequestParams);
                });
                it("should do POST http request with good HttpRequestParams", async () => {
                    const body = { id: 5, data: 'data' };
                    const customHttpRequestParams = { ...httpRequestParams, body };

                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    await repositoryCache.getList(HttpMethod.POST, customHttpRequestParams);

                    expect(fetchHttpRequest.post).toHaveBeenCalledWith(customHttpRequestParams);
                });
                it("should do PATCH http request with good HttpRequestParams", async () => {
                    const body = { id: 5, data: 'data' };
                    const customHttpRequestParams = { ...httpRequestParams, body };

                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    await repositoryCache.getList(HttpMethod.PATCH, customHttpRequestParams);

                    expect(fetchHttpRequest.patch).toHaveBeenCalledWith(customHttpRequestParams);
                });
                it("should do PUT http request with good HttpRequestParams", async () => {
                    const body = { id: 5, data: 'data' };
                    const customHttpRequestParams = { ...httpRequestParams, body };

                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    await repositoryCache.getList(HttpMethod.PUT, customHttpRequestParams);

                    expect(fetchHttpRequest.put).toHaveBeenCalledWith(customHttpRequestParams);
                });
                it("should do DELETE http request with good HttpRequestParams", async () => {
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    await repositoryCache.getList(HttpMethod.DELETE, httpRequestParams);

                    expect(fetchHttpRequest.delete).toHaveBeenCalledWith(httpRequestParams);
                });
            });
        });

        describe('should return the response http request did', () => {
            const resolvedValue = { property: { subProperty: defaultResponseData } };

            it('should return the response http request did with GET method', async () => {
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue(resolvedValue);
                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                expect(repositoryCache.getList(HttpMethod.GET, { url: listUrl })).resolves.toEqual(resolvedValue);
            });

            it('should return the response http request did with POST method', async () => {
                jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue(resolvedValue);
                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                expect(repositoryCache.getList(HttpMethod.POST, { url: listUrl })).resolves.toEqual(resolvedValue);
            });

            it('should return the response http request did with PATCH method', async () => {
                jest.spyOn(fetchHttpRequest, 'patch').mockResolvedValue(resolvedValue);
                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                expect(repositoryCache.getList(HttpMethod.PATCH, { url: listUrl })).resolves.toEqual(resolvedValue);
            });

            it('should return the response http request did with PUT method', async () => {
                jest.spyOn(fetchHttpRequest, 'put').mockResolvedValue(resolvedValue);
                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                expect(repositoryCache.getList(HttpMethod.PUT, { url: listUrl })).resolves.toEqual(resolvedValue);
            });

            it('should return the response http request did with DELETE method', async () => {
                jest.spyOn(fetchHttpRequest, 'delete').mockResolvedValue(resolvedValue);
                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                expect(repositoryCache.getList(HttpMethod.DELETE, { url: listUrl })).resolves.toEqual(resolvedValue);
            });
        });

        describe('should return the cached success response request and not do http request for every time when cache validity is eternal', () => {
            const resolvedValue = { property: { subProperty: defaultResponseData } };
            const httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions> = { url: listUrl };

            let repositoryCache: RepositoryCache<FetchRequestOptions>;

            beforeEach(() => {
                repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
            });

            it('should return the cached success response request and not do http request for every time when cache validity is eternal with GET method', async () => {
                const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue(resolvedValue);
                await repositoryCache.getList(HttpMethod.GET, httpRequestParams);

                //advance time to 120s
                jest.advanceTimersByTime(defaultExpiringCacheTimeToAdvance);

                const response = await repositoryCache.getList(HttpMethod.GET, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(1);
            });

            it('should return the cached success response request and not do http request for every time when cache validity is eternal with POST method', async () => {
                const spyFetchHttpRequestPost = jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue(resolvedValue);
                await repositoryCache.getList(HttpMethod.POST, httpRequestParams);

                //advance time to 120s
                jest.advanceTimersByTime(defaultExpiringCacheTimeToAdvance);

                const response = await repositoryCache.getList(HttpMethod.POST, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestPost).toHaveBeenCalledTimes(1);
            });

            it('should return the cached success response request and not do http request for every time when cache validity is eternal with PATCH method', async () => {
                const spyFetchHttpRequestPatch = jest.spyOn(fetchHttpRequest, 'patch').mockResolvedValue(resolvedValue);
                await repositoryCache.getList(HttpMethod.PATCH, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                const response = await repositoryCache.getList(HttpMethod.PATCH, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestPatch).toHaveBeenCalledTimes(1);
            });

            it('should return the cached success response request and not do http request for every time when cache validity is eternal with PUT method', async () => {
                const spyFetchHttpRequestPut = jest.spyOn(fetchHttpRequest, 'put').mockResolvedValue(resolvedValue);
                await repositoryCache.getList(HttpMethod.PUT, httpRequestParams);

                //advance time to 120s
                jest.advanceTimersByTime(defaultExpiringCacheTimeToAdvance);

                const response = await repositoryCache.getList(HttpMethod.PUT, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestPut).toHaveBeenCalledTimes(1);
            });

            it('should return the cached success response request and not do http request for every time when cache validity is eternal with DELETE method', async () => {
                const spyFetchHttpRequestDelete = jest.spyOn(fetchHttpRequest, 'delete').mockResolvedValue(resolvedValue);
                await repositoryCache.getList(HttpMethod.DELETE, httpRequestParams);

                //advance time to 120s
                jest.advanceTimersByTime(defaultExpiringCacheTimeToAdvance);

                const response = await repositoryCache.getList(HttpMethod.DELETE, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestDelete).toHaveBeenCalledTimes(1);
            });
        });

        describe('should return the cached success response request and not do http request during the cache validity timestamp', () => {
            const resolvedValue = { property: { subProperty: defaultResponseData } };
            const httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions> = { url: listUrl };

            let repositoryCache: RepositoryCache<FetchRequestOptions>;

            beforeEach(() => {
                repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
            });

            it('should return the cached success response request and not do http request during the cache validity timestamp with GET method', async () => {
                const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue(resolvedValue);
                await repositoryCache.getList(HttpMethod.GET, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                const response = await repositoryCache.getList(HttpMethod.GET, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(1);
            });

            it('should return the cached success response request and not do http request during the cache validity timestamp with POST method', async () => {
                const spyFetchHttpRequestPost = jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue(resolvedValue);
                await repositoryCache.getList(HttpMethod.POST, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                const response = await repositoryCache.getList(HttpMethod.POST, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestPost).toHaveBeenCalledTimes(1);
            });

            it('should return the cached success response request and not do http request during the cache validity timestamp with PATCH method', async () => {
                const spyFetchHttpRequestPatch = jest.spyOn(fetchHttpRequest, 'patch').mockResolvedValue(resolvedValue);
                await repositoryCache.getList(HttpMethod.PATCH, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                const response = await repositoryCache.getList(HttpMethod.PATCH, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestPatch).toHaveBeenCalledTimes(1);
            });

            it('should return the cached success response request and not do http request during the cache validity timestamp with PUT method', async () => {
                const spyFetchHttpRequestPut = jest.spyOn(fetchHttpRequest, 'put').mockResolvedValue(resolvedValue);
                await repositoryCache.getList(HttpMethod.PUT, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                const response = await repositoryCache.getList(HttpMethod.PUT, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestPut).toHaveBeenCalledTimes(1);
            });

            it('should return the cached success response request and not do http request during the cache validity timestamp with DELETE method', async () => {
                const spyFetchHttpRequestDelete = jest.spyOn(fetchHttpRequest, 'delete').mockResolvedValue(resolvedValue);
                await repositoryCache.getList(HttpMethod.DELETE, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                const response = await repositoryCache.getList(HttpMethod.DELETE, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestDelete).toHaveBeenCalledTimes(1);
            });
        });

        describe("should don't be cache available when validity timestamp passed and do http request", () => {
            const resolvedValue = { property: { subProperty: defaultResponseData } };
            const httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions> = { url: listUrl };

            let repositoryCache: RepositoryCache<FetchRequestOptions>;

            beforeEach(() => {
                repositoryCache = new RepositoryCache(fetchHttpRequest, 'id');
            });

            it("should don't be cache available when validity timestamp passed and do http request with GET method", async () => {
                const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue(resolvedValue);
                await repositoryCache.getList(HttpMethod.GET, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultExpiringCacheTimeToAdvance);

                const response = await repositoryCache.getList(HttpMethod.GET, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(2);
            });
            it("should don't be cache available when validity timestamp passed and do http request with POST method", async () => {
                const spyFetchHttpRequestPost = jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue(resolvedValue);
                await repositoryCache.getList(HttpMethod.POST, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultExpiringCacheTimeToAdvance);

                const response = await repositoryCache.getList(HttpMethod.POST, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestPost).toHaveBeenCalledTimes(2);
            });
            it("should don't be cache available when validity timestamp passed and do http request with PATCH method", async () => {
                const spyFetchHttpRequestPatch = jest.spyOn(fetchHttpRequest, 'patch').mockResolvedValue(resolvedValue);
                await repositoryCache.getList(HttpMethod.PATCH, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultExpiringCacheTimeToAdvance);

                const response = await repositoryCache.getList(HttpMethod.PATCH, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestPatch).toHaveBeenCalledTimes(2);
            });
            it("should don't be cache available when validity timestamp passed and do http request with PUT method", async () => {
                const spyFetchHttpRequestPut = jest.spyOn(fetchHttpRequest, 'put').mockResolvedValue(resolvedValue);
                await repositoryCache.getList(HttpMethod.PUT, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultExpiringCacheTimeToAdvance);

                const response = await repositoryCache.getList(HttpMethod.PUT, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestPut).toHaveBeenCalledTimes(2);
            });
            it("should don't be cache available when validity timestamp passed and do http request with DELETE method", async () => {
                const spyFetchHttpRequestDelete = jest.spyOn(fetchHttpRequest, 'delete').mockResolvedValue(resolvedValue);
                await repositoryCache.getList(HttpMethod.DELETE, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultExpiringCacheTimeToAdvance);

                const response = await repositoryCache.getList(HttpMethod.DELETE, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestDelete).toHaveBeenCalledTimes(2);
            });
        });

        describe('should not return the cached success response request and do http request during the cache validity timestamp when method change', () => {
            const resolvedValue = { property: { subProperty: defaultResponseData } };
            const httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions> = { url: listUrl };

            it('should not return the cached success response request and do http request during the cache validity timestamp when method change with GET method', async () => {
                const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue(resolvedValue);
                const spyFetchHttpRequestPost = jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue(resolvedValue);

                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id');
                await repositoryCache.getList(HttpMethod.GET, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                const response = await repositoryCache.getList(HttpMethod.POST, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(1);
                expect(spyFetchHttpRequestPost).toHaveBeenCalledTimes(1);
            });
            it('should not return the cached success response request and do http request during the cache validity timestamp when method change with POST method', async () => {
                const spyFetchHttpRequestPost = jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue(resolvedValue);
                const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue(resolvedValue);

                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id');
                await repositoryCache.getList(HttpMethod.POST, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                const response = await repositoryCache.getList(HttpMethod.GET, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestPost).toHaveBeenCalledTimes(1);
                expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(1);
            });
            it('should not return the cached success response request and do http request during the cache validity timestamp when method change with PATCH method', async () => {
                const spyFetchHttpRequestPatch = jest.spyOn(fetchHttpRequest, 'patch').mockResolvedValue(resolvedValue);
                const spyFetchHttpRequestPost = jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue(resolvedValue);

                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id');
                await repositoryCache.getList(HttpMethod.PATCH, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                const response = await repositoryCache.getList(HttpMethod.POST, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestPatch).toHaveBeenCalledTimes(1);
                expect(spyFetchHttpRequestPost).toHaveBeenCalledTimes(1);
            });
            it('should not return the cached success response request and do http request during the cache validity timestamp when method change with PUT method', async () => {
                const spyFetchHttpRequestPut = jest.spyOn(fetchHttpRequest, 'put').mockResolvedValue(resolvedValue);
                const spyFetchHttpRequestPatch = jest.spyOn(fetchHttpRequest, 'patch').mockResolvedValue(resolvedValue);

                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id');
                await repositoryCache.getList(HttpMethod.PUT, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                const response = await repositoryCache.getList(HttpMethod.PATCH, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestPut).toHaveBeenCalledTimes(1);
                expect(spyFetchHttpRequestPatch).toHaveBeenCalledTimes(1);
            });
            it('should not return the cached success response request and do http request during the cache validity timestamp when method change with DELETE method', async () => {
                const spyFetchHttpRequestDelete = jest.spyOn(fetchHttpRequest, 'delete').mockResolvedValue(resolvedValue);
                const spyFetchHttpRequestPut = jest.spyOn(fetchHttpRequest, 'put').mockResolvedValue(resolvedValue);

                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id');
                await repositoryCache.getList(HttpMethod.DELETE, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                const response = await repositoryCache.getList(HttpMethod.PUT, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestDelete).toHaveBeenCalledTimes(1);
                expect(spyFetchHttpRequestPut).toHaveBeenCalledTimes(1);
            });
        });

        describe('should not return the cached success response request and do http request during the cache validity timestamp when httpRequestParams contentTypeJSON property change according cached request', () => {
            const resolvedValue = { property: { subProperty: defaultResponseData } };
            const httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions> = { url: listUrl, contentTypeJSON: true };

            let repositoryCache: RepositoryCache<FetchRequestOptions>;
            beforeEach(() => {
                repositoryCache = new RepositoryCache(fetchHttpRequest, 'id');
            });

            it('should not return the cached success response request and do http request during the cache validity timestamp when httpRequestParams contentTypeJSON property change according cached request with GET method', async () => {
                const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue(resolvedValue);

                await repositoryCache.getList(HttpMethod.GET, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                const response = await repositoryCache.getList(HttpMethod.GET, { ...httpRequestParams, contentTypeJSON: false });

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(2);
            });
            it('should not return the cached success response request and do http request during the cache validity timestamp when httpRequestParams contentTypeJSON property change according cached request with POST method', async () => {
                const spyFetchHttpRequestPost = jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue(resolvedValue);

                await repositoryCache.getList(HttpMethod.POST, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                const response = await repositoryCache.getList(HttpMethod.POST, { ...httpRequestParams, contentTypeJSON: false });

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestPost).toHaveBeenCalledTimes(2);
            });
            it('should not return the cached success response request and do http request during the cache validity timestamp when httpRequestParams contentTypeJSON property change according cached request with PATCH method', async () => {
                const spyFetchHttpRequestPatch = jest.spyOn(fetchHttpRequest, 'patch').mockResolvedValue(resolvedValue);

                await repositoryCache.getList(HttpMethod.PATCH, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                const response = await repositoryCache.getList(HttpMethod.PATCH, { ...httpRequestParams, contentTypeJSON: false });

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestPatch).toHaveBeenCalledTimes(2);
            });
            it('should not return the cached success response request and do http request during the cache validity timestamp when httpRequestParams contentTypeJSON property change according cached request with PUT method', async () => {
                const spyFetchHttpRequestPut = jest.spyOn(fetchHttpRequest, 'put').mockResolvedValue(resolvedValue);

                await repositoryCache.getList(HttpMethod.PUT, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                const response = await repositoryCache.getList(HttpMethod.PUT, { ...httpRequestParams, contentTypeJSON: false });

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestPut).toHaveBeenCalledTimes(2);
            });
            it('should not return the cached success response request and do http request during the cache validity timestamp when httpRequestParams contentTypeJSON property change according cached request with DELETE method', async () => {
                const spyFetchHttpRequestDelete = jest.spyOn(fetchHttpRequest, 'delete').mockResolvedValue(resolvedValue);

                await repositoryCache.getList(HttpMethod.DELETE, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                const response = await repositoryCache.getList(HttpMethod.DELETE, { ...httpRequestParams, contentTypeJSON: false });

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestDelete).toHaveBeenCalledTimes(2);
            });
        });

        describe('should not return the cached success response request and do http request during the cache validity timestamp when auth token definition change according cached request', () => {
            const resolvedValue = { property: { subProperty: defaultResponseData } };
            const httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions> = { url: listUrl };
            const customHeaders = { Authorization: 'Bearer 51616516' }

            let repositoryCache: RepositoryCache<FetchRequestOptions>;
            beforeEach(() => {
                repositoryCache = new RepositoryCache(fetchHttpRequest, 'id');
            });

            it('should not return the cached success response request and do http request during the cache validity timestamp when auth token definition change according cached request with GET method', async () => {
                const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue(resolvedValue);

                await repositoryCache.getList(HttpMethod.GET, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                //custom headers build
                jest.spyOn(fetchHttpRequest, 'buildRequestHeader').mockReturnValue(customHeaders);

                const response = await repositoryCache.getList(HttpMethod.GET, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(2);
            });
            it('should not return the cached success response request and do http request during the cache validity timestamp when auth token definition change according cached request with POST method', async () => {
                const spyFetchHttpRequestPost = jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue(resolvedValue);

                await repositoryCache.getList(HttpMethod.POST, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                //custom headers build
                jest.spyOn(fetchHttpRequest, 'buildRequestHeader').mockReturnValue(customHeaders);

                const response = await repositoryCache.getList(HttpMethod.POST, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestPost).toHaveBeenCalledTimes(2);
            });
            it('should not return the cached success response request and do http request during the cache validity timestamp when auth token definition change according cached request with PATCH method', async () => {
                const spyFetchHttpRequestPatch = jest.spyOn(fetchHttpRequest, 'patch').mockResolvedValue(resolvedValue);

                await repositoryCache.getList(HttpMethod.PATCH, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                //custom headers build
                jest.spyOn(fetchHttpRequest, 'buildRequestHeader').mockReturnValue(customHeaders);

                const response = await repositoryCache.getList(HttpMethod.PATCH, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestPatch).toHaveBeenCalledTimes(2);
            });
            it('should not return the cached success response request and do http request during the cache validity timestamp when auth token definition change according cached request with PUT method', async () => {
                const spyFetchHttpRequestPut = jest.spyOn(fetchHttpRequest, 'put').mockResolvedValue(resolvedValue);

                await repositoryCache.getList(HttpMethod.PUT, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                //custom headers build
                jest.spyOn(fetchHttpRequest, 'buildRequestHeader').mockReturnValue(customHeaders);

                const response = await repositoryCache.getList(HttpMethod.PUT, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestPut).toHaveBeenCalledTimes(2);
            });
            it('should not return the cached success response request and do http request during the cache validity timestamp when auth token definition change according cached request with DELETE method', async () => {
                const spyFetchHttpRequestDelete = jest.spyOn(fetchHttpRequest, 'delete').mockResolvedValue(resolvedValue);

                await repositoryCache.getList(HttpMethod.DELETE, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                //custom headers build
                jest.spyOn(fetchHttpRequest, 'buildRequestHeader').mockReturnValue(customHeaders);

                const response = await repositoryCache.getList(HttpMethod.DELETE, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestDelete).toHaveBeenCalledTimes(2);
            });
        });

        describe('should not cache the failed response request', () => {
            const rejectedValue: HttpException = { type: DefaultHttpExceptionType.SERVER_UNAVAILABLE, body: { message: 'server not available' } };
            const httpRequestParams: HttpRequestParams<void, FetchRequestOptions> = { url: listUrl };

            let repositoryCache: RepositoryCache<FetchRequestOptions>;
            beforeEach(() => {
                repositoryCache = new RepositoryCache(fetchHttpRequest, 'id');
            });

            it('should not cache the failed response request with GET method', async () => {
                const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockRejectedValue(rejectedValue);

                try {
                    await repositoryCache.getList(HttpMethod.GET, httpRequestParams);
                }
                catch (exception) {
                    expect(exception).toEqual(rejectedValue);
                }

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                try {
                    await repositoryCache.getList(HttpMethod.GET, httpRequestParams);
                }
                catch (exception) {
                    expect(exception).toEqual(rejectedValue);
                    expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(2);
                }

            });
            it('should not cache the failed response request with POST method', async () => {
                const spyFetchHttpRequestPost = jest.spyOn(fetchHttpRequest, 'post').mockRejectedValue(rejectedValue);

                try {
                    await repositoryCache.getList(HttpMethod.POST, httpRequestParams);
                }
                catch (exception) {
                    expect(exception).toEqual(rejectedValue);
                }

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                try {
                    await repositoryCache.getList(HttpMethod.POST, httpRequestParams);
                }
                catch (exception) {
                    expect(exception).toEqual(rejectedValue);
                    expect(spyFetchHttpRequestPost).toHaveBeenCalledTimes(2);
                }
            });
            it('should not cache the failed response request with PATCH method', async () => {
                const spyFetchHttpRequestPatch = jest.spyOn(fetchHttpRequest, 'patch').mockRejectedValue(rejectedValue);

                try {
                    await repositoryCache.getList(HttpMethod.PATCH, httpRequestParams);
                }
                catch (exception) {
                    expect(exception).toEqual(rejectedValue);
                }

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                try {
                    await repositoryCache.getList(HttpMethod.PATCH, httpRequestParams);
                }
                catch (exception) {
                    expect(exception).toEqual(rejectedValue);
                    expect(spyFetchHttpRequestPatch).toHaveBeenCalledTimes(2);
                }
            });
            it('should not cache the failed response request with PUT method', async () => {
                const spyFetchHttpRequestPut = jest.spyOn(fetchHttpRequest, 'put').mockRejectedValue(rejectedValue);

                try {
                    await repositoryCache.getList(HttpMethod.PUT, httpRequestParams);
                }
                catch (exception) {
                    expect(exception).toEqual(rejectedValue);
                }

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                try {
                    await repositoryCache.getList(HttpMethod.PUT, httpRequestParams);
                }
                catch (exception) {
                    expect(exception).toEqual(rejectedValue);
                    expect(spyFetchHttpRequestPut).toHaveBeenCalledTimes(2);
                }
            });
            it('should not cache the failed response request with DELETE method', async () => {
                const spyFetchHttpRequestDelete = jest.spyOn(fetchHttpRequest, 'delete').mockRejectedValue(rejectedValue);

                try {
                    await repositoryCache.getList(HttpMethod.DELETE, httpRequestParams);
                }
                catch (exception) {
                    expect(exception).toEqual(rejectedValue);
                }

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                try {
                    await repositoryCache.getList(HttpMethod.DELETE, httpRequestParams);
                }
                catch (exception) {
                    expect(exception).toEqual(rejectedValue);
                    expect(spyFetchHttpRequestDelete).toHaveBeenCalledTimes(2);
                }
            });
        });
    });

    describe("get", () => {
        describe('should do http request with good method and HttpRequestParams', () => {
            let spyFetchHttpRequestGet: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<never, FetchRequestOptions>], any>;
            let spyFetchHttpRequestPost: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions>], any>;
            let spyFetchHttpRequestPatch: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions>], any>;
            let spyFetchHttpRequestPut: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions>], any>;
            let spyFetchHttpRequestDelete: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<never, FetchRequestOptions>], any>;

            beforeEach(() => {
                spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue({ property: { subProperty: defaultResponseData } });
                spyFetchHttpRequestPost = jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue({ property: { subProperty: defaultResponseData } });
                spyFetchHttpRequestPatch = jest.spyOn(fetchHttpRequest, 'patch').mockResolvedValue({ property: { subProperty: defaultResponseData } });
                spyFetchHttpRequestPut = jest.spyOn(fetchHttpRequest, 'put').mockResolvedValue({ property: { subProperty: defaultResponseData } });
                spyFetchHttpRequestDelete = jest.spyOn(fetchHttpRequest, 'delete').mockResolvedValue({ property: { subProperty: defaultResponseData } });
            });

            afterEach(() => {
                jest.resetAllMocks();
            });

            describe("should do http request with good methods", () => {
                it('should do http request with GET method', () => {
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    repositoryCache.get(HttpMethod.GET, { url: listUrl });

                    expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(1);
                    expect(spyFetchHttpRequestPost).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPatch).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPut).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestDelete).not.toHaveBeenCalled();
                });
                it('should do http request with POST method', () => {
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    repositoryCache.get(HttpMethod.POST, { url: listUrl });

                    expect(spyFetchHttpRequestPost).toHaveBeenCalledTimes(1);
                    expect(spyFetchHttpRequestGet).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPatch).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPut).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestDelete).not.toHaveBeenCalled();
                });
                it('should do http request with PATCH method', () => {
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    repositoryCache.get(HttpMethod.PATCH, { url: listUrl });

                    expect(spyFetchHttpRequestPatch).toHaveBeenCalledTimes(1);
                    expect(spyFetchHttpRequestGet).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPost).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPut).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestDelete).not.toHaveBeenCalled();
                });
                it('should do http request with PUT method', () => {
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    repositoryCache.get(HttpMethod.PUT, { url: listUrl });

                    expect(spyFetchHttpRequestPut).toHaveBeenCalledTimes(1);
                    expect(spyFetchHttpRequestGet).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPost).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPatch).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestDelete).not.toHaveBeenCalled();
                });
                it('should do http request with DELETE method', () => {
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    repositoryCache.get(HttpMethod.DELETE, { url: listUrl });

                    expect(spyFetchHttpRequestDelete).toHaveBeenCalledTimes(1);
                    expect(spyFetchHttpRequestGet).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPost).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPatch).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPut).not.toHaveBeenCalled();
                });
            });
            describe("should do http request with good HttpRequestParams", () => {
                const httpRequestParams: HttpRequestParams<never, FetchRequestOptions> = {
                    url: listUrl,
                    headers: { accept: '*/*', "user-agent": 'Jest' },
                    contentTypeJSON: true,
                    successStatusCodes: [206, 207, 208]
                };
                it("should do GET http request with good HttpRequestParams", async () => {
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    await repositoryCache.get(HttpMethod.GET, httpRequestParams);

                    expect(fetchHttpRequest.get).toHaveBeenCalledWith(httpRequestParams);
                });
                it("should do POST http request with good HttpRequestParams", async () => {
                    const body = { id: 5, data: 'data' };
                    const customHttpRequestParams = { ...httpRequestParams, body };

                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    await repositoryCache.get(HttpMethod.POST, customHttpRequestParams);

                    expect(fetchHttpRequest.post).toHaveBeenCalledWith(customHttpRequestParams);
                });
                it("should do PATCH http request with good HttpRequestParams", async () => {
                    const body = { id: 5, data: 'data' };
                    const customHttpRequestParams = { ...httpRequestParams, body };

                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    await repositoryCache.get(HttpMethod.PATCH, customHttpRequestParams);

                    expect(fetchHttpRequest.patch).toHaveBeenCalledWith(customHttpRequestParams);
                });
                it("should do PUT http request with good HttpRequestParams", async () => {
                    const body = { id: 5, data: 'data' };
                    const customHttpRequestParams = { ...httpRequestParams, body };

                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    await repositoryCache.get(HttpMethod.PUT, customHttpRequestParams);

                    expect(fetchHttpRequest.put).toHaveBeenCalledWith(customHttpRequestParams);
                });
                it("should do DELETE http request with good HttpRequestParams", async () => {
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    await repositoryCache.get(HttpMethod.DELETE, httpRequestParams);

                    expect(fetchHttpRequest.delete).toHaveBeenCalledWith(httpRequestParams);
                });
            });
        });

        describe('should return the response http request did', () => {
            const resolvedValue = { property: { subProperty: defaultResponseData } };

            it('should return the response http request did with GET method', async () => {
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue(resolvedValue);
                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                expect(repositoryCache.get(HttpMethod.GET, { url: listUrl })).resolves.toEqual(resolvedValue);
            });

            it('should return the response http request did with POST method', async () => {
                jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue(resolvedValue);
                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                expect(repositoryCache.get(HttpMethod.POST, { url: listUrl })).resolves.toEqual(resolvedValue);
            });

            it('should return the response http request did with PATCH method', async () => {
                jest.spyOn(fetchHttpRequest, 'patch').mockResolvedValue(resolvedValue);
                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                expect(repositoryCache.get(HttpMethod.PATCH, { url: listUrl })).resolves.toEqual(resolvedValue);
            });

            it('should return the response http request did with PUT method', async () => {
                jest.spyOn(fetchHttpRequest, 'put').mockResolvedValue(resolvedValue);
                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                expect(repositoryCache.get(HttpMethod.PUT, { url: listUrl })).resolves.toEqual(resolvedValue);
            });

            it('should return the response http request did with DELETE method', async () => {
                jest.spyOn(fetchHttpRequest, 'delete').mockResolvedValue(resolvedValue);
                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                expect(repositoryCache.get(HttpMethod.DELETE, { url: listUrl })).resolves.toEqual(resolvedValue);
            });
        });

        describe('should return the cached success response request and not do http request for every time when cache validity is eternal', () => {
            const resolvedValue = { property: { subProperty: defaultResponseData } };
            const httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions> = { url: listUrl };

            let repositoryCache: RepositoryCache<FetchRequestOptions>;

            beforeEach(() => {
                repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
            });

            it('should return the cached success response request and not do http request for every time when cache validity is eternal with GET method', async () => {
                const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue(resolvedValue);
                await repositoryCache.get(HttpMethod.GET, httpRequestParams);

                //advance time to 120s
                jest.advanceTimersByTime(defaultExpiringCacheTimeToAdvance);

                const response = await repositoryCache.get(HttpMethod.GET, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(1);
            });

            it('should return the cached success response request and not do http request for every time when cache validity is eternal with POST method', async () => {
                const spyFetchHttpRequestPost = jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue(resolvedValue);
                await repositoryCache.get(HttpMethod.POST, httpRequestParams);

                //advance time to 120s
                jest.advanceTimersByTime(defaultExpiringCacheTimeToAdvance);

                const response = await repositoryCache.get(HttpMethod.POST, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestPost).toHaveBeenCalledTimes(1);
            });

            it('should return the cached success response request and not do http request for every time when cache validity is eternal with PATCH method', async () => {
                const spyFetchHttpRequestPatch = jest.spyOn(fetchHttpRequest, 'patch').mockResolvedValue(resolvedValue);
                await repositoryCache.get(HttpMethod.PATCH, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                const response = await repositoryCache.get(HttpMethod.PATCH, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestPatch).toHaveBeenCalledTimes(1);
            });

            it('should return the cached success response request and not do http request for every time when cache validity is eternal with PUT method', async () => {
                const spyFetchHttpRequestPut = jest.spyOn(fetchHttpRequest, 'put').mockResolvedValue(resolvedValue);
                await repositoryCache.get(HttpMethod.PUT, httpRequestParams);

                //advance time to 120s
                jest.advanceTimersByTime(defaultExpiringCacheTimeToAdvance);

                const response = await repositoryCache.get(HttpMethod.PUT, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestPut).toHaveBeenCalledTimes(1);
            });

            it('should return the cached success response request and not do http request for every time when cache validity is eternal with DELETE method', async () => {
                const spyFetchHttpRequestDelete = jest.spyOn(fetchHttpRequest, 'delete').mockResolvedValue(resolvedValue);
                await repositoryCache.get(HttpMethod.DELETE, httpRequestParams);

                //advance time to 120s
                jest.advanceTimersByTime(defaultExpiringCacheTimeToAdvance);

                const response = await repositoryCache.get(HttpMethod.DELETE, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestDelete).toHaveBeenCalledTimes(1);
            });
        });

        describe('should return the cached success response request and not do http request during the cache validity timestamp', () => {
            const resolvedValue = { property: { subProperty: defaultResponseData } };
            const httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions> = { url: listUrl };

            let repositoryCache: RepositoryCache<FetchRequestOptions>;

            beforeEach(() => {
                repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
            });

            it('should return the cached success response request and not do http request during the cache validity timestamp with GET method', async () => {
                const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue(resolvedValue);
                await repositoryCache.get(HttpMethod.GET, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                const response = await repositoryCache.get(HttpMethod.GET, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(1);
            });

            it('should return the cached success response request and not do http request during the cache validity timestamp with POST method', async () => {
                const spyFetchHttpRequestPost = jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue(resolvedValue);
                await repositoryCache.get(HttpMethod.POST, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                const response = await repositoryCache.get(HttpMethod.POST, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestPost).toHaveBeenCalledTimes(1);
            });

            it('should return the cached success response request and not do http request during the cache validity timestamp with PATCH method', async () => {
                const spyFetchHttpRequestPatch = jest.spyOn(fetchHttpRequest, 'patch').mockResolvedValue(resolvedValue);
                await repositoryCache.get(HttpMethod.PATCH, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                const response = await repositoryCache.get(HttpMethod.PATCH, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestPatch).toHaveBeenCalledTimes(1);
            });

            it('should return the cached success response request and not do http request during the cache validity timestamp with PUT method', async () => {
                const spyFetchHttpRequestPut = jest.spyOn(fetchHttpRequest, 'put').mockResolvedValue(resolvedValue);
                await repositoryCache.get(HttpMethod.PUT, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                const response = await repositoryCache.get(HttpMethod.PUT, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestPut).toHaveBeenCalledTimes(1);
            });

            it('should return the cached success response request and not do http request during the cache validity timestamp with DELETE method', async () => {
                const spyFetchHttpRequestDelete = jest.spyOn(fetchHttpRequest, 'delete').mockResolvedValue(resolvedValue);
                await repositoryCache.get(HttpMethod.DELETE, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                const response = await repositoryCache.get(HttpMethod.DELETE, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestDelete).toHaveBeenCalledTimes(1);
            });
        });

        describe("should don't be cache available when validity timestamp passed and do http request", () => {
            const resolvedValue = { property: { subProperty: defaultResponseData } };
            const httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions> = { url: listUrl };

            let repositoryCache: RepositoryCache<FetchRequestOptions>;

            beforeEach(() => {
                repositoryCache = new RepositoryCache(fetchHttpRequest, 'id');
            });

            it("should don't be cache available when validity timestamp passed and do http request with GET method", async () => {
                const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue(resolvedValue);
                await repositoryCache.get(HttpMethod.GET, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultExpiringCacheTimeToAdvance);

                const response = await repositoryCache.get(HttpMethod.GET, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(2);
            });
            it("should don't be cache available when validity timestamp passed and do http request with POST method", async () => {
                const spyFetchHttpRequestPost = jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue(resolvedValue);
                await repositoryCache.get(HttpMethod.POST, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultExpiringCacheTimeToAdvance);

                const response = await repositoryCache.get(HttpMethod.POST, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestPost).toHaveBeenCalledTimes(2);
            });
            it("should don't be cache available when validity timestamp passed and do http request with PATCH method", async () => {
                const spyFetchHttpRequestPatch = jest.spyOn(fetchHttpRequest, 'patch').mockResolvedValue(resolvedValue);
                await repositoryCache.get(HttpMethod.PATCH, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultExpiringCacheTimeToAdvance);

                const response = await repositoryCache.get(HttpMethod.PATCH, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestPatch).toHaveBeenCalledTimes(2);
            });
            it("should don't be cache available when validity timestamp passed and do http request with PUT method", async () => {
                const spyFetchHttpRequestPut = jest.spyOn(fetchHttpRequest, 'put').mockResolvedValue(resolvedValue);
                await repositoryCache.get(HttpMethod.PUT, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultExpiringCacheTimeToAdvance);

                const response = await repositoryCache.get(HttpMethod.PUT, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestPut).toHaveBeenCalledTimes(2);
            });
            it("should don't be cache available when validity timestamp passed and do http request with DELETE method", async () => {
                const spyFetchHttpRequestDelete = jest.spyOn(fetchHttpRequest, 'delete').mockResolvedValue(resolvedValue);
                await repositoryCache.get(HttpMethod.DELETE, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultExpiringCacheTimeToAdvance);

                const response = await repositoryCache.get(HttpMethod.DELETE, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestDelete).toHaveBeenCalledTimes(2);
            });
        });

        describe('should not return the cached success response request and do http request during the cache validity timestamp when method change', () => {
            const resolvedValue = { property: { subProperty: defaultResponseData } };
            const httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions> = { url: listUrl };

            it('should not return the cached success response request and do http request during the cache validity timestamp when method change with GET method', async () => {
                const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue(resolvedValue);
                const spyFetchHttpRequestPost = jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue(resolvedValue);

                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id');
                await repositoryCache.get(HttpMethod.GET, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                const response = await repositoryCache.get(HttpMethod.POST, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(1);
                expect(spyFetchHttpRequestPost).toHaveBeenCalledTimes(1);
            });
            it('should not return the cached success response request and do http request during the cache validity timestamp when method change with POST method', async () => {
                const spyFetchHttpRequestPost = jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue(resolvedValue);
                const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue(resolvedValue);

                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id');
                await repositoryCache.get(HttpMethod.POST, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                const response = await repositoryCache.get(HttpMethod.GET, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestPost).toHaveBeenCalledTimes(1);
                expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(1);
            });
            it('should not return the cached success response request and do http request during the cache validity timestamp when method change with PATCH method', async () => {
                const spyFetchHttpRequestPatch = jest.spyOn(fetchHttpRequest, 'patch').mockResolvedValue(resolvedValue);
                const spyFetchHttpRequestPost = jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue(resolvedValue);

                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id');
                await repositoryCache.get(HttpMethod.PATCH, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                const response = await repositoryCache.get(HttpMethod.POST, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestPatch).toHaveBeenCalledTimes(1);
                expect(spyFetchHttpRequestPost).toHaveBeenCalledTimes(1);
            });
            it('should not return the cached success response request and do http request during the cache validity timestamp when method change with PUT method', async () => {
                const spyFetchHttpRequestPut = jest.spyOn(fetchHttpRequest, 'put').mockResolvedValue(resolvedValue);
                const spyFetchHttpRequestPatch = jest.spyOn(fetchHttpRequest, 'patch').mockResolvedValue(resolvedValue);

                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id');
                await repositoryCache.get(HttpMethod.PUT, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                const response = await repositoryCache.get(HttpMethod.PATCH, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestPut).toHaveBeenCalledTimes(1);
                expect(spyFetchHttpRequestPatch).toHaveBeenCalledTimes(1);
            });
            it('should not return the cached success response request and do http request during the cache validity timestamp when method change with DELETE method', async () => {
                const spyFetchHttpRequestDelete = jest.spyOn(fetchHttpRequest, 'delete').mockResolvedValue(resolvedValue);
                const spyFetchHttpRequestPut = jest.spyOn(fetchHttpRequest, 'put').mockResolvedValue(resolvedValue);

                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id');
                await repositoryCache.get(HttpMethod.DELETE, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                const response = await repositoryCache.get(HttpMethod.PUT, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestDelete).toHaveBeenCalledTimes(1);
                expect(spyFetchHttpRequestPut).toHaveBeenCalledTimes(1);
            });
        });

        describe('should not return the cached success response request and do http request during the cache validity timestamp when httpRequestParams contentTypeJSON property change according cached request', () => {
            const resolvedValue = { property: { subProperty: defaultResponseData } };
            const httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions> = { url: listUrl, contentTypeJSON: true };

            let repositoryCache: RepositoryCache<FetchRequestOptions>;
            beforeEach(() => {
                repositoryCache = new RepositoryCache(fetchHttpRequest, 'id');
            });

            it('should not return the cached success response request and do http request during the cache validity timestamp when httpRequestParams contentTypeJSON property change according cached request with GET method', async () => {
                const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue(resolvedValue);

                await repositoryCache.get(HttpMethod.GET, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                const response = await repositoryCache.get(HttpMethod.GET, { ...httpRequestParams, contentTypeJSON: false });

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(2);
            });
            it('should not return the cached success response request and do http request during the cache validity timestamp when httpRequestParams contentTypeJSON property change according cached request with POST method', async () => {
                const spyFetchHttpRequestPost = jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue(resolvedValue);

                await repositoryCache.get(HttpMethod.POST, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                const response = await repositoryCache.get(HttpMethod.POST, { ...httpRequestParams, contentTypeJSON: false });

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestPost).toHaveBeenCalledTimes(2);
            });
            it('should not return the cached success response request and do http request during the cache validity timestamp when httpRequestParams contentTypeJSON property change according cached request with PATCH method', async () => {
                const spyFetchHttpRequestPatch = jest.spyOn(fetchHttpRequest, 'patch').mockResolvedValue(resolvedValue);

                await repositoryCache.get(HttpMethod.PATCH, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                const response = await repositoryCache.get(HttpMethod.PATCH, { ...httpRequestParams, contentTypeJSON: false });

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestPatch).toHaveBeenCalledTimes(2);
            });
            it('should not return the cached success response request and do http request during the cache validity timestamp when httpRequestParams contentTypeJSON property change according cached request with PUT method', async () => {
                const spyFetchHttpRequestPut = jest.spyOn(fetchHttpRequest, 'put').mockResolvedValue(resolvedValue);

                await repositoryCache.get(HttpMethod.PUT, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                const response = await repositoryCache.get(HttpMethod.PUT, { ...httpRequestParams, contentTypeJSON: false });

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestPut).toHaveBeenCalledTimes(2);
            });
            it('should not return the cached success response request and do http request during the cache validity timestamp when httpRequestParams contentTypeJSON property change according cached request with DELETE method', async () => {
                const spyFetchHttpRequestDelete = jest.spyOn(fetchHttpRequest, 'delete').mockResolvedValue(resolvedValue);

                await repositoryCache.get(HttpMethod.DELETE, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                const response = await repositoryCache.get(HttpMethod.DELETE, { ...httpRequestParams, contentTypeJSON: false });

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestDelete).toHaveBeenCalledTimes(2);
            });
        });

        describe('should not return the cached success response request and do http request during the cache validity timestamp when auth token definition change according cached request', () => {
            const resolvedValue = { property: { subProperty: defaultResponseData } };
            const httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions> = { url: listUrl };
            const customHeaders = { Authorization: 'Bearer 51616516' }

            let repositoryCache: RepositoryCache<FetchRequestOptions>;
            beforeEach(() => {
                repositoryCache = new RepositoryCache(fetchHttpRequest, 'id');
            });

            it('should not return the cached success response request and do http request during the cache validity timestamp when auth token definition change according cached request with GET method', async () => {
                const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue(resolvedValue);

                await repositoryCache.get(HttpMethod.GET, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                //custom headers build
                jest.spyOn(fetchHttpRequest, 'buildRequestHeader').mockReturnValue(customHeaders);

                const response = await repositoryCache.get(HttpMethod.GET, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(2);
            });
            it('should not return the cached success response request and do http request during the cache validity timestamp when auth token definition change according cached request with POST method', async () => {
                const spyFetchHttpRequestPost = jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue(resolvedValue);

                await repositoryCache.get(HttpMethod.POST, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                //custom headers build
                jest.spyOn(fetchHttpRequest, 'buildRequestHeader').mockReturnValue(customHeaders);

                const response = await repositoryCache.get(HttpMethod.POST, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestPost).toHaveBeenCalledTimes(2);
            });
            it('should not return the cached success response request and do http request during the cache validity timestamp when auth token definition change according cached request with PATCH method', async () => {
                const spyFetchHttpRequestPatch = jest.spyOn(fetchHttpRequest, 'patch').mockResolvedValue(resolvedValue);

                await repositoryCache.get(HttpMethod.PATCH, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                //custom headers build
                jest.spyOn(fetchHttpRequest, 'buildRequestHeader').mockReturnValue(customHeaders);

                const response = await repositoryCache.get(HttpMethod.PATCH, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestPatch).toHaveBeenCalledTimes(2);
            });
            it('should not return the cached success response request and do http request during the cache validity timestamp when auth token definition change according cached request with PUT method', async () => {
                const spyFetchHttpRequestPut = jest.spyOn(fetchHttpRequest, 'put').mockResolvedValue(resolvedValue);

                await repositoryCache.get(HttpMethod.PUT, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                //custom headers build
                jest.spyOn(fetchHttpRequest, 'buildRequestHeader').mockReturnValue(customHeaders);

                const response = await repositoryCache.get(HttpMethod.PUT, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestPut).toHaveBeenCalledTimes(2);
            });
            it('should not return the cached success response request and do http request during the cache validity timestamp when auth token definition change according cached request with DELETE method', async () => {
                const spyFetchHttpRequestDelete = jest.spyOn(fetchHttpRequest, 'delete').mockResolvedValue(resolvedValue);

                await repositoryCache.get(HttpMethod.DELETE, httpRequestParams);

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                //custom headers build
                jest.spyOn(fetchHttpRequest, 'buildRequestHeader').mockReturnValue(customHeaders);

                const response = await repositoryCache.get(HttpMethod.DELETE, httpRequestParams);

                expect(response).toEqual(resolvedValue);
                expect(spyFetchHttpRequestDelete).toHaveBeenCalledTimes(2);
            });
        });

        describe('should not cache the failed response request', () => {
            const rejectedValue: HttpException = { type: DefaultHttpExceptionType.SERVER_UNAVAILABLE, body: { message: 'server not available' } };
            const httpRequestParams: HttpRequestParams<void, FetchRequestOptions> = { url: listUrl };

            let repositoryCache: RepositoryCache<FetchRequestOptions>;
            beforeEach(() => {
                repositoryCache = new RepositoryCache(fetchHttpRequest, 'id');
            });

            it('should not cache the failed response request with GET method', async () => {
                const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockRejectedValue(rejectedValue);

                try {
                    await repositoryCache.getList(HttpMethod.GET, httpRequestParams);
                }
                catch (exception) {
                    expect(exception).toEqual(rejectedValue);
                }

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                try {
                    await repositoryCache.get(HttpMethod.GET, httpRequestParams);
                }
                catch (exception) {
                    expect(exception).toEqual(rejectedValue);
                    expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(2);
                }

            });
            it('should not cache the failed response request with POST method', async () => {
                const spyFetchHttpRequestPost = jest.spyOn(fetchHttpRequest, 'post').mockRejectedValue(rejectedValue);

                try {
                    await repositoryCache.get(HttpMethod.POST, httpRequestParams);
                }
                catch (exception) {
                    expect(exception).toEqual(rejectedValue);
                }

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                try {
                    await repositoryCache.get(HttpMethod.POST, httpRequestParams);
                }
                catch (exception) {
                    expect(exception).toEqual(rejectedValue);
                    expect(spyFetchHttpRequestPost).toHaveBeenCalledTimes(2);
                }
            });
            it('should not cache the failed response request with PATCH method', async () => {
                const spyFetchHttpRequestPatch = jest.spyOn(fetchHttpRequest, 'patch').mockRejectedValue(rejectedValue);

                try {
                    await repositoryCache.get(HttpMethod.PATCH, httpRequestParams);
                }
                catch (exception) {
                    expect(exception).toEqual(rejectedValue);
                }

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                try {
                    await repositoryCache.get(HttpMethod.PATCH, httpRequestParams);
                }
                catch (exception) {
                    expect(exception).toEqual(rejectedValue);
                    expect(spyFetchHttpRequestPatch).toHaveBeenCalledTimes(2);
                }
            });
            it('should not cache the failed response request with PUT method', async () => {
                const spyFetchHttpRequestPut = jest.spyOn(fetchHttpRequest, 'put').mockRejectedValue(rejectedValue);

                try {
                    await repositoryCache.get(HttpMethod.PUT, httpRequestParams);
                }
                catch (exception) {
                    expect(exception).toEqual(rejectedValue);
                }

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                try {
                    await repositoryCache.get(HttpMethod.PUT, httpRequestParams);
                }
                catch (exception) {
                    expect(exception).toEqual(rejectedValue);
                    expect(spyFetchHttpRequestPut).toHaveBeenCalledTimes(2);
                }
            });
            it('should not cache the failed response request with DELETE method', async () => {
                const spyFetchHttpRequestDelete = jest.spyOn(fetchHttpRequest, 'delete').mockRejectedValue(rejectedValue);

                try {
                    await repositoryCache.get(HttpMethod.DELETE, httpRequestParams);
                }
                catch (exception) {
                    expect(exception).toEqual(rejectedValue);
                }

                //advance time to 30s
                jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                try {
                    await repositoryCache.get(HttpMethod.DELETE, httpRequestParams);
                }
                catch (exception) {
                    expect(exception).toEqual(rejectedValue);
                    expect(spyFetchHttpRequestDelete).toHaveBeenCalledTimes(2);
                }
            });
        });
    });

    describe("findByKey", () => {
        it("should return HttpException with type not found when item not found in cached requests responses", async () => {
            //responses
            const responseGetList = [{ key: defaultId, data: 'data1' }, { key: 2, data: 'data2' }];
            const responseGet = { key: defaultId, data: 'data1' };

            const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);

            //get list
            jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetList);
            await repositoryCache.getList(HttpMethod.GET, { url: listUrl });

            //get item
            jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGet);
            await repositoryCache.get(HttpMethod.GET, { url: getUrl });

            expect(repositoryCache.findByKey('partitionId', 1)).rejects.toEqual({ type: DefaultHttpExceptionType.NOT_FOUND });
        });

        describe("found in list cache type data", () => {
            const goodData = { key: defaultId, data: 'data5' }
            const responseGetListDataPageOne = [{ key: 1, data: 'data1' }, { key: 2, data: 'data2' }];
            const responseGetListDataPageTwo = [{ key: 3, data: 'data3' }, { key: 4, data: 'data4' }];
            const responseGetListDataPageThree = [goodData, { key: 6, data: 'data6' }];
            const responseGetDataOne = { key: 1, data: 'data1' };
            const responseGetDataThree = { key: 3, data: 'data3' };
            const responseGetDataSix = { key: 6, data: 'data6' };

            let repositoryCache: RepositoryCache<FetchRequestOptions>;
            beforeEach(() => {
                repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
            });

            afterEach(() => {
                jest.resetAllMocks();
            })

            it("should return item found in list cache type data", async () => {
                //get list page one
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetListDataPageOne);
                await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=1` });

                //get list page three
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetListDataPageThree);
                await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=3` });

                //get list page two
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetListDataPageTwo);
                await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=2` });

                //get item one
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetDataOne);
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/1` });

                //get item three
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetDataThree);
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/3` });

                //get item six
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetDataSix);
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/6` });

                expect(repositoryCache.findByKey('key', defaultId)).resolves.toEqual(goodData);
            });

            it("should return item found in list cache type data nested level 1 in sub properties", async () => {
                //get list page one
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageOne });
                await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=1` });

                //get list page three
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageThree });
                await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=3` });

                //get list page two
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageTwo });
                await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=2` });

                //get item one
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataOne });
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/1` });

                //get item three
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataThree });
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/3` });

                //get item six
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataSix });
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/6` });

                expect(repositoryCache.findByKey('key', defaultId, ['data'], ['item'])).resolves.toEqual(goodData);
            });

            it("should return item found in list cache type data nested level 5 in sub properties", async () => {
                //get list page one
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: { filtered: { response: { objects: { founds: responseGetListDataPageOne } } } } });
                await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=1` });

                //get list page three
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: { filtered: { response: { objects: { founds: responseGetListDataPageThree } } } } });
                await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=3` });

                //get list page two
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: { filtered: { response: { objects: { founds: responseGetListDataPageTwo } } } } });
                await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=2` });

                //get item one
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataOne });
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/1` });

                //get item three
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataThree });
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/3` });

                //get item six
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataSix });
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/6` });

                expect(repositoryCache.findByKey('key', defaultId, ['data', 'filtered', 'response', 'objects', 'founds'], ['item'])).resolves.toEqual(goodData);
            });
        });

        describe("found in occurrence cache type data", () => {
            const goodData = { key: defaultId, data: 'data5' }
            const responseGetListDataPageOne = [{ key: 1, data: 'data1' }, { key: 2, data: 'data2' }];
            const responseGetListDataPageTwo = [{ key: 3, data: 'data3' }, { key: 4, data: 'data4' }];
            const responseGetListDataPageFour = [{ key: 7, data: 'data7' }, { key: 8, data: 'data8' }];
            const responseGetDataOne = { key: 1, data: 'data1' };
            const responseGetDataFive = goodData;
            const responseGetDataSix = { key: 6, data: 'data6' };

            let repositoryCache: RepositoryCache<FetchRequestOptions>;
            beforeEach(() => {
                repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
            });

            afterEach(() => {
                jest.resetAllMocks();
            })

            it("should return item found in occurrence cache type data", async () => {
                //get list page one
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetListDataPageOne);
                await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=1` });

                //get list page two
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetListDataPageTwo);
                await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=2` });

                //get list page four
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetListDataPageFour);
                await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=4` });

                //get item one
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetDataOne);
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/1` });

                //get item five
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetDataFive);
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/5` });

                //get item six
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetDataSix);
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/6` });

                expect(repositoryCache.findByKey('key', defaultId)).resolves.toEqual(goodData);
            });

            it("should return item found in occurrence cache type data nested level 1 in sub properties", async () => {
                //get list page one
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageOne });
                await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=1` });

                //get list page two
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageTwo });
                await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=2` });

                //get list page four
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageFour });
                await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=4` });

                //get item one
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataOne });
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/1` });

                //get item five
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataFive });
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/5` });

                //get item six
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataSix });
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/6` });

                expect(repositoryCache.findByKey('key', defaultId, ['data'], ['item'])).resolves.toEqual(goodData);
            });

            it("should return item found in occurrence cache type data nested level 5 in sub properties", async () => {
                //get list page one
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageOne });
                await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=1` });

                //get list page two
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageTwo });
                await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=2` });

                //get list page four
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageFour });
                await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=4` });

                //get item one
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ response: { get: { data: { object: { item: responseGetDataOne } } } } });
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/1` });

                //get item five
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ response: { get: { data: { object: { item: responseGetDataFive } } } } });
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/5` });

                //get item six
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ response: { get: { data: { object: { item: responseGetDataSix } } } } });
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/6` });

                expect(repositoryCache.findByKey('key', defaultId, ['data'], ['response', 'get', 'data', 'object', 'item'])).resolves.toEqual(goodData);
            });
        });
    });

    describe("findByKeyOrRequestGetList", () => {
        const goodData = { key: defaultId, data: 'data5' }
        const getListHttpRequestParams = { url: getUrl }
        const getItemHttpRequestParams = { url: `${getUrl}/${goodData.key}` }
        describe("found in cache", () => {
            it("should not call http request when found in cache", async () => {
                const goodData = { key: defaultId, data: 'data5' }
                //responses
                const responseGetList = {
                    data: [
                        { key: 1, data: 'data1' },
                        { key: 2, data: 'data2' },
                        { key: 3, data: 'data3' },
                        { key: 4, data: 'data4' },
                    ]
                };

                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);

                //get list
                const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetList);
                await repositoryCache.getList(HttpMethod.GET, { url: listUrl });

                //get item
                spyFetchHttpRequestGet.mockResolvedValueOnce({ item: goodData });
                await repositoryCache.get(HttpMethod.GET, getItemHttpRequestParams);

                expect(repositoryCache.findByKeyOrRequestGetList(
                    'key',
                    goodData.key,
                    HttpMethod.GET,
                    getItemHttpRequestParams,
                    ['data'],
                    ['item']
                )).resolves.toEqual(goodData);

                expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(2);
            });

            describe("found in list cache type data", () => {
                const responseGetListDataPageOne = [{ key: 1, data: 'data1' }, { key: 2, data: 'data2' }];
                const responseGetListDataPageTwo = [{ key: 3, data: 'data3' }, { key: 4, data: 'data4' }];
                const responseGetListDataPageThree = [goodData, { key: 6, data: 'data6' }];
                const responseGetDataOne = { key: 1, data: 'data1' };
                const responseGetDataThree = { key: 3, data: 'data3' };
                const responseGetDataSix = { key: 6, data: 'data6' };

                let repositoryCache: RepositoryCache<FetchRequestOptions>;
                beforeEach(() => {
                    repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                });

                afterEach(() => {
                    jest.resetAllMocks();
                })

                it("should return item found in list cache type data", async () => {
                    //get list page one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetListDataPageOne);
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=1` });

                    //get list page three
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetListDataPageThree);
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=3` });

                    //get list page two
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetListDataPageTwo);
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=2` });

                    //get item one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetDataOne);
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/1` });

                    //get item three
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetDataThree);
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/3` });

                    //get item six
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetDataSix);
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/6` });

                    expect(repositoryCache.findByKeyOrRequestGetList(
                        'key',
                        goodData.key,
                        HttpMethod.GET,
                        getItemHttpRequestParams
                    )).resolves.toEqual(goodData);
                });

                it("should return item found in list cache type data nested level 1 in sub properties", async () => {
                    //get list page one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageOne });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=1` });

                    //get list page three
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageThree });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=3` });

                    //get list page two
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageTwo });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=2` });

                    //get item one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataOne });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/1` });

                    //get item three
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataThree });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/3` });

                    //get item six
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataSix });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/6` });

                    expect(repositoryCache.findByKeyOrRequestGetList(
                        'key',
                        goodData.key,
                        HttpMethod.GET,
                        getItemHttpRequestParams,
                        ['data'],
                        ['item']
                    )).resolves.toEqual(goodData);
                });

                it("should return item found in list cache type data nested level 5 in sub properties", async () => {
                    //get list page one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: { filtered: { response: { objects: { founds: responseGetListDataPageOne } } } } });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=1` });

                    //get list page three
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: { filtered: { response: { objects: { founds: responseGetListDataPageThree } } } } });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=3` });

                    //get list page two
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: { filtered: { response: { objects: { founds: responseGetListDataPageTwo } } } } });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=2` });

                    //get item one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataOne });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/1` });

                    //get item three
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataThree });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/3` });

                    //get item six
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataSix });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/6` });

                    expect(repositoryCache.findByKeyOrRequestGetList(
                        'key',
                        goodData.key,
                        HttpMethod.GET,
                        getItemHttpRequestParams,
                        ['data', 'filtered', 'response', 'objects', 'founds'],
                        ['item']
                    )).resolves.toEqual(goodData);
                });
            });

            describe("found in occurrence cache type data", () => {
                const goodData = { key: defaultId, data: 'data5' }
                const responseGetListDataPageOne = [{ key: 1, data: 'data1' }, { key: 2, data: 'data2' }];
                const responseGetListDataPageTwo = [{ key: 3, data: 'data3' }, { key: 4, data: 'data4' }];
                const responseGetListDataPageFour = [{ key: 7, data: 'data7' }, { key: 8, data: 'data8' }];
                const responseGetDataOne = { key: 1, data: 'data1' };
                const responseGetDataFive = goodData;
                const responseGetDataSix = { key: 6, data: 'data6' };

                let repositoryCache: RepositoryCache<FetchRequestOptions>;
                beforeEach(() => {
                    repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                });

                afterEach(() => {
                    jest.resetAllMocks();
                })

                it("should return item found in occurrence cache type data", async () => {
                    //get list page one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetListDataPageOne);
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=1` });

                    //get list page two
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetListDataPageTwo);
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=2` });

                    //get list page four
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetListDataPageFour);
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=4` });

                    //get item one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetDataOne);
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/1` });

                    //get item five
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetDataFive);
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/5` });

                    //get item six
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetDataSix);
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/6` });

                    expect(repositoryCache.findByKeyOrRequestGetList(
                        'key',
                        goodData.key,
                        HttpMethod.GET,
                        getItemHttpRequestParams
                    )).resolves.toEqual(goodData);
                });

                it("should return item found in occurrence cache type data nested level 1 in sub properties", async () => {
                    //get list page one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageOne });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=1` });

                    //get list page two
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageTwo });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=2` });

                    //get list page four
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageFour });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=4` });

                    //get item one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataOne });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/1` });

                    //get item five
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataFive });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/5` });

                    //get item six
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataSix });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/6` });

                    expect(repositoryCache.findByKeyOrRequestGetList(
                        'key',
                        goodData.key,
                        HttpMethod.GET,
                        getItemHttpRequestParams,
                        ['data'],
                        ['item']
                    )).resolves.toEqual(goodData);
                });

                it("should return item found in occurrence cache type data nested level 5 in sub properties", async () => {
                    //get list page one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageOne });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=1` });

                    //get list page two
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageTwo });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=2` });

                    //get list page four
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageFour });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=4` });

                    //get item one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ response: { get: { data: { object: { item: responseGetDataOne } } } } });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/1` });

                    //get item five
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ response: { get: { data: { object: { item: responseGetDataFive } } } } });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/5` });

                    //get item six
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ response: { get: { data: { object: { item: responseGetDataSix } } } } });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/6` });

                    expect(repositoryCache.findByKeyOrRequestGetList(
                        'key',
                        goodData.key,
                        HttpMethod.GET,
                        getItemHttpRequestParams,
                        ['data'],
                        ['response', 'get', 'data', 'object', 'item']
                    )).resolves.toEqual(goodData);
                });
            });
        });

        describe("not found in cache", () => {
            it("should call http request when not found in cache", async () => {
                const goodData = { key: defaultId, data: 'data5' }
                //responses
                const responseGetList = {
                    data: [
                        { key: 1, data: 'data1' },
                        { key: 2, data: 'data2' },
                        { key: 3, data: 'data3' },
                        { key: 4, data: 'data4' },
                        goodData
                    ]
                };

                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id');

                //get list
                const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetList);
                await repositoryCache.getList(HttpMethod.GET, getListHttpRequestParams);

                jest.advanceTimersByTime(defaultExpiringCacheTimeToAdvance);

                //get item
                spyFetchHttpRequestGet.mockResolvedValueOnce({ item: responseGetList.data[1] });
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/${responseGetList.data[1]!.key}` });

                //get Good item
                spyFetchHttpRequestGet.mockResolvedValueOnce({ item: goodData });
                await repositoryCache.get(HttpMethod.GET, getItemHttpRequestParams);

                expect(repositoryCache.findByKeyOrRequestGetList(
                    'key',
                    goodData.key,
                    HttpMethod.GET,
                    getListHttpRequestParams,
                    ['data'],
                    ['item']
                )).resolves.toEqual(goodData);

                expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(3);
            });

            describe('should do http request with good method and HttpRequestParams', () => {
                let spyFetchHttpRequestGet: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<never, FetchRequestOptions>], any>;
                let spyFetchHttpRequestPost: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions>], any>;
                let spyFetchHttpRequestPatch: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions>], any>;
                let spyFetchHttpRequestPut: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions>], any>;
                let spyFetchHttpRequestDelete: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<never, FetchRequestOptions>], any>;

                beforeEach(() => {
                    spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue({ property: { subProperty: [goodData] } });
                    spyFetchHttpRequestPost = jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue({ property: { subProperty: [goodData] } });
                    spyFetchHttpRequestPatch = jest.spyOn(fetchHttpRequest, 'patch').mockResolvedValue({ property: { subProperty: [goodData] } });
                    spyFetchHttpRequestPut = jest.spyOn(fetchHttpRequest, 'put').mockResolvedValue({ property: { subProperty: [goodData] } });
                    spyFetchHttpRequestDelete = jest.spyOn(fetchHttpRequest, 'delete').mockResolvedValue({ property: { subProperty: [goodData] } });
                });

                afterEach(() => {
                    jest.resetAllMocks();
                });
                describe("should do http request with good methods", () => {
                    it('should do http request with GET method', async () => {
                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findByKeyOrRequestGetList(
                            'key',
                            goodData.key,
                            HttpMethod.GET,
                            getListHttpRequestParams,
                            ['property', 'subProperty']
                        );

                        expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(1);
                        expect(spyFetchHttpRequestPost).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPatch).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPut).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestDelete).not.toHaveBeenCalled();
                    });
                    it('should do http request with POST method', async () => {
                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findByKeyOrRequestGetList(
                            'key',
                            goodData.key,
                            HttpMethod.POST,
                            getListHttpRequestParams,
                            ['property', 'subProperty']
                        );

                        expect(spyFetchHttpRequestPost).toHaveBeenCalledTimes(1);
                        expect(spyFetchHttpRequestGet).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPatch).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPut).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestDelete).not.toHaveBeenCalled();
                    });
                    it('should do http request with PATCH method', async () => {
                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findByKeyOrRequestGetList(
                            'key',
                            goodData.key,
                            HttpMethod.PATCH,
                            getListHttpRequestParams,
                            ['property', 'subProperty']
                        );

                        expect(spyFetchHttpRequestPatch).toHaveBeenCalledTimes(1);
                        expect(spyFetchHttpRequestGet).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPost).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPut).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestDelete).not.toHaveBeenCalled();
                    });
                    it('should do http request with PUT method', async () => {
                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findByKeyOrRequestGetList(
                            'key',
                            goodData.key,
                            HttpMethod.PUT,
                            getListHttpRequestParams,
                            ['property', 'subProperty']
                        );

                        expect(spyFetchHttpRequestPut).toHaveBeenCalledTimes(1);
                        expect(spyFetchHttpRequestGet).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPost).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPatch).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestDelete).not.toHaveBeenCalled();
                    });
                    it('should do http request with DELETE method', async () => {
                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findByKeyOrRequestGetList(
                            'key',
                            goodData.key,
                            HttpMethod.DELETE,
                            getListHttpRequestParams,
                            ['property', 'subProperty']
                        );

                        expect(spyFetchHttpRequestDelete).toHaveBeenCalledTimes(1);
                        expect(spyFetchHttpRequestGet).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPost).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPatch).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPut).not.toHaveBeenCalled();
                    });
                });
                describe("should do http request with good HttpRequestParams", () => {
                    const httpRequestParams: HttpRequestParams<never, FetchRequestOptions> = {
                        url: listUrl,
                        headers: { accept: '*/*', "user-agent": 'Jest' },
                        contentTypeJSON: true,
                        successStatusCodes: [206, 207, 208]
                    };
                    it("should do GET http request with good HttpRequestParams", async () => {
                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findByKeyOrRequestGetList(
                            'key',
                            goodData.key,
                            HttpMethod.GET,
                            httpRequestParams,
                            ['property', 'subProperty']
                        );

                        expect(fetchHttpRequest.get).toHaveBeenCalledWith(httpRequestParams);
                    });
                    it("should do POST http request with good HttpRequestParams", async () => {
                        const body = { id: 5, data: 'data' };
                        const customHttpRequestParams = { ...httpRequestParams, body };

                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findByKeyOrRequestGetList(
                            'key',
                            goodData.key,
                            HttpMethod.POST,
                            customHttpRequestParams,
                            ['property', 'subProperty']
                        );

                        expect(fetchHttpRequest.post).toHaveBeenCalledWith(customHttpRequestParams);
                    });
                    it("should do PATCH http request with good HttpRequestParams", async () => {
                        const body = { id: 5, data: 'data' };
                        const customHttpRequestParams = { ...httpRequestParams, body };

                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findByKeyOrRequestGetList(
                            'key',
                            goodData.key,
                            HttpMethod.PATCH,
                            customHttpRequestParams,
                            ['property', 'subProperty']
                        );

                        expect(fetchHttpRequest.patch).toHaveBeenCalledWith(customHttpRequestParams);
                    });
                    it("should do PUT http request with good HttpRequestParams", async () => {
                        const body = { id: 5, data: 'data' };
                        const customHttpRequestParams = { ...httpRequestParams, body };

                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findByKeyOrRequestGetList(
                            'key',
                            goodData.key,
                            HttpMethod.PUT,
                            customHttpRequestParams,
                            ['property', 'subProperty']
                        );

                        expect(fetchHttpRequest.put).toHaveBeenCalledWith(customHttpRequestParams);
                    });
                    it("should do DELETE http request with good HttpRequestParams", async () => {
                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findByKeyOrRequestGetList(
                            'key',
                            goodData.key,
                            HttpMethod.DELETE,
                            httpRequestParams,
                            ['property', 'subProperty']
                        );

                        expect(fetchHttpRequest.delete).toHaveBeenCalledWith(httpRequestParams);
                    });
                });
            });

            describe('should return the data looking for', () => {
                const resolvedValue = { property: { subProperty: [goodData] } };

                it('should return the data looking for', async () => {
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue(resolvedValue);
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    expect(repositoryCache.findByKeyOrRequestGetList(
                        'key',
                        goodData.key,
                        HttpMethod.GET,
                        getListHttpRequestParams,
                        ['property', 'subProperty']
                    )).resolves.toEqual(goodData);
                });

                it('should return the data looking for', async () => {
                    jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue(resolvedValue);
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    expect(repositoryCache.findByKeyOrRequestGetList(
                        'key',
                        goodData.key,
                        HttpMethod.POST,
                        getListHttpRequestParams,
                        ['property', 'subProperty']
                    )).resolves.toEqual(goodData);
                });

                it('should return the data looking for', async () => {
                    jest.spyOn(fetchHttpRequest, 'patch').mockResolvedValue(resolvedValue);
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    expect(repositoryCache.findByKeyOrRequestGetList(
                        'key',
                        goodData.key,
                        HttpMethod.PATCH,
                        getListHttpRequestParams,
                        ['property', 'subProperty']
                    )).resolves.toEqual(goodData);
                });

                it('should return the data looking for', async () => {
                    jest.spyOn(fetchHttpRequest, 'put').mockResolvedValue(resolvedValue);
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    expect(repositoryCache.findByKeyOrRequestGetList(
                        'key',
                        goodData.key,
                        HttpMethod.PUT,
                        getListHttpRequestParams,
                        ['property', 'subProperty']
                    )).resolves.toEqual(goodData);
                });

                it('should return the data looking for', async () => {
                    jest.spyOn(fetchHttpRequest, 'delete').mockResolvedValue(resolvedValue);
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    expect(repositoryCache.findByKeyOrRequestGetList(
                        'key',
                        goodData.key,
                        HttpMethod.DELETE,
                        getListHttpRequestParams,
                        ['property', 'subProperty']
                    )).resolves.toEqual(goodData);
                });
            });

            describe('should throw failed response request', () => {
                const rejectedValue: HttpException = { type: DefaultHttpExceptionType.SERVER_UNAVAILABLE, body: { message: 'server not available' } };

                let repositoryCache: RepositoryCache<FetchRequestOptions>;
                beforeEach(() => {
                    repositoryCache = new RepositoryCache(fetchHttpRequest, 'id');
                });

                it('should throw failed response request with GET method', async () => {
                    const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockRejectedValue(rejectedValue);

                    try {
                        await repositoryCache.findByKeyOrRequestGetList(
                            'key',
                            goodData.key,
                            HttpMethod.GET,
                            getListHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                    }

                    //advance time to 30s
                    jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                    try {
                        await repositoryCache.findByKeyOrRequestGetList(
                            'key',
                            goodData.key,
                            HttpMethod.GET,
                            getListHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                        expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(2);
                    }

                });
                it('should throw failed response request with POST method', async () => {
                    const spyFetchHttpRequestPost = jest.spyOn(fetchHttpRequest, 'post').mockRejectedValue(rejectedValue);

                    try {
                        await repositoryCache.findByKeyOrRequestGetList(
                            'key',
                            goodData.key,
                            HttpMethod.POST,
                            getListHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                    }

                    //advance time to 30s
                    jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                    try {
                        await repositoryCache.findByKeyOrRequestGetList(
                            'key',
                            goodData.key,
                            HttpMethod.POST,
                            getListHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                        expect(spyFetchHttpRequestPost).toHaveBeenCalledTimes(2);
                    }
                });
                it('should throw failed response request with PATCH method', async () => {
                    const spyFetchHttpRequestPatch = jest.spyOn(fetchHttpRequest, 'patch').mockRejectedValue(rejectedValue);

                    try {
                        await repositoryCache.findByKeyOrRequestGetList(
                            'key',
                            goodData.key,
                            HttpMethod.PATCH,
                            getListHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                    }

                    //advance time to 30s
                    jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                    try {
                        await repositoryCache.findByKeyOrRequestGetList(
                            'key',
                            goodData.key,
                            HttpMethod.PATCH,
                            getListHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                        expect(spyFetchHttpRequestPatch).toHaveBeenCalledTimes(2);
                    }
                });
                it('should throw failed response request with PUT method', async () => {
                    const spyFetchHttpRequestPut = jest.spyOn(fetchHttpRequest, 'put').mockRejectedValue(rejectedValue);

                    try {
                        await repositoryCache.findByKeyOrRequestGetList(
                            'key',
                            goodData.key,
                            HttpMethod.PUT,
                            getListHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                    }

                    //advance time to 30s
                    jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                    try {
                        await repositoryCache.findByKeyOrRequestGetList(
                            'key',
                            goodData.key,
                            HttpMethod.PUT,
                            getListHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                        expect(spyFetchHttpRequestPut).toHaveBeenCalledTimes(2);
                    }
                });
                it('should throw failed response request with DELETE method', async () => {
                    const spyFetchHttpRequestDelete = jest.spyOn(fetchHttpRequest, 'delete').mockRejectedValue(rejectedValue);

                    try {
                        await repositoryCache.findByKeyOrRequestGetList(
                            'key',
                            goodData.key,
                            HttpMethod.DELETE,
                            getListHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                    }

                    //advance time to 30s
                    jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                    try {
                        await repositoryCache.findByKeyOrRequestGetList(
                            'key',
                            goodData.key,
                            HttpMethod.DELETE,
                            getListHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                        expect(spyFetchHttpRequestDelete).toHaveBeenCalledTimes(2);
                    }
                });
            });
        });
    });

    describe("findByKeyOrRequestGet", () => {
        const goodData = { key: defaultId, data: 'data5' }
        const getListHttpRequestParams = { url: getUrl }
        const getItemHttpRequestParams = { url: `${getUrl}/${goodData.key}` }

        describe("found in cache", () => {
            it("should not call http request when found in cache", async () => {
                const goodData = { key: defaultId, data: 'data5' }
                //responses
                const responseGetList = {
                    data: [
                        { key: 1, data: 'data1' },
                        { key: 2, data: 'data2' },
                        { key: 3, data: 'data3' },
                        { key: 4, data: 'data4' },
                    ]
                };

                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);

                //get list
                const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetList);
                await repositoryCache.getList(HttpMethod.GET, { url: listUrl });

                //get item
                spyFetchHttpRequestGet.mockResolvedValueOnce({ item: goodData });
                await repositoryCache.get(HttpMethod.GET, getItemHttpRequestParams);

                expect(repositoryCache.findByKeyOrRequestGet(
                    'key',
                    goodData.key,
                    HttpMethod.GET,
                    getItemHttpRequestParams,
                    ['data'],
                    ['item']
                )).resolves.toEqual(goodData);

                expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(2);
            });

            describe("found in list cache type data", () => {
                const responseGetListDataPageOne = [{ key: 1, data: 'data1' }, { key: 2, data: 'data2' }];
                const responseGetListDataPageTwo = [{ key: 3, data: 'data3' }, { key: 4, data: 'data4' }];
                const responseGetListDataPageThree = [goodData, { key: 6, data: 'data6' }];
                const responseGetDataOne = { key: 1, data: 'data1' };
                const responseGetDataThree = { key: 3, data: 'data3' };
                const responseGetDataSix = { key: 6, data: 'data6' };

                let repositoryCache: RepositoryCache<FetchRequestOptions>;
                beforeEach(() => {
                    repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                });

                afterEach(() => {
                    jest.resetAllMocks();
                })

                it("should return item found in list cache type data", async () => {
                    //get list page one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetListDataPageOne);
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=1` });

                    //get list page three
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetListDataPageThree);
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=3` });

                    //get list page two
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetListDataPageTwo);
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=2` });

                    //get item one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetDataOne);
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/1` });

                    //get item three
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetDataThree);
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/3` });

                    //get item six
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetDataSix);
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/6` });

                    expect(repositoryCache.findByKeyOrRequestGet(
                        'key',
                        goodData.key,
                        HttpMethod.GET,
                        getItemHttpRequestParams
                    )).resolves.toEqual(goodData);
                });

                it("should return item found in list cache type data nested level 1 in sub properties", async () => {
                    //get list page one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageOne });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=1` });

                    //get list page three
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageThree });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=3` });

                    //get list page two
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageTwo });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=2` });

                    //get item one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataOne });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/1` });

                    //get item three
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataThree });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/3` });

                    //get item six
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataSix });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/6` });

                    expect(repositoryCache.findByKeyOrRequestGet(
                        'key',
                        goodData.key,
                        HttpMethod.GET,
                        getItemHttpRequestParams,
                        ['data'],
                        ['item']
                    )).resolves.toEqual(goodData);
                });

                it("should return item found in list cache type data nested level 5 in sub properties", async () => {
                    //get list page one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: { filtered: { response: { objects: { founds: responseGetListDataPageOne } } } } });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=1` });

                    //get list page three
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: { filtered: { response: { objects: { founds: responseGetListDataPageThree } } } } });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=3` });

                    //get list page two
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: { filtered: { response: { objects: { founds: responseGetListDataPageTwo } } } } });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=2` });

                    //get item one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataOne });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/1` });

                    //get item three
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataThree });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/3` });

                    //get item six
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataSix });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/6` });

                    expect(repositoryCache.findByKeyOrRequestGet(
                        'key',
                        goodData.key,
                        HttpMethod.GET,
                        getItemHttpRequestParams,
                        ['data', 'filtered', 'response', 'objects', 'founds'],
                        ['item']
                    )).resolves.toEqual(goodData);
                });
            });

            describe("found in occurrence cache type data", () => {
                const goodData = { key: defaultId, data: 'data5' }
                const responseGetListDataPageOne = [{ key: 1, data: 'data1' }, { key: 2, data: 'data2' }];
                const responseGetListDataPageTwo = [{ key: 3, data: 'data3' }, { key: 4, data: 'data4' }];
                const responseGetListDataPageFour = [{ key: 7, data: 'data7' }, { key: 8, data: 'data8' }];
                const responseGetDataOne = { key: 1, data: 'data1' };
                const responseGetDataFive = goodData;
                const responseGetDataSix = { key: 6, data: 'data6' };

                let repositoryCache: RepositoryCache<FetchRequestOptions>;
                beforeEach(() => {
                    repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                });

                afterEach(() => {
                    jest.resetAllMocks();
                })

                it("should return item found in occurrence cache type data", async () => {
                    //get list page one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetListDataPageOne);
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=1` });

                    //get list page two
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetListDataPageTwo);
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=2` });

                    //get list page four
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetListDataPageFour);
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=4` });

                    //get item one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetDataOne);
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/1` });

                    //get item five
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetDataFive);
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/5` });

                    //get item six
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetDataSix);
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/6` });

                    expect(repositoryCache.findByKeyOrRequestGet(
                        'key',
                        goodData.key,
                        HttpMethod.GET,
                        getItemHttpRequestParams
                    )).resolves.toEqual(goodData);
                });

                it("should return item found in occurrence cache type data nested level 1 in sub properties", async () => {
                    //get list page one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageOne });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=1` });

                    //get list page two
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageTwo });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=2` });

                    //get list page four
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageFour });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=4` });

                    //get item one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataOne });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/1` });

                    //get item five
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataFive });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/5` });

                    //get item six
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataSix });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/6` });

                    expect(repositoryCache.findByKeyOrRequestGet(
                        'key',
                        goodData.key,
                        HttpMethod.GET,
                        getItemHttpRequestParams,
                        ['data'],
                        ['item']
                    )).resolves.toEqual(goodData);
                });

                it("should return item found in occurrence cache type data nested level 5 in sub properties", async () => {
                    //get list page one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageOne });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=1` });

                    //get list page two
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageTwo });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=2` });

                    //get list page four
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageFour });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=4` });

                    //get item one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ response: { get: { data: { object: { item: responseGetDataOne } } } } });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/1` });

                    //get item five
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ response: { get: { data: { object: { item: responseGetDataFive } } } } });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/5` });

                    //get item six
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ response: { get: { data: { object: { item: responseGetDataSix } } } } });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/6` });

                    expect(repositoryCache.findByKeyOrRequestGet(
                        'key',
                        goodData.key,
                        HttpMethod.GET,
                        getItemHttpRequestParams,
                        ['data'],
                        ['response', 'get', 'data', 'object', 'item']
                    )).resolves.toEqual(goodData);
                });
            });
        });

        describe("not found in cache", () => {
            it("should call http request when not found in cache", async () => {
                const goodData = { key: defaultId, data: 'data5' }
                //responses
                const responseGetList = {
                    data: [
                        { key: 1, data: 'data1' },
                        { key: 2, data: 'data2' },
                        { key: 3, data: 'data3' },
                        { key: 4, data: 'data4' },
                        goodData
                    ]
                };

                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id');

                //get list
                const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetList);
                await repositoryCache.getList(HttpMethod.GET, getListHttpRequestParams);

                jest.advanceTimersByTime(defaultExpiringCacheTimeToAdvance);

                //get item
                spyFetchHttpRequestGet.mockResolvedValueOnce({ item: responseGetList.data[1] });
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/${responseGetList.data[1]!.key}` });

                //get Good item
                spyFetchHttpRequestGet.mockResolvedValueOnce({ item: goodData });
                await repositoryCache.get(HttpMethod.GET, getItemHttpRequestParams);

                expect(repositoryCache.findByKeyOrRequestGet(
                    'key',
                    goodData.key,
                    HttpMethod.GET,
                    getItemHttpRequestParams,
                    ['data'],
                    ['item']
                )).resolves.toEqual(goodData);

                expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(3);
            });

            describe('should do http request with good method and HttpRequestParams', () => {
                let spyFetchHttpRequestGet: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<never, FetchRequestOptions>], any>;
                let spyFetchHttpRequestPost: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions>], any>;
                let spyFetchHttpRequestPatch: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions>], any>;
                let spyFetchHttpRequestPut: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions>], any>;
                let spyFetchHttpRequestDelete: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<never, FetchRequestOptions>], any>;

                beforeEach(() => {
                    spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue({ property: { subProperty: goodData } });
                    spyFetchHttpRequestPost = jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue({ property: { subProperty: goodData } });
                    spyFetchHttpRequestPatch = jest.spyOn(fetchHttpRequest, 'patch').mockResolvedValue({ property: { subProperty: goodData } });
                    spyFetchHttpRequestPut = jest.spyOn(fetchHttpRequest, 'put').mockResolvedValue({ property: { subProperty: goodData } });
                    spyFetchHttpRequestDelete = jest.spyOn(fetchHttpRequest, 'delete').mockResolvedValue({ property: { subProperty: goodData } });
                });

                afterEach(() => {
                    jest.resetAllMocks();
                });
                describe("should do http request with good methods", () => {
                    it('should do http request with GET method', async () => {
                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findByKeyOrRequestGet(
                            'key',
                            goodData.key,
                            HttpMethod.GET,
                            getItemHttpRequestParams,
                            [],
                            ['property', 'subProperty']
                        );

                        expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(1);
                        expect(spyFetchHttpRequestPost).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPatch).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPut).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestDelete).not.toHaveBeenCalled();
                    });
                    it('should do http request with POST method', async () => {
                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findByKeyOrRequestGet(
                            'key',
                            goodData.key,
                            HttpMethod.POST,
                            getItemHttpRequestParams,
                            [],
                            ['property', 'subProperty']
                        );

                        expect(spyFetchHttpRequestPost).toHaveBeenCalledTimes(1);
                        expect(spyFetchHttpRequestGet).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPatch).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPut).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestDelete).not.toHaveBeenCalled();
                    });
                    it('should do http request with PATCH method', async () => {
                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findByKeyOrRequestGet(
                            'key',
                            goodData.key,
                            HttpMethod.PATCH,
                            getItemHttpRequestParams,
                            [],
                            ['property', 'subProperty']
                        );

                        expect(spyFetchHttpRequestPatch).toHaveBeenCalledTimes(1);
                        expect(spyFetchHttpRequestGet).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPost).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPut).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestDelete).not.toHaveBeenCalled();
                    });
                    it('should do http request with PUT method', async () => {
                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findByKeyOrRequestGet(
                            'key',
                            goodData.key,
                            HttpMethod.PUT,
                            getItemHttpRequestParams,
                            [],
                            ['property', 'subProperty']
                        );

                        expect(spyFetchHttpRequestPut).toHaveBeenCalledTimes(1);
                        expect(spyFetchHttpRequestGet).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPost).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPatch).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestDelete).not.toHaveBeenCalled();
                    });
                    it('should do http request with DELETE method', async () => {
                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findByKeyOrRequestGet(
                            'key',
                            goodData.key,
                            HttpMethod.DELETE,
                            getItemHttpRequestParams,
                            [],
                            ['property', 'subProperty']
                        );

                        expect(spyFetchHttpRequestDelete).toHaveBeenCalledTimes(1);
                        expect(spyFetchHttpRequestGet).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPost).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPatch).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPut).not.toHaveBeenCalled();
                    });
                });
                describe("should do http request with good HttpRequestParams", () => {
                    const httpRequestParams: HttpRequestParams<never, FetchRequestOptions> = {
                        url: `${getUrl}/${goodData.key}`,
                        headers: { accept: '*/*', "user-agent": 'Jest' },
                        contentTypeJSON: true,
                        successStatusCodes: [206, 207, 208]
                    };
                    it("should do GET http request with good HttpRequestParams", async () => {
                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findByKeyOrRequestGet(
                            'key',
                            goodData.key,
                            HttpMethod.GET,
                            httpRequestParams,
                            [],
                            ['property', 'subProperty']
                        );

                        expect(fetchHttpRequest.get).toHaveBeenCalledWith(httpRequestParams);
                    });
                    it("should do POST http request with good HttpRequestParams", async () => {
                        const body = { id: 5, data: 'data' };
                        const customHttpRequestParams = { ...httpRequestParams, body };

                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findByKeyOrRequestGet(
                            'key',
                            goodData.key,
                            HttpMethod.POST,
                            customHttpRequestParams,
                            [],
                            ['property', 'subProperty']
                        );

                        expect(fetchHttpRequest.post).toHaveBeenCalledWith(customHttpRequestParams);
                    });
                    it("should do PATCH http request with good HttpRequestParams", async () => {
                        const body = { id: 5, data: 'data' };
                        const customHttpRequestParams = { ...httpRequestParams, body };

                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findByKeyOrRequestGet(
                            'key',
                            goodData.key,
                            HttpMethod.PATCH,
                            customHttpRequestParams,
                            [],
                            ['property', 'subProperty']
                        );

                        expect(fetchHttpRequest.patch).toHaveBeenCalledWith(customHttpRequestParams);
                    });
                    it("should do PUT http request with good HttpRequestParams", async () => {
                        const body = { id: 5, data: 'data' };
                        const customHttpRequestParams = { ...httpRequestParams, body };

                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findByKeyOrRequestGet(
                            'key',
                            goodData.key,
                            HttpMethod.PUT,
                            customHttpRequestParams,
                            [],
                            ['property', 'subProperty']
                        );

                        expect(fetchHttpRequest.put).toHaveBeenCalledWith(customHttpRequestParams);
                    });
                    it("should do DELETE http request with good HttpRequestParams", async () => {
                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findByKeyOrRequestGet(
                            'key',
                            goodData.key,
                            HttpMethod.DELETE,
                            httpRequestParams,
                            [],
                            ['property', 'subProperty']
                        );

                        expect(fetchHttpRequest.delete).toHaveBeenCalledWith(httpRequestParams);
                    });
                });
            });

            describe('should return the data looking for', () => {
                const resolvedValue = { property: { subProperty: goodData } };

                it('should return the data looking for with GET request', async () => {
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue(resolvedValue);
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    expect(repositoryCache.findByKeyOrRequestGet(
                        'key',
                        goodData.key,
                        HttpMethod.GET,
                        getItemHttpRequestParams,
                        [],
                        ['property', 'subProperty']
                    )).resolves.toEqual(goodData);
                });

                it('should return the data looking for with POST request', async () => {
                    jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue(resolvedValue);
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    expect(repositoryCache.findByKeyOrRequestGet(
                        'key',
                        goodData.key,
                        HttpMethod.POST,
                        getItemHttpRequestParams,
                        [],
                        ['property', 'subProperty']
                    )).resolves.toEqual(goodData);
                });

                it('should return the data looking for with PATCH request', async () => {
                    jest.spyOn(fetchHttpRequest, 'patch').mockResolvedValue(resolvedValue);
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    expect(repositoryCache.findByKeyOrRequestGet(
                        'key',
                        goodData.key,
                        HttpMethod.PATCH,
                        getItemHttpRequestParams,
                        [],
                        ['property', 'subProperty']
                    )).resolves.toEqual(goodData);
                });

                it('should return the data looking for with PUT request', async () => {
                    jest.spyOn(fetchHttpRequest, 'put').mockResolvedValue(resolvedValue);
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    expect(repositoryCache.findByKeyOrRequestGet(
                        'key',
                        goodData.key,
                        HttpMethod.PUT,
                        getItemHttpRequestParams,
                        [],
                        ['property', 'subProperty']
                    )).resolves.toEqual(goodData);
                });

                it('should return the data looking for with DELETE request', async () => {
                    jest.spyOn(fetchHttpRequest, 'delete').mockResolvedValue(resolvedValue);
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    expect(repositoryCache.findByKeyOrRequestGet(
                        'key',
                        goodData.key,
                        HttpMethod.DELETE,
                        getItemHttpRequestParams,
                        [],
                        ['property', 'subProperty']
                    )).resolves.toEqual(goodData);
                });
            });

            describe('should throw failed response request', () => {
                const rejectedValue: HttpException = { type: DefaultHttpExceptionType.SERVER_UNAVAILABLE, body: { message: 'server not available' } };

                let repositoryCache: RepositoryCache<FetchRequestOptions>;
                beforeEach(() => {
                    repositoryCache = new RepositoryCache(fetchHttpRequest, 'id');
                });

                it('should throw failed response request with GET method', async () => {
                    const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockRejectedValue(rejectedValue);

                    try {
                        await repositoryCache.findByKeyOrRequestGet(
                            'key',
                            goodData.key,
                            HttpMethod.GET,
                            getItemHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                    }

                    //advance time to 30s
                    jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                    try {
                        await repositoryCache.findByKeyOrRequestGet(
                            'key',
                            goodData.key,
                            HttpMethod.GET,
                            getItemHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                        expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(2);
                    }

                });
                it('should throw failed response request with POST method', async () => {
                    const spyFetchHttpRequestPost = jest.spyOn(fetchHttpRequest, 'post').mockRejectedValue(rejectedValue);

                    try {
                        await repositoryCache.findByKeyOrRequestGet(
                            'key',
                            goodData.key,
                            HttpMethod.POST,
                            getItemHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                    }

                    //advance time to 30s
                    jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                    try {
                        await repositoryCache.findByKeyOrRequestGet(
                            'key',
                            goodData.key,
                            HttpMethod.POST,
                            getItemHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                        expect(spyFetchHttpRequestPost).toHaveBeenCalledTimes(2);
                    }
                });
                it('should throw failed response request with PATCH method', async () => {
                    const spyFetchHttpRequestPatch = jest.spyOn(fetchHttpRequest, 'patch').mockRejectedValue(rejectedValue);

                    try {
                        await repositoryCache.findByKeyOrRequestGet(
                            'key',
                            goodData.key,
                            HttpMethod.PATCH,
                            getItemHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                    }

                    //advance time to 30s
                    jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                    try {
                        await repositoryCache.findByKeyOrRequestGet(
                            'key',
                            goodData.key,
                            HttpMethod.PATCH,
                            getItemHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                        expect(spyFetchHttpRequestPatch).toHaveBeenCalledTimes(2);
                    }
                });
                it('should throw failed response request with PUT method', async () => {
                    const spyFetchHttpRequestPut = jest.spyOn(fetchHttpRequest, 'put').mockRejectedValue(rejectedValue);

                    try {
                        await repositoryCache.findByKeyOrRequestGet(
                            'key',
                            goodData.key,
                            HttpMethod.PUT,
                            getItemHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                    }

                    //advance time to 30s
                    jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                    try {
                        await repositoryCache.findByKeyOrRequestGet(
                            'key',
                            goodData.key,
                            HttpMethod.PUT,
                            getItemHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                        expect(spyFetchHttpRequestPut).toHaveBeenCalledTimes(2);
                    }
                });
                it('should throw failed response request with DELETE method', async () => {
                    const spyFetchHttpRequestDelete = jest.spyOn(fetchHttpRequest, 'delete').mockRejectedValue(rejectedValue);

                    try {
                        await repositoryCache.findByKeyOrRequestGet(
                            'key',
                            goodData.key,
                            HttpMethod.DELETE,
                            getItemHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                    }

                    //advance time to 30s
                    jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                    try {
                        await repositoryCache.findByKeyOrRequestGet(
                            'key',
                            goodData.key,
                            HttpMethod.DELETE,
                            getItemHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                        expect(spyFetchHttpRequestDelete).toHaveBeenCalledTimes(2);
                    }
                });
            });
        });
    });

    describe("find", () => {
        it("should return HttpException with type not found when item not found in cached requests responses", async () => {
            //responses
            const responseGetList = [{ id: defaultId, data: 'data1' }, { id: 2, data: 'data2' }];
            const responseGet = { id: defaultId, data: 'data1' };

            const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);

            //get list
            jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetList);
            await repositoryCache.getList(HttpMethod.GET, { url: listUrl });

            //get item
            jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGet);
            await repositoryCache.get(HttpMethod.GET, { url: getUrl });

            expect(repositoryCache.find(1)).rejects.toEqual({ type: DefaultHttpExceptionType.NOT_FOUND });
        });

        describe("found in list cache type data", () => {
            const goodData = { id: defaultId, data: 'data5' }
            const responseGetListDataPageOne = [{ id: 1, data: 'data1' }, { id: 2, data: 'data2' }];
            const responseGetListDataPageTwo = [{ id: 3, data: 'data3' }, { id: 4, data: 'data4' }];
            const responseGetListDataPageThree = [goodData, { id: 6, data: 'data6' }];
            const responseGetDataOne = { id: 1, data: 'data1' };
            const responseGetDataThree = { id: 3, data: 'data3' };
            const responseGetDataSix = { id: 6, data: 'data6' };

            let repositoryCache: RepositoryCache<FetchRequestOptions>;
            beforeEach(() => {
                repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
            });

            afterEach(() => {
                jest.resetAllMocks();
            })

            it("should return item found in list cache type data", async () => {
                //get list page one
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetListDataPageOne);
                await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=1` });

                //get list page three
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetListDataPageThree);
                await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=3` });

                //get list page two
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetListDataPageTwo);
                await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=2` });

                //get item one
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetDataOne);
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/1` });

                //get item three
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetDataThree);
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/3` });

                //get item six
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetDataSix);
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/6` });

                expect(repositoryCache.find(defaultId)).resolves.toEqual(goodData);
            });

            it("should return item found in list cache type data nested level 1 in sub properties", async () => {
                //get list page one
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageOne });
                await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=1` });

                //get list page three
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageThree });
                await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=3` });

                //get list page two
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageTwo });
                await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=2` });

                //get item one
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataOne });
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/1` });

                //get item three
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataThree });
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/3` });

                //get item six
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataSix });
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/6` });

                expect(repositoryCache.find(defaultId, ['data'], ['item'])).resolves.toEqual(goodData);
            });

            it("should return item found in list cache type data nested level 5 in sub properties", async () => {
                //get list page one
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: { filtered: { response: { objects: { founds: responseGetListDataPageOne } } } } });
                await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=1` });

                //get list page three
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: { filtered: { response: { objects: { founds: responseGetListDataPageThree } } } } });
                await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=3` });

                //get list page two
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: { filtered: { response: { objects: { founds: responseGetListDataPageTwo } } } } });
                await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=2` });

                //get item one
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataOne });
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/1` });

                //get item three
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataThree });
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/3` });

                //get item six
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataSix });
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/6` });

                expect(repositoryCache.find(defaultId, ['data', 'filtered', 'response', 'objects', 'founds'], ['item'])).resolves.toEqual(goodData);
            });
        });

        describe("found in occurrence cache type data", () => {
            const goodData = { id: defaultId, data: 'data5' }
            const responseGetListDataPageOne = [{ id: 1, data: 'data1' }, { id: 2, data: 'data2' }];
            const responseGetListDataPageTwo = [{ id: 3, data: 'data3' }, { id: 4, data: 'data4' }];
            const responseGetListDataPageFour = [{ id: 7, data: 'data7' }, { id: 8, data: 'data8' }];
            const responseGetDataOne = { id: 1, data: 'data1' };
            const responseGetDataFive = goodData;
            const responseGetDataSix = { id: 6, data: 'data6' };

            let repositoryCache: RepositoryCache<FetchRequestOptions>;
            beforeEach(() => {
                repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
            });

            afterEach(() => {
                jest.resetAllMocks();
            })

            it("should return item found in occurrence cache type data", async () => {
                //get list page one
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetListDataPageOne);
                await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=1` });

                //get list page two
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetListDataPageTwo);
                await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=2` });

                //get list page four
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetListDataPageFour);
                await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=4` });

                //get item one
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetDataOne);
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/1` });

                //get item five
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetDataFive);
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/5` });

                //get item six
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetDataSix);
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/6` });

                expect(repositoryCache.find(defaultId)).resolves.toEqual(goodData);
            });

            it("should return item found in occurrence cache type data nested level 1 in sub properties", async () => {
                //get list page one
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageOne });
                await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=1` });

                //get list page two
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageTwo });
                await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=2` });

                //get list page four
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageFour });
                await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=4` });

                //get item one
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataOne });
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/1` });

                //get item five
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataFive });
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/5` });

                //get item six
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataSix });
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/6` });

                expect(repositoryCache.find(defaultId, ['data'], ['item'])).resolves.toEqual(goodData);
            });

            it("should return item found in occurrence cache type data nested level 5 in sub properties", async () => {
                //get list page one
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageOne });
                await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=1` });

                //get list page two
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageTwo });
                await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=2` });

                //get list page four
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageFour });
                await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=4` });

                //get item one
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ response: { get: { data: { object: { item: responseGetDataOne } } } } });
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/1` });

                //get item five
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ response: { get: { data: { object: { item: responseGetDataFive } } } } });
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/5` });

                //get item six
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ response: { get: { data: { object: { item: responseGetDataSix } } } } });
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/6` });

                expect(repositoryCache.find(defaultId, ['data'], ['response', 'get', 'data', 'object', 'item'])).resolves.toEqual(goodData);
            });
        });
    });

    describe("findOrRequestGetList", () => {
        const goodData = { id: defaultId, data: 'data5' }
        const getListHttpRequestParams = { url: getUrl }
        const getItemHttpRequestParams = { url: `${getUrl}/${goodData.id}` }
        describe("found in cache", () => {
            it("should not call http request when found in cache", async () => {
                const goodData = { id: defaultId, data: 'data5' }
                //responses
                const responseGetList = {
                    data: [
                        { id: 1, data: 'data1' },
                        { id: 2, data: 'data2' },
                        { id: 3, data: 'data3' },
                        { id: 4, data: 'data4' },
                    ]
                };

                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);

                //get list
                const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetList);
                await repositoryCache.getList(HttpMethod.GET, { url: listUrl });

                //get item
                spyFetchHttpRequestGet.mockResolvedValueOnce({ item: goodData });
                await repositoryCache.get(HttpMethod.GET, getItemHttpRequestParams);

                expect(repositoryCache.findOrRequestGetList(
                    defaultId,
                    HttpMethod.GET,
                    getItemHttpRequestParams,
                    ['data'],
                    ['item']
                )).resolves.toEqual(goodData);

                expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(2);
            });

            describe("found in list cache type data", () => {
                const responseGetListDataPageOne = [{ id: 1, data: 'data1' }, { id: 2, data: 'data2' }];
                const responseGetListDataPageTwo = [{ id: 3, data: 'data3' }, { id: 4, data: 'data4' }];
                const responseGetListDataPageThree = [goodData, { id: 6, data: 'data6' }];
                const responseGetDataOne = { id: 1, data: 'data1' };
                const responseGetDataThree = { id: 3, data: 'data3' };
                const responseGetDataSix = { id: 6, data: 'data6' };

                let repositoryCache: RepositoryCache<FetchRequestOptions>;
                beforeEach(() => {
                    repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                });

                afterEach(() => {
                    jest.resetAllMocks();
                })

                it("should return item found in list cache type data", async () => {
                    //get list page one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetListDataPageOne);
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=1` });

                    //get list page three
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetListDataPageThree);
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=3` });

                    //get list page two
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetListDataPageTwo);
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=2` });

                    //get item one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetDataOne);
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/1` });

                    //get item three
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetDataThree);
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/3` });

                    //get item six
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetDataSix);
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/6` });

                    expect(repositoryCache.findOrRequestGetList(
                        defaultId,
                        HttpMethod.GET,
                        getItemHttpRequestParams
                    )).resolves.toEqual(goodData);
                });

                it("should return item found in list cache type data nested level 1 in sub properties", async () => {
                    //get list page one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageOne });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=1` });

                    //get list page three
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageThree });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=3` });

                    //get list page two
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageTwo });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=2` });

                    //get item one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataOne });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/1` });

                    //get item three
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataThree });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/3` });

                    //get item six
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataSix });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/6` });

                    expect(repositoryCache.findOrRequestGetList(
                        defaultId,
                        HttpMethod.GET,
                        getItemHttpRequestParams,
                        ['data'],
                        ['item']
                    )).resolves.toEqual(goodData);
                });

                it("should return item found in list cache type data nested level 5 in sub properties", async () => {
                    //get list page one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: { filtered: { response: { objects: { founds: responseGetListDataPageOne } } } } });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=1` });

                    //get list page three
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: { filtered: { response: { objects: { founds: responseGetListDataPageThree } } } } });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=3` });

                    //get list page two
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: { filtered: { response: { objects: { founds: responseGetListDataPageTwo } } } } });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=2` });

                    //get item one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataOne });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/1` });

                    //get item three
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataThree });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/3` });

                    //get item six
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataSix });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/6` });

                    expect(repositoryCache.findOrRequestGetList(
                        defaultId,
                        HttpMethod.GET,
                        getItemHttpRequestParams,
                        ['data', 'filtered', 'response', 'objects', 'founds'],
                        ['item']
                    )).resolves.toEqual(goodData);
                });
            });

            describe("found in occurrence cache type data", () => {
                const goodData = { id: defaultId, data: 'data5' }
                const responseGetListDataPageOne = [{ id: 1, data: 'data1' }, { id: 2, data: 'data2' }];
                const responseGetListDataPageTwo = [{ id: 3, data: 'data3' }, { id: 4, data: 'data4' }];
                const responseGetListDataPageFour = [{ id: 7, data: 'data7' }, { id: 8, data: 'data8' }];
                const responseGetDataOne = { id: 1, data: 'data1' };
                const responseGetDataFive = goodData;
                const responseGetDataSix = { id: 6, data: 'data6' };

                let repositoryCache: RepositoryCache<FetchRequestOptions>;
                beforeEach(() => {
                    repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                });

                afterEach(() => {
                    jest.resetAllMocks();
                })

                it("should return item found in occurrence cache type data", async () => {
                    //get list page one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetListDataPageOne);
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=1` });

                    //get list page two
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetListDataPageTwo);
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=2` });

                    //get list page four
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetListDataPageFour);
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=4` });

                    //get item one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetDataOne);
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/1` });

                    //get item five
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetDataFive);
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/5` });

                    //get item six
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetDataSix);
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/6` });

                    expect(repositoryCache.findOrRequestGetList(
                        defaultId,
                        HttpMethod.GET,
                        getItemHttpRequestParams
                    )).resolves.toEqual(goodData);
                });

                it("should return item found in occurrence cache type data nested level 1 in sub properties", async () => {
                    //get list page one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageOne });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=1` });

                    //get list page two
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageTwo });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=2` });

                    //get list page four
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageFour });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=4` });

                    //get item one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataOne });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/1` });

                    //get item five
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataFive });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/5` });

                    //get item six
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataSix });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/6` });

                    expect(repositoryCache.findOrRequestGetList(
                        defaultId,
                        HttpMethod.GET,
                        getItemHttpRequestParams,
                        ['data'],
                        ['item']
                    )).resolves.toEqual(goodData);
                });

                it("should return item found in occurrence cache type data nested level 5 in sub properties", async () => {
                    //get list page one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageOne });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=1` });

                    //get list page two
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageTwo });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=2` });

                    //get list page four
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageFour });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=4` });

                    //get item one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ response: { get: { data: { object: { item: responseGetDataOne } } } } });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/1` });

                    //get item five
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ response: { get: { data: { object: { item: responseGetDataFive } } } } });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/5` });

                    //get item six
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ response: { get: { data: { object: { item: responseGetDataSix } } } } });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/6` });

                    expect(repositoryCache.findOrRequestGetList(
                        defaultId,
                        HttpMethod.GET,
                        getItemHttpRequestParams,
                        ['data'],
                        ['response', 'get', 'data', 'object', 'item']
                    )).resolves.toEqual(goodData);
                });
            });
        });

        describe("not found in cache", () => {
            it("should call http request when not found in cache", async () => {
                const goodData = { id: defaultId, data: 'data5' }
                //responses
                const responseGetList = {
                    data: [
                        { id: 1, data: 'data1' },
                        { id: 2, data: 'data2' },
                        { id: 3, data: 'data3' },
                        { id: 4, data: 'data4' },
                        goodData
                    ]
                };

                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);

                //get list
                const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetList);
                await repositoryCache.getList(HttpMethod.GET, getListHttpRequestParams);

                jest.advanceTimersByTime(defaultExpiringCacheTimeToAdvance);

                //get item
                spyFetchHttpRequestGet.mockResolvedValueOnce({ item: responseGetList.data[1] });
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/${responseGetList.data[1]!.id}` });

                //get Good item
                spyFetchHttpRequestGet.mockResolvedValueOnce({ item: goodData });
                await repositoryCache.get(HttpMethod.GET, getItemHttpRequestParams);

                expect(repositoryCache.findOrRequestGetList(
                    defaultId,
                    HttpMethod.GET,
                    getItemHttpRequestParams,
                    ['data'],
                    ['item']
                )).resolves.toEqual(goodData);

                expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(3);
            });

            describe('should do http request with good method and HttpRequestParams', () => {
                let spyFetchHttpRequestGet: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<never, FetchRequestOptions>], any>;
                let spyFetchHttpRequestPost: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions>], any>;
                let spyFetchHttpRequestPatch: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions>], any>;
                let spyFetchHttpRequestPut: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions>], any>;
                let spyFetchHttpRequestDelete: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<never, FetchRequestOptions>], any>;

                beforeEach(() => {
                    spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue({ property: { subProperty: [goodData] } });
                    spyFetchHttpRequestPost = jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue({ property: { subProperty: [goodData] } });
                    spyFetchHttpRequestPatch = jest.spyOn(fetchHttpRequest, 'patch').mockResolvedValue({ property: { subProperty: [goodData] } });
                    spyFetchHttpRequestPut = jest.spyOn(fetchHttpRequest, 'put').mockResolvedValue({ property: { subProperty: [goodData] } });
                    spyFetchHttpRequestDelete = jest.spyOn(fetchHttpRequest, 'delete').mockResolvedValue({ property: { subProperty: [goodData] } });
                });

                afterEach(() => {
                    jest.resetAllMocks();
                });
                describe("should do http request with good methods", () => {
                    it('should do http request with GET method', async () => {
                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findOrRequestGetList(
                            defaultId,
                            HttpMethod.GET,
                            getItemHttpRequestParams,
                            ['property', 'subProperty']
                        );

                        expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(1);
                        expect(spyFetchHttpRequestPost).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPatch).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPut).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestDelete).not.toHaveBeenCalled();
                    });
                    it('should do http request with POST method', async () => {
                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findOrRequestGetList(
                            defaultId,
                            HttpMethod.POST,
                            getItemHttpRequestParams,
                            ['property', 'subProperty']
                        );

                        expect(spyFetchHttpRequestPost).toHaveBeenCalledTimes(1);
                        expect(spyFetchHttpRequestGet).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPatch).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPut).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestDelete).not.toHaveBeenCalled();
                    });
                    it('should do http request with PATCH method', async () => {
                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findOrRequestGetList(
                            defaultId,
                            HttpMethod.PATCH,
                            getItemHttpRequestParams,
                            ['property', 'subProperty']
                        );

                        expect(spyFetchHttpRequestPatch).toHaveBeenCalledTimes(1);
                        expect(spyFetchHttpRequestGet).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPost).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPut).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestDelete).not.toHaveBeenCalled();
                    });
                    it('should do http request with PUT method', async () => {
                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findOrRequestGetList(
                            defaultId,
                            HttpMethod.PUT,
                            getItemHttpRequestParams,
                            ['property', 'subProperty']
                        );

                        expect(spyFetchHttpRequestPut).toHaveBeenCalledTimes(1);
                        expect(spyFetchHttpRequestGet).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPost).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPatch).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestDelete).not.toHaveBeenCalled();
                    });
                    it('should do http request with DELETE method', async () => {
                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findOrRequestGetList(
                            defaultId,
                            HttpMethod.DELETE,
                            getItemHttpRequestParams,
                            ['property', 'subProperty']
                        );

                        expect(spyFetchHttpRequestDelete).toHaveBeenCalledTimes(1);
                        expect(spyFetchHttpRequestGet).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPost).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPatch).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPut).not.toHaveBeenCalled();
                    });
                });
                describe("should do http request with good HttpRequestParams", () => {
                    const httpRequestParams: HttpRequestParams<never, FetchRequestOptions> = {
                        url: listUrl,
                        headers: { accept: '*/*', "user-agent": 'Jest' },
                        contentTypeJSON: true,
                        successStatusCodes: [206, 207, 208]
                    };
                    it("should do GET http request with good HttpRequestParams", async () => {
                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findOrRequestGetList(
                            defaultId,
                            HttpMethod.GET,
                            httpRequestParams,
                            ['property', 'subProperty']
                        );

                        expect(fetchHttpRequest.get).toHaveBeenCalledWith(httpRequestParams);
                    });
                    it("should do POST http request with good HttpRequestParams", async () => {
                        const body = { id: 5, data: 'data' };
                        const customHttpRequestParams = { ...httpRequestParams, body };

                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findOrRequestGetList(
                            defaultId,
                            HttpMethod.POST,
                            customHttpRequestParams,
                            ['property', 'subProperty']
                        );

                        expect(fetchHttpRequest.post).toHaveBeenCalledWith(customHttpRequestParams);
                    });
                    it("should do PATCH http request with good HttpRequestParams", async () => {
                        const body = { id: 5, data: 'data' };
                        const customHttpRequestParams = { ...httpRequestParams, body };

                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findOrRequestGetList(
                            defaultId,
                            HttpMethod.PATCH,
                            customHttpRequestParams,
                            ['property', 'subProperty']
                        );

                        expect(fetchHttpRequest.patch).toHaveBeenCalledWith(customHttpRequestParams);
                    });
                    it("should do PUT http request with good HttpRequestParams", async () => {
                        const body = { id: 5, data: 'data' };
                        const customHttpRequestParams = { ...httpRequestParams, body };

                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findOrRequestGetList(
                            defaultId,
                            HttpMethod.PUT,
                            customHttpRequestParams,
                            ['property', 'subProperty']
                        );

                        expect(fetchHttpRequest.put).toHaveBeenCalledWith(customHttpRequestParams);
                    });
                    it("should do DELETE http request with good HttpRequestParams", async () => {
                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findOrRequestGetList(
                            defaultId,
                            HttpMethod.DELETE,
                            httpRequestParams,
                            ['property', 'subProperty']
                        );

                        expect(fetchHttpRequest.delete).toHaveBeenCalledWith(httpRequestParams);
                    });
                });
            });

            describe('should return the data looking for', () => {
                const resolvedValue = { property: { subProperty: [goodData] } };

                it('should return the data looking for', async () => {
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue(resolvedValue);
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    expect(repositoryCache.findOrRequestGetList(
                        goodData.id,
                        HttpMethod.GET,
                        getListHttpRequestParams,
                        ['property', 'subProperty']
                    )).resolves.toEqual(goodData);
                });

                it('should return the data looking for', async () => {
                    jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue(resolvedValue);
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    expect(repositoryCache.findOrRequestGetList(
                        goodData.id,
                        HttpMethod.POST,
                        getListHttpRequestParams,
                        ['property', 'subProperty']
                    )).resolves.toEqual(goodData);
                });

                it('should return the data looking for', async () => {
                    jest.spyOn(fetchHttpRequest, 'patch').mockResolvedValue(resolvedValue);
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    expect(repositoryCache.findOrRequestGetList(
                        goodData.id,
                        HttpMethod.PATCH,
                        getListHttpRequestParams,
                        ['property', 'subProperty']
                    )).resolves.toEqual(goodData);
                });

                it('should return the data looking for', async () => {
                    jest.spyOn(fetchHttpRequest, 'put').mockResolvedValue(resolvedValue);
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    expect(repositoryCache.findOrRequestGetList(
                        goodData.id,
                        HttpMethod.PUT,
                        getListHttpRequestParams,
                        ['property', 'subProperty']
                    )).resolves.toEqual(goodData);
                });

                it('should return the data looking for', async () => {
                    jest.spyOn(fetchHttpRequest, 'delete').mockResolvedValue(resolvedValue);
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    expect(repositoryCache.findOrRequestGetList(
                        goodData.id,
                        HttpMethod.DELETE,
                        getListHttpRequestParams,
                        ['property', 'subProperty']
                    )).resolves.toEqual(goodData);
                });
            });

            describe('should throw failed response request', () => {
                const rejectedValue: HttpException = { type: DefaultHttpExceptionType.SERVER_UNAVAILABLE, body: { message: 'server not available' } };

                let repositoryCache: RepositoryCache<FetchRequestOptions>;
                beforeEach(() => {
                    repositoryCache = new RepositoryCache(fetchHttpRequest, 'id');
                });

                it('should throw failed response request with GET method', async () => {
                    const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockRejectedValue(rejectedValue);

                    try {
                        await repositoryCache.findOrRequestGetList(
                            goodData.id,
                            HttpMethod.GET,
                            getListHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                    }

                    //advance time to 30s
                    jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                    try {
                        await repositoryCache.findOrRequestGetList(
                            goodData.id,
                            HttpMethod.GET,
                            getListHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                        expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(2);
                    }

                });
                it('should throw failed response request with POST method', async () => {
                    const spyFetchHttpRequestPost = jest.spyOn(fetchHttpRequest, 'post').mockRejectedValue(rejectedValue);

                    try {
                        await repositoryCache.findOrRequestGetList(
                            goodData.id,
                            HttpMethod.POST,
                            getListHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                    }

                    //advance time to 30s
                    jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                    try {
                        await repositoryCache.findOrRequestGetList(
                            goodData.id,
                            HttpMethod.POST,
                            getListHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                        expect(spyFetchHttpRequestPost).toHaveBeenCalledTimes(2);
                    }
                });
                it('should throw failed response request with PATCH method', async () => {
                    const spyFetchHttpRequestPatch = jest.spyOn(fetchHttpRequest, 'patch').mockRejectedValue(rejectedValue);

                    try {
                        await repositoryCache.findOrRequestGetList(
                            goodData.id,
                            HttpMethod.PATCH,
                            getListHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                    }

                    //advance time to 30s
                    jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                    try {
                        await repositoryCache.findOrRequestGetList(
                            goodData.id,
                            HttpMethod.PATCH,
                            getListHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                        expect(spyFetchHttpRequestPatch).toHaveBeenCalledTimes(2);
                    }
                });
                it('should throw failed response request with PUT method', async () => {
                    const spyFetchHttpRequestPut = jest.spyOn(fetchHttpRequest, 'put').mockRejectedValue(rejectedValue);

                    try {
                        await repositoryCache.findOrRequestGetList(
                            goodData.id,
                            HttpMethod.PUT,
                            getListHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                    }

                    //advance time to 30s
                    jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                    try {
                        await repositoryCache.findOrRequestGetList(
                            goodData.id,
                            HttpMethod.PUT,
                            getListHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                        expect(spyFetchHttpRequestPut).toHaveBeenCalledTimes(2);
                    }
                });
                it('should throw failed response request with DELETE method', async () => {
                    const spyFetchHttpRequestDelete = jest.spyOn(fetchHttpRequest, 'delete').mockRejectedValue(rejectedValue);

                    try {
                        await repositoryCache.findOrRequestGetList(
                            goodData.id,
                            HttpMethod.DELETE,
                            getListHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                    }

                    //advance time to 30s
                    jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                    try {
                        await repositoryCache.findOrRequestGetList(
                            goodData.id,
                            HttpMethod.DELETE,
                            getListHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                        expect(spyFetchHttpRequestDelete).toHaveBeenCalledTimes(2);
                    }
                });
            });
        });
    });

    describe("findOrRequestGet", () => {
        const goodData = { id: defaultId, data: 'data5' }
        const getListHttpRequestParams = { url: getUrl }
        const getItemHttpRequestParams = { url: `${getUrl}/${goodData.id}` }

        describe("found in cache", () => {
            it("should not call http request when found in cache", async () => {
                //responses
                const responseGetList = {
                    data: [
                        { id: 1, data: 'data1' },
                        { id: 2, data: 'data2' },
                        { id: 3, data: 'data3' },
                        { id: 4, data: 'data4' },
                    ]
                };

                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);

                //get list
                const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetList);
                await repositoryCache.getList(HttpMethod.GET, { url: listUrl });

                //get item
                spyFetchHttpRequestGet.mockResolvedValueOnce({ item: goodData });
                await repositoryCache.get(HttpMethod.GET, getItemHttpRequestParams);

                expect(repositoryCache.findOrRequestGet(
                    goodData.id,
                    HttpMethod.GET,
                    getItemHttpRequestParams,
                    ['data'],
                    ['item']
                )).resolves.toEqual(goodData);

                expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(2);
            });

            describe("found in list cache type data", () => {
                const responseGetListDataPageOne = [{ id: 1, data: 'data1' }, { id: 2, data: 'data2' }];
                const responseGetListDataPageTwo = [{ id: 3, data: 'data3' }, { id: 4, data: 'data4' }];
                const responseGetListDataPageThree = [goodData, { id: 6, data: 'data6' }];
                const responseGetDataOne = { id: 1, data: 'data1' };
                const responseGetDataThree = { id: 3, data: 'data3' };
                const responseGetDataSix = { id: 6, data: 'data6' };

                let repositoryCache: RepositoryCache<FetchRequestOptions>;
                beforeEach(() => {
                    repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                });

                afterEach(() => {
                    jest.resetAllMocks();
                })

                it("should return item found in list cache type data", async () => {
                    //get list page one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetListDataPageOne);
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=1` });

                    //get list page three
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetListDataPageThree);
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=3` });

                    //get list page two
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetListDataPageTwo);
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=2` });

                    //get item one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetDataOne);
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/1` });

                    //get item three
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetDataThree);
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/3` });

                    //get item six
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetDataSix);
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/6` });

                    expect(repositoryCache.findOrRequestGet(
                        goodData.id,
                        HttpMethod.GET,
                        getItemHttpRequestParams
                    )).resolves.toEqual(goodData);
                });

                it("should return item found in list cache type data nested level 1 in sub properties", async () => {
                    //get list page one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageOne });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=1` });

                    //get list page three
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageThree });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=3` });

                    //get list page two
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageTwo });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=2` });

                    //get item one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataOne });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/1` });

                    //get item three
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataThree });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/3` });

                    //get item six
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataSix });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/6` });

                    expect(repositoryCache.findOrRequestGet(
                        goodData.id,
                        HttpMethod.GET,
                        getItemHttpRequestParams,
                        ['data'],
                        ['item']
                    )).resolves.toEqual(goodData);
                });

                it("should return item found in list cache type data nested level 5 in sub properties", async () => {
                    //get list page one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: { filtered: { response: { objects: { founds: responseGetListDataPageOne } } } } });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=1` });

                    //get list page three
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: { filtered: { response: { objects: { founds: responseGetListDataPageThree } } } } });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=3` });

                    //get list page two
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: { filtered: { response: { objects: { founds: responseGetListDataPageTwo } } } } });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=2` });

                    //get item one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataOne });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/1` });

                    //get item three
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataThree });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/3` });

                    //get item six
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataSix });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/6` });

                    expect(repositoryCache.findOrRequestGet(
                        goodData.id,
                        HttpMethod.GET,
                        getItemHttpRequestParams,
                        ['data', 'filtered', 'response', 'objects', 'founds'],
                        ['item']
                    )).resolves.toEqual(goodData);
                });
            });

            describe("found in occurrence cache type data", () => {
                const goodData = { id: defaultId, data: 'data5' }
                const responseGetListDataPageOne = [{ id: 1, data: 'data1' }, { id: 2, data: 'data2' }];
                const responseGetListDataPageTwo = [{ id: 3, data: 'data3' }, { id: 4, data: 'data4' }];
                const responseGetListDataPageFour = [{ id: 7, data: 'data7' }, { id: 8, data: 'data8' }];
                const responseGetDataOne = { id: 1, data: 'data1' };
                const responseGetDataFive = goodData;
                const responseGetDataSix = { id: 6, data: 'data6' };

                let repositoryCache: RepositoryCache<FetchRequestOptions>;
                beforeEach(() => {
                    repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                });

                afterEach(() => {
                    jest.resetAllMocks();
                })

                it("should return item found in occurrence cache type data", async () => {
                    //get list page one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetListDataPageOne);
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=1` });

                    //get list page two
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetListDataPageTwo);
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=2` });

                    //get list page four
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetListDataPageFour);
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=4` });

                    //get item one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetDataOne);
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/1` });

                    //get item five
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetDataFive);
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/5` });

                    //get item six
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetDataSix);
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/6` });

                    expect(repositoryCache.findOrRequestGet(
                        goodData.id,
                        HttpMethod.GET,
                        getItemHttpRequestParams
                    )).resolves.toEqual(goodData);
                });

                it("should return item found in occurrence cache type data nested level 1 in sub properties", async () => {
                    //get list page one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageOne });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=1` });

                    //get list page two
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageTwo });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=2` });

                    //get list page four
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageFour });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=4` });

                    //get item one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataOne });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/1` });

                    //get item five
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataFive });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/5` });

                    //get item six
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ item: responseGetDataSix });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/6` });

                    expect(repositoryCache.findOrRequestGet(
                        goodData.id,
                        HttpMethod.GET,
                        getItemHttpRequestParams,
                        ['data'],
                        ['item']
                    )).resolves.toEqual(goodData);
                });

                it("should return item found in occurrence cache type data nested level 5 in sub properties", async () => {
                    //get list page one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageOne });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=1` });

                    //get list page two
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageTwo });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=2` });

                    //get list page four
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ data: responseGetListDataPageFour });
                    await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}?page=4` });

                    //get item one
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ response: { get: { data: { object: { item: responseGetDataOne } } } } });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/1` });

                    //get item five
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ response: { get: { data: { object: { item: responseGetDataFive } } } } });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/5` });

                    //get item six
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce({ response: { get: { data: { object: { item: responseGetDataSix } } } } });
                    await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/6` });

                    expect(repositoryCache.findOrRequestGet(
                        goodData.id,
                        HttpMethod.GET,
                        getItemHttpRequestParams,
                        ['data'],
                        ['response', 'get', 'data', 'object', 'item']
                    )).resolves.toEqual(goodData);
                });
            });
        });

        describe("not found in cache", () => {
            it("should call http request when not found in cache", async () => {
                const goodData = { id: defaultId, data: 'data5' }
                //responses
                const responseGetList = {
                    data: [
                        { id: 1, data: 'data1' },
                        { id: 2, data: 'data2' },
                        { id: 3, data: 'data3' },
                        { id: 4, data: 'data4' },
                        goodData
                    ]
                };

                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id');

                //get list
                const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValueOnce(responseGetList);
                await repositoryCache.getList(HttpMethod.GET, getListHttpRequestParams);

                jest.advanceTimersByTime(defaultExpiringCacheTimeToAdvance);

                //get item
                spyFetchHttpRequestGet.mockResolvedValueOnce({ item: responseGetList.data[1] });
                await repositoryCache.get(HttpMethod.GET, { url: `${getUrl}/${responseGetList.data[1]!.id}` });

                //get Good item
                spyFetchHttpRequestGet.mockResolvedValueOnce({ item: goodData });
                await repositoryCache.get(HttpMethod.GET, getItemHttpRequestParams);

                expect(repositoryCache.findOrRequestGet(
                    goodData.id,
                    HttpMethod.GET,
                    getItemHttpRequestParams,
                    ['data'],
                    ['item']
                )).resolves.toEqual(goodData);

                expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(3);
            });

            describe('should do http request with good method and HttpRequestParams', () => {
                let spyFetchHttpRequestGet: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<never, FetchRequestOptions>], any>;
                let spyFetchHttpRequestPost: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions>], any>;
                let spyFetchHttpRequestPatch: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions>], any>;
                let spyFetchHttpRequestPut: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions>], any>;
                let spyFetchHttpRequestDelete: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<never, FetchRequestOptions>], any>;

                beforeEach(() => {
                    spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue({ property: { subProperty: goodData } });
                    spyFetchHttpRequestPost = jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue({ property: { subProperty: goodData } });
                    spyFetchHttpRequestPatch = jest.spyOn(fetchHttpRequest, 'patch').mockResolvedValue({ property: { subProperty: goodData } });
                    spyFetchHttpRequestPut = jest.spyOn(fetchHttpRequest, 'put').mockResolvedValue({ property: { subProperty: goodData } });
                    spyFetchHttpRequestDelete = jest.spyOn(fetchHttpRequest, 'delete').mockResolvedValue({ property: { subProperty: goodData } });
                });

                afterEach(() => {
                    jest.resetAllMocks();
                });
                describe("should do http request with good methods", () => {
                    it('should do http request with GET method', async () => {
                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findOrRequestGet(
                            goodData.id,
                            HttpMethod.GET,
                            getItemHttpRequestParams,
                            [],
                            ['property', 'subProperty']
                        );

                        expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(1);
                        expect(spyFetchHttpRequestPost).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPatch).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPut).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestDelete).not.toHaveBeenCalled();
                    });
                    it('should do http request with POST method', async () => {
                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findOrRequestGet(
                            goodData.id,
                            HttpMethod.POST,
                            getItemHttpRequestParams,
                            [],
                            ['property', 'subProperty']
                        );

                        expect(spyFetchHttpRequestPost).toHaveBeenCalledTimes(1);
                        expect(spyFetchHttpRequestGet).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPatch).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPut).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestDelete).not.toHaveBeenCalled();
                    });
                    it('should do http request with PATCH method', async () => {
                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findOrRequestGet(
                            goodData.id,
                            HttpMethod.PATCH,
                            getItemHttpRequestParams,
                            [],
                            ['property', 'subProperty']
                        );

                        expect(spyFetchHttpRequestPatch).toHaveBeenCalledTimes(1);
                        expect(spyFetchHttpRequestGet).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPost).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPut).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestDelete).not.toHaveBeenCalled();
                    });
                    it('should do http request with PUT method', async () => {
                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findOrRequestGet(
                            goodData.id,
                            HttpMethod.PUT,
                            getItemHttpRequestParams,
                            [],
                            ['property', 'subProperty']
                        );

                        expect(spyFetchHttpRequestPut).toHaveBeenCalledTimes(1);
                        expect(spyFetchHttpRequestGet).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPost).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPatch).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestDelete).not.toHaveBeenCalled();
                    });
                    it('should do http request with DELETE method', async () => {
                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findOrRequestGet(
                            goodData.id,
                            HttpMethod.DELETE,
                            getItemHttpRequestParams,
                            [],
                            ['property', 'subProperty']
                        );

                        expect(spyFetchHttpRequestDelete).toHaveBeenCalledTimes(1);
                        expect(spyFetchHttpRequestGet).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPost).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPatch).not.toHaveBeenCalled();
                        expect(spyFetchHttpRequestPut).not.toHaveBeenCalled();
                    });
                });
                describe("should do http request with good HttpRequestParams", () => {
                    const httpRequestParams: HttpRequestParams<never, FetchRequestOptions> = {
                        url: `${getUrl}/${goodData.id}`,
                        headers: { accept: '*/*', "user-agent": 'Jest' },
                        contentTypeJSON: true,
                        successStatusCodes: [206, 207, 208]
                    };
                    it("should do GET http request with good HttpRequestParams", async () => {
                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findOrRequestGet(
                            goodData.id,
                            HttpMethod.GET,
                            httpRequestParams,
                            [],
                            ['property', 'subProperty']
                        );

                        expect(fetchHttpRequest.get).toHaveBeenCalledWith(httpRequestParams);
                    });
                    it("should do POST http request with good HttpRequestParams", async () => {
                        const body = { id: 5, data: 'data' };
                        const customHttpRequestParams = { ...httpRequestParams, body };

                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findOrRequestGet(
                            goodData.id,
                            HttpMethod.POST,
                            customHttpRequestParams,
                            [],
                            ['property', 'subProperty']
                        );

                        expect(fetchHttpRequest.post).toHaveBeenCalledWith(customHttpRequestParams);
                    });
                    it("should do PATCH http request with good HttpRequestParams", async () => {
                        const body = { id: 5, data: 'data' };
                        const customHttpRequestParams = { ...httpRequestParams, body };

                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findOrRequestGet(
                            goodData.id,
                            HttpMethod.PATCH,
                            customHttpRequestParams,
                            [],
                            ['property', 'subProperty']
                        );

                        expect(fetchHttpRequest.patch).toHaveBeenCalledWith(customHttpRequestParams);
                    });
                    it("should do PUT http request with good HttpRequestParams", async () => {
                        const body = { id: 5, data: 'data' };
                        const customHttpRequestParams = { ...httpRequestParams, body };

                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findOrRequestGet(
                            goodData.id,
                            HttpMethod.PUT,
                            customHttpRequestParams,
                            [],
                            ['property', 'subProperty']
                        );

                        expect(fetchHttpRequest.put).toHaveBeenCalledWith(customHttpRequestParams);
                    });
                    it("should do DELETE http request with good HttpRequestParams", async () => {
                        const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                        await repositoryCache.findOrRequestGet(
                            goodData.id,
                            HttpMethod.DELETE,
                            httpRequestParams,
                            [],
                            ['property', 'subProperty']
                        );

                        expect(fetchHttpRequest.delete).toHaveBeenCalledWith(httpRequestParams);
                    });
                });
            });

            describe('should return the data looking for', () => {
                const resolvedValue = { property: { subProperty: goodData } };

                it('should return the data looking for with GET request', async () => {
                    jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue(resolvedValue);
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    expect(repositoryCache.findOrRequestGet(
                        goodData.id,
                        HttpMethod.GET,
                        getItemHttpRequestParams,
                        [],
                        ['property', 'subProperty']
                    )).resolves.toEqual(goodData);
                });

                it('should return the data looking for with POST request', async () => {
                    jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue(resolvedValue);
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    expect(repositoryCache.findOrRequestGet(
                        goodData.id,
                        HttpMethod.POST,
                        getItemHttpRequestParams,
                        [],
                        ['property', 'subProperty']
                    )).resolves.toEqual(goodData);
                });

                it('should return the data looking for with PATCH request', async () => {
                    jest.spyOn(fetchHttpRequest, 'patch').mockResolvedValue(resolvedValue);
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    expect(repositoryCache.findOrRequestGet(
                        goodData.id,
                        HttpMethod.PATCH,
                        getItemHttpRequestParams,
                        [],
                        ['property', 'subProperty']
                    )).resolves.toEqual(goodData);
                });

                it('should return the data looking for with PUT request', async () => {
                    jest.spyOn(fetchHttpRequest, 'put').mockResolvedValue(resolvedValue);
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    expect(repositoryCache.findOrRequestGet(
                        goodData.id,
                        HttpMethod.PUT,
                        getItemHttpRequestParams,
                        [],
                        ['property', 'subProperty']
                    )).resolves.toEqual(goodData);
                });

                it('should return the data looking for with DELETE request', async () => {
                    jest.spyOn(fetchHttpRequest, 'delete').mockResolvedValue(resolvedValue);
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    expect(repositoryCache.findOrRequestGet(
                        goodData.id,
                        HttpMethod.DELETE,
                        getItemHttpRequestParams,
                        [],
                        ['property', 'subProperty']
                    )).resolves.toEqual(goodData);
                });
            });

            describe('should throw failed response request', () => {
                const rejectedValue: HttpException = { type: DefaultHttpExceptionType.SERVER_UNAVAILABLE, body: { message: 'server not available' } };

                let repositoryCache: RepositoryCache<FetchRequestOptions>;
                beforeEach(() => {
                    repositoryCache = new RepositoryCache(fetchHttpRequest, 'id');
                });

                it('should throw failed response request with GET method', async () => {
                    const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockRejectedValue(rejectedValue);

                    try {
                        await repositoryCache.findOrRequestGet(
                            goodData.id,
                            HttpMethod.GET,
                            getItemHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                    }

                    //advance time to 30s
                    jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                    try {
                        await repositoryCache.findOrRequestGet(
                            goodData.id,
                            HttpMethod.GET,
                            getItemHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                        expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(2);
                    }

                });
                it('should throw failed response request with POST method', async () => {
                    const spyFetchHttpRequestPost = jest.spyOn(fetchHttpRequest, 'post').mockRejectedValue(rejectedValue);

                    try {
                        await repositoryCache.findOrRequestGet(
                            goodData.id,
                            HttpMethod.POST,
                            getItemHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                    }

                    //advance time to 30s
                    jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                    try {
                        await repositoryCache.findOrRequestGet(
                            goodData.id,
                            HttpMethod.POST,
                            getItemHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                        expect(spyFetchHttpRequestPost).toHaveBeenCalledTimes(2);
                    }
                });
                it('should throw failed response request with PATCH method', async () => {
                    const spyFetchHttpRequestPatch = jest.spyOn(fetchHttpRequest, 'patch').mockRejectedValue(rejectedValue);

                    try {
                        await repositoryCache.findOrRequestGet(
                            goodData.id,
                            HttpMethod.PATCH,
                            getItemHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                    }

                    //advance time to 30s
                    jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                    try {
                        await repositoryCache.findOrRequestGet(
                            goodData.id,
                            HttpMethod.PATCH,
                            getItemHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                        expect(spyFetchHttpRequestPatch).toHaveBeenCalledTimes(2);
                    }
                });
                it('should throw failed response request with PUT method', async () => {
                    const spyFetchHttpRequestPut = jest.spyOn(fetchHttpRequest, 'put').mockRejectedValue(rejectedValue);

                    try {
                        await repositoryCache.findOrRequestGet(
                            goodData.id,
                            HttpMethod.PUT,
                            getItemHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                    }

                    //advance time to 30s
                    jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                    try {
                        await repositoryCache.findOrRequestGet(
                            goodData.id,
                            HttpMethod.PUT,
                            getItemHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                        expect(spyFetchHttpRequestPut).toHaveBeenCalledTimes(2);
                    }
                });
                it('should throw failed response request with DELETE method', async () => {
                    const spyFetchHttpRequestDelete = jest.spyOn(fetchHttpRequest, 'delete').mockRejectedValue(rejectedValue);

                    try {
                        await repositoryCache.findOrRequestGet(
                            goodData.id,
                            HttpMethod.DELETE,
                            getItemHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                    }

                    //advance time to 30s
                    jest.advanceTimersByTime(defaultValidityCacheTimeToAdvance);

                    try {
                        await repositoryCache.findOrRequestGet(
                            goodData.id,
                            HttpMethod.DELETE,
                            getItemHttpRequestParams
                        );
                    }
                    catch (exception) {
                        expect(exception).toEqual(rejectedValue);
                        expect(spyFetchHttpRequestDelete).toHaveBeenCalledTimes(2);
                    }
                });
            });
        });
    });

    describe("create", () => {
        describe('should do http request with good method and HttpRequestParams', () => {
            let spyFetchHttpRequestGet: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<never, FetchRequestOptions>], any>;
            let spyFetchHttpRequestPost: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions>], any>;
            let spyFetchHttpRequestPatch: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions>], any>;
            let spyFetchHttpRequestPut: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions>], any>;
            let spyFetchHttpRequestDelete: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<never, FetchRequestOptions>], any>;

            beforeEach(() => {
                spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue({ property: { subProperty: defaultResponseData } });
                spyFetchHttpRequestPost = jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue({ property: { subProperty: defaultResponseData } });
                spyFetchHttpRequestPatch = jest.spyOn(fetchHttpRequest, 'patch').mockResolvedValue({ property: { subProperty: defaultResponseData } });
                spyFetchHttpRequestPut = jest.spyOn(fetchHttpRequest, 'put').mockResolvedValue({ property: { subProperty: defaultResponseData } });
                spyFetchHttpRequestDelete = jest.spyOn(fetchHttpRequest, 'delete').mockResolvedValue({ property: { subProperty: defaultResponseData } });
            });

            afterEach(() => {
                jest.resetAllMocks();
            });
            describe("should do http request with good methods", () => {
                it('should do http request with GET method', () => {
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    repositoryCache.create(HttpMethod.GET, { url: listUrl });

                    expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(1);
                    expect(spyFetchHttpRequestPost).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPatch).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPut).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestDelete).not.toHaveBeenCalled();
                });
                it('should do http request with POST method', () => {
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    repositoryCache.create(HttpMethod.POST, { url: listUrl });

                    expect(spyFetchHttpRequestPost).toHaveBeenCalledTimes(1);
                    expect(spyFetchHttpRequestGet).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPatch).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPut).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestDelete).not.toHaveBeenCalled();
                });
                it('should do http request with PATCH method', () => {
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    repositoryCache.create(HttpMethod.PATCH, { url: listUrl });

                    expect(spyFetchHttpRequestPatch).toHaveBeenCalledTimes(1);
                    expect(spyFetchHttpRequestGet).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPost).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPut).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestDelete).not.toHaveBeenCalled();
                });
                it('should do http request with PUT method', () => {
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    repositoryCache.create(HttpMethod.PUT, { url: listUrl });

                    expect(spyFetchHttpRequestPut).toHaveBeenCalledTimes(1);
                    expect(spyFetchHttpRequestGet).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPost).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPatch).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestDelete).not.toHaveBeenCalled();
                });
                it('should do http request with DELETE method', () => {
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    repositoryCache.create(HttpMethod.DELETE, { url: listUrl });

                    expect(spyFetchHttpRequestDelete).toHaveBeenCalledTimes(1);
                    expect(spyFetchHttpRequestGet).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPost).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPatch).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPut).not.toHaveBeenCalled();
                });
            });
            describe("should do http request with good HttpRequestParams", () => {
                const httpRequestParams: HttpRequestParams<never, FetchRequestOptions> = {
                    url: listUrl,
                    headers: { accept: '*/*', "user-agent": 'Jest' },
                    contentTypeJSON: true,
                    successStatusCodes: [206, 207, 208]
                };
                it("should do GET http request with good HttpRequestParams", async () => {
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    await repositoryCache.create(HttpMethod.GET, httpRequestParams);

                    expect(fetchHttpRequest.get).toHaveBeenCalledWith(httpRequestParams);
                });
                it("should do POST http request with good HttpRequestParams", async () => {
                    const body = { id: 5, data: 'data' };
                    const customHttpRequestParams = { ...httpRequestParams, body };

                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    await repositoryCache.create(HttpMethod.POST, customHttpRequestParams);

                    expect(fetchHttpRequest.post).toHaveBeenCalledWith(customHttpRequestParams);
                });
                it("should do PATCH http request with good HttpRequestParams", async () => {
                    const body = { id: 5, data: 'data' };
                    const customHttpRequestParams = { ...httpRequestParams, body };

                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    await repositoryCache.create(HttpMethod.PATCH, customHttpRequestParams);

                    expect(fetchHttpRequest.patch).toHaveBeenCalledWith(customHttpRequestParams);
                });
                it("should do PUT http request with good HttpRequestParams", async () => {
                    const body = { id: 5, data: 'data' };
                    const customHttpRequestParams = { ...httpRequestParams, body };

                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    await repositoryCache.create(HttpMethod.PUT, customHttpRequestParams);

                    expect(fetchHttpRequest.put).toHaveBeenCalledWith(customHttpRequestParams);
                });
                it("should do DELETE http request with good HttpRequestParams", async () => {
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    await repositoryCache.create(HttpMethod.DELETE, httpRequestParams);

                    expect(fetchHttpRequest.delete).toHaveBeenCalledWith(httpRequestParams);
                });
            });
        });

        describe('should return the response http request did', () => {
            const resolvedValue = { property: { subProperty: defaultResponseData } };

            it('should return the response http request did with GET method', async () => {
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue(resolvedValue);
                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                expect(repositoryCache.create(HttpMethod.GET, { url: listUrl })).resolves.toEqual(resolvedValue);
            });

            it('should return the response http request did with POST method', async () => {
                jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue(resolvedValue);
                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                expect(repositoryCache.create(HttpMethod.POST, { url: listUrl })).resolves.toEqual(resolvedValue);
            });

            it('should return the response http request did with PATCH method', async () => {
                jest.spyOn(fetchHttpRequest, 'patch').mockResolvedValue(resolvedValue);
                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                expect(repositoryCache.create(HttpMethod.PATCH, { url: listUrl })).resolves.toEqual(resolvedValue);
            });

            it('should return the response http request did with PUT method', async () => {
                jest.spyOn(fetchHttpRequest, 'put').mockResolvedValue(resolvedValue);
                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                expect(repositoryCache.create(HttpMethod.PUT, { url: listUrl })).resolves.toEqual(resolvedValue);
            });

            it('should return the response http request did with DELETE method', async () => {
                jest.spyOn(fetchHttpRequest, 'delete').mockResolvedValue(resolvedValue);
                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                expect(repositoryCache.create(HttpMethod.DELETE, { url: listUrl })).resolves.toEqual(resolvedValue);
            });
        });

        it("should lists cache type been cleared", async () => {
            const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);

            const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue([defaultResponseData]);
            await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}/users?page=2` });

            await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}/users?page=3` });

            jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue({ message: 'success' });
            await repositoryCache.create(HttpMethod.POST, { url: defaultBaseUrl });

            await repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}/users?page=2` });
            expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(3);
        });
    });

    describe("update", () => {
        describe('should do http request with good method and HttpRequestParams', () => {
            let spyFetchHttpRequestGet: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<never, FetchRequestOptions>], any>;
            let spyFetchHttpRequestPost: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions>], any>;
            let spyFetchHttpRequestPatch: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions>], any>;
            let spyFetchHttpRequestPut: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<unknown, FetchRequestOptions>], any>;
            let spyFetchHttpRequestDelete: jest.SpyInstance<Promise<unknown>, [httpRequestParams: HttpRequestParams<never, FetchRequestOptions>], any>;

            beforeEach(() => {
                spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue({ property: { subProperty: defaultResponseData } });
                spyFetchHttpRequestPost = jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue({ property: { subProperty: defaultResponseData } });
                spyFetchHttpRequestPatch = jest.spyOn(fetchHttpRequest, 'patch').mockResolvedValue({ property: { subProperty: defaultResponseData } });
                spyFetchHttpRequestPut = jest.spyOn(fetchHttpRequest, 'put').mockResolvedValue({ property: { subProperty: defaultResponseData } });
                spyFetchHttpRequestDelete = jest.spyOn(fetchHttpRequest, 'delete').mockResolvedValue({ property: { subProperty: defaultResponseData } });
            });

            afterEach(() => {
                jest.resetAllMocks();
            });
            describe("should do http request with good methods", () => {
                it('should do http request with GET method', () => {
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    repositoryCache.update(defaultId, HttpMethod.GET, { url: listUrl });

                    expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(1);
                    expect(spyFetchHttpRequestPost).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPatch).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPut).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestDelete).not.toHaveBeenCalled();
                });
                it('should do http request with POST method', () => {
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    repositoryCache.update(defaultId, HttpMethod.POST, { url: listUrl });

                    expect(spyFetchHttpRequestPost).toHaveBeenCalledTimes(1);
                    expect(spyFetchHttpRequestGet).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPatch).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPut).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestDelete).not.toHaveBeenCalled();
                });
                it('should do http request with PATCH method', () => {
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    repositoryCache.update(defaultId, HttpMethod.PATCH, { url: listUrl });

                    expect(spyFetchHttpRequestPatch).toHaveBeenCalledTimes(1);
                    expect(spyFetchHttpRequestGet).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPost).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPut).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestDelete).not.toHaveBeenCalled();
                });
                it('should do http request with PUT method', () => {
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    repositoryCache.update(defaultId, HttpMethod.PUT, { url: listUrl });

                    expect(spyFetchHttpRequestPut).toHaveBeenCalledTimes(1);
                    expect(spyFetchHttpRequestGet).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPost).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPatch).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestDelete).not.toHaveBeenCalled();
                });
                it('should do http request with DELETE method', () => {
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    repositoryCache.update(defaultId, HttpMethod.DELETE, { url: listUrl });

                    expect(spyFetchHttpRequestDelete).toHaveBeenCalledTimes(1);
                    expect(spyFetchHttpRequestGet).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPost).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPatch).not.toHaveBeenCalled();
                    expect(spyFetchHttpRequestPut).not.toHaveBeenCalled();
                });
            });
            describe("should do http request with good HttpRequestParams", () => {
                const httpRequestParams: HttpRequestParams<never, FetchRequestOptions> = {
                    url: listUrl,
                    headers: { accept: '*/*', "user-agent": 'Jest' },
                    contentTypeJSON: true,
                    successStatusCodes: [206, 207, 208]
                };
                it("should do GET http request with good HttpRequestParams", async () => {
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    await repositoryCache.update(defaultId, HttpMethod.GET, httpRequestParams);

                    expect(fetchHttpRequest.get).toHaveBeenCalledWith(httpRequestParams);
                });
                it("should do POST http request with good HttpRequestParams", async () => {
                    const body = { id: 5, data: 'data' };
                    const customHttpRequestParams = { ...httpRequestParams, body };

                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    await repositoryCache.update(defaultId, HttpMethod.POST, customHttpRequestParams);

                    expect(fetchHttpRequest.post).toHaveBeenCalledWith(customHttpRequestParams);
                });
                it("should do PATCH http request with good HttpRequestParams", async () => {
                    const body = { id: 5, data: 'data' };
                    const customHttpRequestParams = { ...httpRequestParams, body };

                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    await repositoryCache.update(defaultId, HttpMethod.PATCH, customHttpRequestParams);

                    expect(fetchHttpRequest.patch).toHaveBeenCalledWith(customHttpRequestParams);
                });
                it("should do PUT http request with good HttpRequestParams", async () => {
                    const body = { id: 5, data: 'data' };
                    const customHttpRequestParams = { ...httpRequestParams, body };

                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    await repositoryCache.update(defaultId, HttpMethod.PUT, customHttpRequestParams);

                    expect(fetchHttpRequest.put).toHaveBeenCalledWith(customHttpRequestParams);
                });
                it("should do DELETE http request with good HttpRequestParams", async () => {
                    const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                    await repositoryCache.update(defaultId, HttpMethod.DELETE, httpRequestParams);

                    expect(fetchHttpRequest.delete).toHaveBeenCalledWith(httpRequestParams);
                });
            });
        });

        describe('should return the response http request did', () => {
            const resolvedValue = { property: { subProperty: defaultResponseData } };

            it('should return the response http request did with GET method', async () => {
                jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue(resolvedValue);
                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                expect(repositoryCache.update(defaultId, HttpMethod.GET, { url: listUrl })).resolves.toEqual(resolvedValue);
            });

            it('should return the response http request did with POST method', async () => {
                jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue(resolvedValue);
                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                expect(repositoryCache.update(defaultId, HttpMethod.POST, { url: listUrl })).resolves.toEqual(resolvedValue);
            });

            it('should return the response http request did with PATCH method', async () => {
                jest.spyOn(fetchHttpRequest, 'patch').mockResolvedValue(resolvedValue);
                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                expect(repositoryCache.update(defaultId, HttpMethod.PATCH, { url: listUrl })).resolves.toEqual(resolvedValue);
            });

            it('should return the response http request did with PUT method', async () => {
                jest.spyOn(fetchHttpRequest, 'put').mockResolvedValue(resolvedValue);
                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                expect(repositoryCache.update(defaultId, HttpMethod.PUT, { url: listUrl })).resolves.toEqual(resolvedValue);
            });

            it('should return the response http request did with DELETE method', async () => {
                jest.spyOn(fetchHttpRequest, 'delete').mockResolvedValue(resolvedValue);
                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);
                expect(repositoryCache.update(defaultId, HttpMethod.DELETE, { url: listUrl })).resolves.toEqual(resolvedValue);
            });
        });

        it("should lists cache type been cleared", () => {
            const goodData = { id: defaultId, name: 'data' }
            const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);

            //First list request
            const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue([goodData]);
            repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}/users` });

            //Second list request
            spyFetchHttpRequestGet.mockResolvedValue([defaultResponseData]);
            repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}/roles` });

            jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue({ message: 'success' });
            repositoryCache.update(goodData.id, HttpMethod.POST, { url: defaultBaseUrl });

            repositoryCache.getList(HttpMethod.GET, { url: `${listUrl}/users` });
            expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(3);
        });

        describe('should occurrence cache type related to id been cleared', () => {
            const goodData = { id: defaultId, name: 'data' };
            const getGoodUserUrl = `${listUrl}/user/${goodData.id}`;
            const getRandomUserUrl = `${listUrl}/user/1`;

            it("with get query response data at root level", () => {
                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);

                //First list request
                const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue(goodData);
                repositoryCache.get(HttpMethod.GET, { url: getGoodUserUrl });

                //Second list request
                spyFetchHttpRequestGet.mockResolvedValue(defaultResponseData);
                repositoryCache.get(HttpMethod.GET, { url: getRandomUserUrl });

                jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue({ message: 'success' });
                repositoryCache.update(goodData.id, HttpMethod.POST, { url: defaultBaseUrl });

                repositoryCache.get(HttpMethod.GET, { url: getGoodUserUrl });
                expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(3);
            });

            it("with get query response data nested at level 1", () => {
                const goodData = { id: defaultId, name: 'data' }
                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);

                //First list request
                const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue({ data: goodData });
                repositoryCache.get(HttpMethod.GET, { url: getGoodUserUrl });

                //Second list request
                spyFetchHttpRequestGet.mockResolvedValue({ data: defaultResponseData });
                repositoryCache.get(HttpMethod.GET, { url: getRandomUserUrl });

                jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue({ message: 'success' });
                repositoryCache.update(goodData.id, HttpMethod.POST, { url: defaultBaseUrl }, ['data']);

                repositoryCache.get(HttpMethod.GET, { url: getGoodUserUrl });
                expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(3);
            });

            it("with get query response data nested at level 5", () => {
                const goodData = { id: defaultId, name: 'data' }
                const repositoryCache = new RepositoryCache(fetchHttpRequest, 'id', true);

                //First list request
                const spyFetchHttpRequestGet = jest.spyOn(fetchHttpRequest, 'get').mockResolvedValue({ response: { resource: { content: { data: { object: goodData } } } } });
                repositoryCache.get(HttpMethod.GET, { url: getGoodUserUrl });

                //Second list request
                spyFetchHttpRequestGet.mockResolvedValue({ response: { resource: { content: { data: { object: defaultResponseData } } } } });
                repositoryCache.get(HttpMethod.GET, { url: getRandomUserUrl });

                jest.spyOn(fetchHttpRequest, 'post').mockResolvedValue({ message: 'success' });
                repositoryCache.update(goodData.id, HttpMethod.POST, { url: defaultBaseUrl }, ['response', 'resource', 'content', 'data', 'object']);

                repositoryCache.get(HttpMethod.GET, { url: getGoodUserUrl });
                expect(spyFetchHttpRequestGet).toHaveBeenCalledTimes(3);
            });
        })

    });
});