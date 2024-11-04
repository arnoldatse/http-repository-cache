import FetchHttpRequest from "../httpRequest/fetch/FetchHttpRequest";
import HttpMethod from "../httpRequest/HttpMethod";
import RepositoryCache from "./RepositoryCache";

const defaulBasetUrl = 'http://localhost:3000';
const defaultId = 5;
const listUrl = `${defaulBasetUrl}/list`;
const getUrl = `${defaulBasetUrl}/get/${defaultId}`;
const defaultResponseData = { id: defaultId, data: 'data' };

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

            const spyFirstHttpReauestGet = jest.spyOn(firstHttpRequest, 'get').mockResolvedValue(defaultResponseData);
            const spySecondHttpRequestGet = jest.spyOn(secondHttpRequest, 'get').mockResolvedValue(defaultResponseData);

            const repositoryCache = new RepositoryCache(firstHttpRequest, 'id');
            repositoryCache.setHttpRequest(secondHttpRequest);

            repositoryCache.getList(HttpMethod.GET, { url: listUrl });

            expect(spyFirstHttpReauestGet).not.toHaveBeenCalled();
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
            jest.advanceTimersByTime(30000);

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

            jest.advanceTimersByTime(120000);

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
            jest.advanceTimersByTime(30000);

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

            jest.advanceTimersByTime(120000);

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
            jest.advanceTimersByTime(30000);

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

            jest.advanceTimersByTime(120000);

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

            jest.advanceTimersByTime(120000);

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
            it("should do http request with good HttpRequestParams", () => {
            });
        });

        it('should return the response http request did', () => {

        });

        it('should return the cached success response request and not do http request during the cache validity timestamp', () => {

        });

        it("should don't be cache available when validity timestamp passed and do http request", () => {

        });

        it('should not cache the failed response request', () => {

        });
    });

    describe("get", () => {
        it('should do http request with good method and HttpRequestParams', () => {
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
            it("should do http request with good HttpRequestParams", () => {
            });
        });

        it('should return the response http request did', () => {

        });

        it('should return the cached success response request and not do http request during the cache validity timestamp', () => {

        });

        it("should don't be cache available when validity timestamp passed and do http request", () => {

        });

        it('should not cache the failed response request', () => {

        });
    });

    describe("findByKey", () => {
        it("should return HttpException with type not found when item not found cache even when it's contain list and occurrence cached data", () => {

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
            describe("should do htttp request with good methods", () => {
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
            it("should do http request with good HttpRequestParams", () => {
            });
        });

        it("should return the response http request did", () => {

        });

        it("should list cache type been cleared", () => { });
    });

    describe("update", () => {
        it("should do http request with good method and HttpRequestParams", () => {
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
            it("should do http request with good HttpRequestParams", () => {
            });
        });

        it("should return the response http request did", () => {

        });

        it("should list cache type been cleared", () => { });

        it("should occurrence cache type related to id been cleared", () => { });
    });

    describe("request", () => {
        it("should do http request with good method and HttpRequestParams", () => {
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
            it("should do http request with good HttpRequestParams", () => {
            });
        });

        it("should return the response http request did", () => {

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
        it("should do http request with good method and HttpRequestParams", () => {
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
            it("should do http request with good HttpRequestParams", () => {
            });
        });

        it("should return the response http request did", () => {

        });

        it("should cache request list type", () => {

        });

        it("should cache request occurrence type", () => {

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