describe('RepositoryCache', () => {
    beforeEach(() => {

    })

    describe("setHttpRequest", () => {
        it('should set http request', () => {

        });
    });

    describe("clearCache", () => {
        it('should clear the entire cache', () => {

        });
    });

    describe("clearOccurrenceCache", () => {
        it('should remove from cache a specific occurrence request', () => {

        });
    });

    describe("getList", () => {
        it('should do http request with good method and params', () => {

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
        it('should do http request with good method and params', () => {

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

        });

        it("should return the response http request did", () => {

        });

        it("should list cache type been cleared", () => { });
    });

    describe("update", () => {
        it("should do http request with good method and params", () => {

        });

        it("should return the response http request did", () => {

        });

        it("should list cache type been cleared", () => { });

        it("should occurrence cache type related to id been cleared", () => { });
    });

    describe("request", () => {
        it("should do http request with good method and params", () => {

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
        it("should do http request with good method and params", () => {

        });

        it("should return the response http request did", () => {

        });

        it("should cache request list type", ()=>{

        });

        it("should cache request occurrence type", ()=>{

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