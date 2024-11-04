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
            describe("should do http request with good methods", () => {
                it('should do http request with GET method', () => {

                });
                it('should do http request with POST method', () => {

                });
                it('should do http request with PATCH method', () => {

                });
                it('should do http request with PUT method', () => {

                });
                it('should do http request with DELETE method', () => {

                });
            });
            describe("should do http request with good HttpRequestParams", () => {
                it("should do GET http request with good HttpRequestParams", async () => { });
                it("should do POST http request with good HttpRequestParams", async () => { });
                it("should do PATCH http request with good HttpRequestParams", async () => { });
                it("should do PUT http request with good HttpRequestParams", async () => { });
                it("should do DELETE http request with good HttpRequestParams", async () => { });
            });
        });

        describe('should return the response http request did', () => {

        });

        describe('should return the cached success response request and not do http request for every time when cache validity is eternal', () => {

        });

        describe('should return the cached success response request and not do http request during the cache validity timestamp', () => {

        });

        describe("should don't be cache available when validity timestamp passed and do http request", () => {
            it("should don't be cache available when validity timestamp passed and do http request with GET method", async () => { });
            it("should don't be cache available when validity timestamp passed and do http request with POST method", async () => { });
            it("should don't be cache available when validity timestamp passed and do http request with PATCH method", async () => { });
            it("should don't be cache available when validity timestamp passed and do http request with PUT method", async () => { });
            it("should don't be cache available when validity timestamp passed and do http request with DELETE method", async () => { });
        });


        describe('should not return the cached success response request and do http request during the cache validity timestamp when method change', () => {
            it('should not return the cached success response request and do http request during the cache validity timestamp when method change with GET method', async () => { });
            it('should not return the cached success response request and do http request during the cache validity timestamp when method change with POST method', async () => { });
            it('should not return the cached success response request and do http request during the cache validity timestamp when method change with PATCH method', async () => { });
            it('should not return the cached success response request and do http request during the cache validity timestamp when method change with PUT method', async () => { });
            it('should not return the cached success response request and do http request during the cache validity timestamp when method change with DELETE method', async () => { });
        });

        describe('should not return the cached success response request and do http request during the cache validity timestamp when httpRequestParams contentTypeJSON property change according cached request', () => {
            it('should not return the cached success response request and do http request during the cache validity timestamp when httpRequestParams contentTypeJSON property change according cached request with GET method', async () => { });
            it('should not return the cached success response request and do http request during the cache validity timestamp when httpRequestParams contentTypeJSON property change according cached request with POST method', async () => { });
            it('should not return the cached success response request and do http request during the cache validity timestamp when httpRequestParams contentTypeJSON property change according cached request with PATCH method', async () => { });
            it('should not return the cached success response request and do http request during the cache validity timestamp when httpRequestParams contentTypeJSON property change according cached request with PUT method', async () => { });
            it('should not return the cached success response request and do http request during the cache validity timestamp when httpRequestParams contentTypeJSON property change according cached request with DELETE method', async () => { });
        });

        describe('should not return the cached success response request and do http request during the cache validity timestamp when auth token definition change according cached request', () => {
            it('should not return the cached success response request and do http request during the cache validity timestamp when auth token definition change according cached request with GET method', async () => { });
            it('should not return the cached success response request and do http request during the cache validity timestamp when auth token definition change according cached request with POST method', async () => { });
            it('should not return the cached success response request and do http request during the cache validity timestamp when auth token definition change according cached request with PATCH method', async () => { });
            it('should not return the cached success response request and do http request during the cache validity timestamp when auth token definition change according cached request with PUT method', async () => { });
            it('should not return the cached success response request and do http request during the cache validity timestamp when auth token definition change according cached request with DELETE method', async () => { });
        });

        describe('should not cache the failed response request', () => {
            it('should not cache the failed response request with GET method', async () => { });
            it('should not cache the failed response request with POST method', async () => { });
            it('should not cache the failed response request with PATCH method', async () => { });
            it('should not cache the failed response request with PUT method', async () => { });
            it('should not cache the failed response request with DELETE method', async () => { });
        });
    });

    describe("findByKey", () => {
        it("should return HttpException with type not found when item not found in cached requests responses", () => {

        });

        describe("found in list cache type data", () => {
            it("should return item found in list cache type data", () => {

            });

            it("should return item found in list cache type data nested level 1 in sub properties", () => {

            });

            it("should return item found in list cache type data nested level 5 in sub properties", () => {

            });
        });

        describe("found in occurrence cache type data", () => {
            it("should return item found in occurrence cache type data", () => {

            });

            it("should return item found in occurrence cache type data nested level 1 in sub properties", () => {

            });

            it("should return item found in occurrence cache type data nested level 5 in sub properties", () => {

            });
        });
    });

    describe("findByKeyOrRequestGetList", () => {
        describe("found in cache", () => {
            //copy from findByKey
        });

        describe("not found in cache", () => {
            //copy from getList
        });
    });

    describe("findByKeyOrRequestGet", () => {
        describe("found in cache", () => {
            //copy from findByKey
        });

        describe("not found in cache", () => {
            //copy from get
        });
    });

    describe("findByKeyOrRequest", () => {
        describe("found in cache", () => {
            //copy from findByKey
        });

        describe("not found in cache", () => {
            //copy from get

            it("should find item in new request occurrence cached", () => {

            });

            it("should find item in new request list cached", () => {

            });
        });
    });

    describe("find", () => {
        //copy from findByKey
    });

    describe("findOrRequestGetList", () => {
        //copy from findByKeyOrRequestGetList
    });

    describe("findOrRequestGet", () => {
        //copy from findByKeyOrRequestGet
    });

    describe("create", () => {
        it("should do http request with good method and params", () => {
            describe("should do http request with good methods", () => {
                it('should do http request with GET method', () => {

                });
                it('should do http request with POST method', () => {

                });
                it('should do http request with PATCH method', () => {

                });
                it('should do http request with PUT method', () => {

                });
                it('should do http request with DELETE method', () => {

                });
            });
            describe("should do http request with good HttpRequestParams", () => {
                it("should do GET http request with good HttpRequestParams", async () => { });
                it("should do POST http request with good HttpRequestParams", async () => { });
                it("should do PATCH http request with good HttpRequestParams", async () => { });
                it("should do PUT http request with good HttpRequestParams", async () => { });
                it("should do DELETE http request with good HttpRequestParams", async () => { });
            });
        });

        describe("should return the response http request did", () => {

        });

        it("should list cache type been cleared", () => { });
    });

    describe("update", () => {
        describe("should do http request with good method and HttpRequestParams", () => {
            describe("should do http request with good methods", () => {
                it('should do http request with GET method', () => {

                });
                it('should do http request with POST method', () => {

                });
                it('should do http request with PATCH method', () => {

                });
                it('should do http request with PUT method', () => {

                });
                it('should do http request with DELETE method', () => {

                });
            });
            describe("should do http request with good HttpRequestParams", () => {
                it("should do GET http request with good HttpRequestParams", async () => { });
                it("should do POST http request with good HttpRequestParams", async () => { });
                it("should do PATCH http request with good HttpRequestParams", async () => { });
                it("should do PUT http request with good HttpRequestParams", async () => { });
                it("should do DELETE http request with good HttpRequestParams", async () => { });
            });
        });

        describe("should return the response http request did", () => {

        });

        it("should list cache type been cleared", () => { });

        it("should occurrence cache type related to id been cleared", () => { });
    });

    describe("request", () => {
        describe("should do http request with good method and HttpRequestParams", () => {
            describe("should do http request with good methods", () => {
                it('should do http request with GET method', () => {

                });
                it('should do http request with POST method', () => {

                });
                it('should do http request with PATCH method', () => {

                });
                it('should do http request with PUT method', () => {

                });
                it('should do http request with DELETE method', () => {

                });
            });
            describe("should do http request with good HttpRequestParams", () => {
                it("should do GET http request with good HttpRequestParams", async () => { });
                it("should do POST http request with good HttpRequestParams", async () => { });
                it("should do PATCH http request with good HttpRequestParams", async () => { });
                it("should do PUT http request with good HttpRequestParams", async () => { });
                it("should do DELETE http request with good HttpRequestParams", async () => { });
            });
        });

        describe("should return the response http request did", () => {

        });

        describe("clear entire cache", () => {
            it("should clear the entire cache when request success", () => {

            });
            it("should not clear the entire cache when request failed", () => { });
        });

        describe("clear list cache", () => {
            it("should clear the list cache when request success", () => {

            });
            it("should not clear the list cache when request failed", () => { });
        });

        describe("clear occurrence cache", () => {
            it("should clear the occurrence cache when request success", () => {

            });
            it("should not clear the occurrence cache when request failed", () => { });
        });
    });

    describe("requestCached", () => {
        describe("should do http request with good method and HttpRequestParams", () => {
            describe("should do http request with good methods", () => {
                it('should do http request with GET method', () => {

                });
                it('should do http request with POST method', () => {

                });
                it('should do http request with PATCH method', () => {

                });
                it('should do http request with PUT method', () => {

                });
                it('should do http request with DELETE method', () => {

                });
            });
            describe("should do http request with good HttpRequestParams", () => {
                it("should do GET http request with good HttpRequestParams", async () => { });
                it("should do POST http request with good HttpRequestParams", async () => { });
                it("should do PATCH http request with good HttpRequestParams", async () => { });
                it("should do PUT http request with good HttpRequestParams", async () => { });
                it("should do DELETE http request with good HttpRequestParams", async () => { });
            });
        });

        describe("should return the response http request did", () => {

        });

        describe('should return the cached success response request and not do http request for every time when cache validity is eternal', () => {
            const resolvedValue = { property: { subProperty: defaultResponseData } };

        });

        describe('should return the cached success response request and not do http request during the cache validity timestamp', () => {

        });

        describe("should don't be cache available when validity timestamp passed and do http request", () => {
            it("should don't be cache available when validity timestamp passed and do http request with GET method", async () => { });
            it("should don't be cache available when validity timestamp passed and do http request with POST method", async () => { });
            it("should don't be cache available when validity timestamp passed and do http request with PATCH method", async () => { });
            it("should don't be cache available when validity timestamp passed and do http request with PUT method", async () => { });
            it("should don't be cache available when validity timestamp passed and do http request with DELETE method", async () => { });
        });

        describe('should not return the cached success response request and do http request during the cache validity timestamp when method change', () => {
            it('should not return the cached success response request and do http request during the cache validity timestamp when method change with GET method', async () => { });
            it('should not return the cached success response request and do http request during the cache validity timestamp when method change with POST method', async () => { });
            it('should not return the cached success response request and do http request during the cache validity timestamp when method change with PATCH method', async () => { });
            it('should not return the cached success response request and do http request during the cache validity timestamp when method change with PUT method', async () => { });
            it('should not return the cached success response request and do http request during the cache validity timestamp when method change with DELETE method', async () => { });
        });

        describe('should not return the cached success response request and do http request during the cache validity timestamp when httpRequestParams contentTypeJSON property change according cached request', () => {
            it('should not return the cached success response request and do http request during the cache validity timestamp when httpRequestParams contentTypeJSON property change according cached request with GET method', async () => { });
            it('should not return the cached success response request and do http request during the cache validity timestamp when httpRequestParams contentTypeJSON property change according cached request with POST method', async () => { });
            it('should not return the cached success response request and do http request during the cache validity timestamp when httpRequestParams contentTypeJSON property change according cached request with PATCH method', async () => { });
            it('should not return the cached success response request and do http request during the cache validity timestamp when httpRequestParams contentTypeJSON property change according cached request with PUT method', async () => { });
            it('should not return the cached success response request and do http request during the cache validity timestamp when httpRequestParams contentTypeJSON property change according cached request with DELETE method', async () => { });
        });

        describe('should not return the cached success response request and do http request during the cache validity timestamp when auth token definition change according cached request', () => {
            it('should not return the cached success response request and do http request during the cache validity timestamp when auth token definition change according cached request with GET method', async () => { });
            it('should not return the cached success response request and do http request during the cache validity timestamp when auth token definition change according cached request with POST method', async () => { });
            it('should not return the cached success response request and do http request during the cache validity timestamp when auth token definition change according cached request with PATCH method', async () => { });
            it('should not return the cached success response request and do http request during the cache validity timestamp when auth token definition change according cached request with PUT method', async () => { });
            it('should not return the cached success response request and do http request during the cache validity timestamp when auth token definition change according cached request with DELETE method', async () => { });
        });

        describe('should not cache the failed response request', () => {
            it('should not cache the failed response request with GET method', async () => { });
            it('should not cache the failed response request with POST method', async () => { });
            it('should not cache the failed response request with PATCH method', async () => { });
            it('should not cache the failed response request with PUT method', async () => { });
            it('should not cache the failed response request with DELETE method', async () => { });
        });

        describe("clear entire cache", () => {
            it("should clear the entire cache when request success", () => {

            });
            it("should not clear the entire cache when request failed", () => { });
        });

        describe("clear list cache", () => {
            it("should clear the list cache when request success", () => {

            });
            it("should not clear the list cache when request failed", () => { });
        });

        describe("clear occurrence cache", () => {
            it("should clear the occurrence cache when request success", () => {

            });
            it("should not clear the occurrence cache when request failed", () => { });
        });
    });
});