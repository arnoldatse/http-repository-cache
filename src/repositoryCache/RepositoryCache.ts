import DefaultHttpExceptionType from "../httpRequest/exception/DefaultHttpExceptionType";
import HttpMethod from "../httpRequest/HttpMethod";
import HttpRequestAdapter, { HttpRequestParams } from "../httpRequest/HttpRequestAdapter";
import ObjectUtils from "../utils/ObjectUtils";

export enum RequestType {
  LIST,
  OCCURENCE
}

interface RequestSignature<T = void> {
  method: HttpMethod;
  body?: T;
  headers?: Record<string, string>;
}

type OccurentDatasCacheSignature = Record<string, unknown>;
type DatasCacheSignature = OccurentDatasCacheSignature | OccurentDatasCacheSignature[];

interface Cache<B> {
  lastFetch: number;
  signature: RequestSignature<B>;
  requestType: RequestType;
  datas: unknown;
}

type url = string;

/**
 * RepositoryCache class handle cache for http requests
 *
 * @template O type of request options
 */
export default class RepositoryCache<O = unknown> {
  private cache: Record<url, Cache<unknown>> = {};

  // Cache validity in seconds
  private _cacheValidity: number;

  /**
   *
   * @param httpRequest  HttpRequestAdapter instance to make http requests
   * @param idKey The key to identify the occurence in the response datas
   * @param unexpiringCache True if cache never expire, false otherwise
   * @param cacheValidity Cache validity in seconds
   */
  constructor(private httpRequest: HttpRequestAdapter<O>, private idKey: string, private unexpiringCache = false, cacheValidity = 60) {
    this._cacheValidity = cacheValidity;
  }

  private createRequestSignature<B>(method: HttpMethod, httpRequestParams: HttpRequestParams<B, O>): RequestSignature<B> {
    return {
      method: method,
      ...(httpRequestParams.body && { body: httpRequestParams.body }),
      ...(httpRequestParams.headers && { headers: httpRequestParams.headers })
    }

  }

  private cacheResponse<R = unknown, B = void>(method: HttpMethod, httpRequestParams: HttpRequestParams<B, O>, requestType: RequestType, response: R) {
    this.cache[httpRequestParams.url] = {
      lastFetch: Date.now(),
      signature: this.createRequestSignature(method, httpRequestParams),
      requestType,
      datas: response
    }
  }

  private clearCache() {
    this.cache = {};
  }

  /**
   * Delete all cache list type
   */
  private clearListsCache() {
    Object.keys(this.cache).forEach(cacheKey => {
      if (this.cache[cacheKey]?.requestType === RequestType.LIST) {
        delete this.cache[cacheKey];
      }
    });
  }

  /**
   * Delete all cache occurence type that has the id in the occurence datas
   *
   * @param id
   * @param subPropertyResponseOccurence
   */
  private clearOccurenceCache(id: string | number, subPropertyResponseOccurence: string[]) {
    Object.keys(this.cache).map((cacheKey) => {
      const cache = this.cache[cacheKey];
      if (cache?.requestType === RequestType.OCCURENCE) {
        const datas = this.getOccurenceFromResponse(cache.datas, subPropertyResponseOccurence);
        if (datas[this.idKey] === id) {
          delete this.cache[cacheKey];
        }
      }
    })
  }

  /**
   * If response has sub properties, get the list from nested property that has datas list in the response
   * @param response
   * @param subPropertyResponseList
   * @returns
   */
  private getListFromResponse(response: unknown, subPropertyResponseList?: string[]): DatasCacheSignature {
    let list = response as Record<string, unknown> | OccurentDatasCacheSignature[];
    if (subPropertyResponseList) {
      subPropertyResponseList.forEach((subProperty) => {
        if (!Array.isArray(list)) {
          list = list[subProperty] as Record<string, unknown> | OccurentDatasCacheSignature[];
        }
      });
    }
    return list;
  }

  /**
   * If response has sub properties, get the occurence from nested property that has datas occurence in the response
   * @param response
   * @param subPropertyResponseOccurence
   * @returns
   */
  private getOccurenceFromResponse(response: unknown, subPropertyResponseOccurence: string[]): OccurentDatasCacheSignature {
    let occurence = response as Record<string, unknown> | OccurentDatasCacheSignature;
    if (subPropertyResponseOccurence) {
      subPropertyResponseOccurence.forEach((subProperty) => {
        occurence = occurence[subProperty] as Record<string, unknown> | OccurentDatasCacheSignature;
      });
    }
    return occurence;
  }

  /**
   * Find an item in cache according to key and value
   *
   * @template T Response type
   * @param key
   * @param value
   * @param subPropertyResponseList an array of strings to get from the request list response body the nested sub property where the list is
   * @param subPropertyResponseOccurence an array of strings to get from the request occurence response body the nested sub property where the occurence is
   * @returns
   */
  private findInCache<T>(key: string, value: string | number, subPropertyResponseList?: string[], subPropertyResponseOccurence?: string[]): T | null {
    this.removeAllExpiredCache();

    let datas: T | null = null;

    Object.values(this.cache).some(cache => {
      let cacheDatas: DatasCacheSignature;
      if (cache.requestType === RequestType.LIST) {
        cacheDatas = this.getListFromResponse(cache.datas, subPropertyResponseList);
        if (Array.isArray(cacheDatas)) {
          return cacheDatas.find((item) => {
            if (item[key] === value) {
              datas = item as T;
              return true;
            }
            return false;
          })
        }
      }
      if (cache.requestType === RequestType.OCCURENCE) {
        cacheDatas = this.getOccurenceFromResponse(cache.datas, subPropertyResponseOccurence!);
        if (cacheDatas[key] === value) {
          datas = cacheDatas as T;
          return true;
        }
      }
    })

    return datas;
  }

  /**
   * Check if cache is expired according to last fetch time
   * cache is expired if last fetch is older than cache validity
   * return true if cache is expired, false otherwise
   *
   * @param cache
   * @returns
   */
  private isCacheExpired(cache: Cache<unknown>) {
    return Date.now() - cache.lastFetch > this._cacheValidity * 1000;
  }

  /**
   * Get request response from cache if it exist
   *
   * @param requestMethod
   * @param httpRequestParams
   * @returns
   */
  private getRequestCache<B = void>(requestMethod: HttpMethod, httpRequestParams: HttpRequestParams<B, O>) {
    const findedCache = this.cache[httpRequestParams.url];
    if (findedCache) {
      const currentRequestSignature: RequestSignature<B> = this.createRequestSignature(requestMethod, httpRequestParams);

      if (ObjectUtils.isObjectsEquals(findedCache.signature, currentRequestSignature)) {
        return findedCache.datas;
      }
    }
    return null;
  }

  private removeAllExpiredCache() {
    if (!this.unexpiringCache) {
      Object.keys(this.cache).forEach((key) => {
        if (this.cache[key] && this.isCacheExpired(this.cache[key])) {
          delete this.cache[key];
        }
      });
    }
  }

  /**
   * Getting request from cache if available. If not, request paramater are called to make the request
   * it removes all expired cache before checking if cache is available
   *
   * @template R Response type
   * @template B request body type
   * @param httpRequest
   * @param method
   * @param httpRequestParams
   * @returns
   */
  private requestWithCache<R = unknown, B = void>(httpRequest: (method: HttpMethod, httpRequestParams: HttpRequestParams<B, O>, requestType: RequestType) => Promise<R>, method: HttpMethod, httpRequestParams: HttpRequestParams<B, O>, requestType: RequestType) {
    this.removeAllExpiredCache();
    const datas = this.getRequestCache<B>(method, httpRequestParams);
    if (datas) {
      return Promise.resolve(datas as R);
    }
    return httpRequest(method, httpRequestParams, requestType);
  }

  /**
   * Do the Http request according to method and httpRequestParams
   *
   * @param method
   * @param httpRequestParams
   * @returns
   */
  private doHttpRequest<R, B = void>(method: HttpMethod, httpRequestParams: HttpRequestParams<B, O>) {
    let request: Promise<R>;
    switch (method) {
      case HttpMethod.GET:
        request = this.httpRequest.get<R>(httpRequestParams as HttpRequestParams<never, O>);
        break;
      case HttpMethod.POST:
        request = this.httpRequest.post<R, B>(httpRequestParams);
        break;
      case HttpMethod.PUT:
        request = this.httpRequest.put<R, B>(httpRequestParams);
        break;
      case HttpMethod.PATCH:
        request = this.httpRequest.patch<R, B>(httpRequestParams);
        break;
      case HttpMethod.DELETE:
        request = this.httpRequest.delete<R>(httpRequestParams as HttpRequestParams<never, O>);
        break;
      default:
        throw new Error('Method not supported');
    }
    return request;
  }

  private doCachedHttpRequest<R = unknown, B = void>(method: HttpMethod, httpRequestParams: HttpRequestParams<B, O>, requestType: RequestType) {
    return this.doHttpRequest<R, B>(method, httpRequestParams).then((response: R) => {
      this.cacheResponse(method, httpRequestParams, requestType, response);
      return response;
    })
  }

  /**
   * Get list from cache according httpRequestParams parameter to identify specific request cache.
   * If cache is not found or expired, request will be made and cache will be updated with the response of this request.
   *
   * @template R Response type
   * @template B request body type
   * @param method
   * @param httpRequestParams
   * @returns
   */
  getList<R, B = void>(method: HttpMethod, httpRequestParams: HttpRequestParams<B, O>): Promise<R> {
    return this.requestWithCache<R, B>(this.doCachedHttpRequest.bind(this)<R, B>, method, httpRequestParams, RequestType.LIST);
  }

  /**
   * Get item from cache according httpRequestParams parameter to identify specific request cache.
   * If cache is not found or expired, request will be made and cache will be updated with the response of this request.
   *
   * @template R Response type
   * @template B request body type
   * @param method
   * @param httpRequestParams
   * @returns
   */
  get<R, B = void>(method: HttpMethod, httpRequestParams: HttpRequestParams<B, O>): Promise<R> {
    return this.requestWithCache<R, B>(this.doCachedHttpRequest.bind(this)<R, B>, method, httpRequestParams, RequestType.OCCURENCE);
  }

  /**
   * Find an item by key from cache
   *
   * @template T Response type
   * @param key
   * @param value
   * @param method
   * @param httpRequestParams
   * @param subPropertyResponseList an array of strings to get from the body of list type request response the nested sub property where the list is
   * @param subPropertyResponseOccurence an array of strings to get from the body of occurence type request response the nested sub property where the occurence is
   * @returns
   */
  findByKey<T>(key: string, value: string | number, subPropertyResponseList?: string[], subPropertyResponseOccurence?: string[]): Promise<T> {
    const datas = this.findInCache<T>(key, value, subPropertyResponseList, subPropertyResponseOccurence);
    if (datas) {
      return Promise.resolve(datas);
    }
    return Promise.reject({ type: DefaultHttpExceptionType.NOT_FOUND });
  }

  /**
   * Find an item by key from cache or request to get all and cache it
   *
   * @template R Response type
   * @template B request body type
   * @param key
   * @param value
   * @param method
   * @param httpRequestParams
   * @param subPropertyResponseList an array of strings to get from the body of list type request response the nested sub property where the list is
   * @param subPropertyResponseOccurence an array of strings to get from the body of occurence type request response the nested sub property where the occurence is
   * @returns
   */
  findByKeyOrRequestGetList<R, B = void>(key: string, value: string | number, method: HttpMethod, httpRequestParams: HttpRequestParams<B, O>, subPropertyResponseList?: string[], subPropertyResponseOccurence?: string[]): Promise<R> {
    return this.findByKey<R>(key, value, subPropertyResponseList, subPropertyResponseOccurence).catch(async () => {
      await this.getList<R, B>(method, httpRequestParams);
      return this.findByKey(key, value, subPropertyResponseList, subPropertyResponseOccurence);
    });
  }

  /**
   * Find an item by key from cache or request and cache it
   *
   * @template R Response type
   * @template B request body type
   * @param key
   * @param value
   * @param method
   * @param httpRequestParams
   * @param subPropertyResponseList an array of strings to get from the body of list type request response the nested sub property where the list is
   * @param subPropertyResponseOccurence an array of strings to get from the body of occurence type request response the nested sub property where the occurence is
   * @returns
   */
  findByKeyOrRequestGet<R, B = void>(key: string, value: string | number, method: HttpMethod, httpRequestParams: HttpRequestParams<B, O>, subPropertyResponseList?: string[], subPropertyResponseOccurence?: string[]): Promise<R> {
    return this.findByKey<R>(key, value, subPropertyResponseList, subPropertyResponseOccurence).catch(() => {
      return this.get<R, B>(method, httpRequestParams);
    });
  }

  /**
   * Find an item by key from cache or request and cache it
   *
   * @template R Response type
   * @template B request body type
   * @param key
   * @param value
   * @param method
   * @param httpRequestParams
   * @param requestType
   * @param subPropertyResponseList an array of strings to get from the body of list type request response the nested sub property where the list is
   * @param subPropertyResponseOccurence an array of strings to get from the body of occurence type request response the nested sub property where the occurence is
   * @returns
   */
  findByKeyOrRequest<R, B = void>(key: string, value: string | number, method: HttpMethod, httpRequestParams: HttpRequestParams<B, O>, requestType: RequestType, subPropertyResponseList?: string[], subPropertyResponseOccurence?: string[]): Promise<R> {
    return this.findByKey<R>(key, value, subPropertyResponseList, subPropertyResponseOccurence).catch(() => {
      return this.doCachedHttpRequest<R, B>(method, httpRequestParams, requestType);
    });
  }

  /**
   * Find an item by id key from cache
   *
   * @template T Response type
   * @param key
   * @param value
   * @param method
   * @param httpRequestParams
   * @param subPropertyResponseList an array of strings to get from the body of list type request response the nested sub property where the list is
   * @param subPropertyResponseOccurence an array of strings to get from the body of occurence type request response the nested sub property where the occurence is
   * @returns
   */
  find<T>(id: string | number, subPropertyResponseList?: string[], subPropertyResponseOccurence?: string[]): Promise<T> {
    return this.findByKey<T>(this.idKey, id, subPropertyResponseList, subPropertyResponseOccurence);
  }

  /**
   * Find an item by id key from cache or request to get all and cache it
   *
   * @template R Response type
   * @template B request body type
   * @param key
   * @param value
   * @param method
   * @param httpRequestParams
   * @param subPropertyResponseList an array of strings to get from the body of list type request response the nested sub property where the list is
   * @param subPropertyResponseOccurence an array of strings to get from the body of occurence type request response the nested sub property where the occurence is
   * @returns
   */
  findOrRequestGetList<R, B = void>(id: string | number, method: HttpMethod, httpRequestParams: HttpRequestParams<B, O>, subPropertyResponseList?: string[], subPropertyResponseOccurence?: string[]): Promise<R> {
    return this.findByKeyOrRequestGetList<R, B>(this.idKey, id, method, httpRequestParams, subPropertyResponseList, subPropertyResponseOccurence);
  }

  /**
   * Find an item by id key from cache or request and cache it
   *
   * @template R Response type
   * @template B request body type
   * @param key
   * @param value
   * @param method
   * @param httpRequestParams
   * @param subPropertyResponseList an array of strings to get from the body of list type request response the nested sub property where the list is
   * @param subPropertyResponseOccurence an array of strings to get from the body of occurence type request response the nested sub property where the occurence is
   * @returns
   */
  findOrRequestGet<R, B = void>(id: string | number, method: HttpMethod, httpRequestParams: HttpRequestParams<B, O>, subPropertyResponseList?: string[], subPropertyResponseOccurence?: string[]): Promise<R> {
    return this.findByKeyOrRequestGet<R, B>(this.idKey, id, method, httpRequestParams, subPropertyResponseList, subPropertyResponseOccurence);
  }

  /**
   * Request to create an item and clear lists cache
   *
   * @template R Response type
   * @template B request body type
   * @param method
   * @param httpRequestParams
   * @returns
   */
  create<R, B = void>(method: HttpMethod, httpRequestParams: HttpRequestParams<B, O>): Promise<R> {
    this.clearListsCache();
    return this.doHttpRequest<R, B>(method, httpRequestParams).then((response) => {
      return response;
    });
  }

  /**
   * Request to update an item and clear lists cache and specific occurence cache
   *
   * @template R Response type
   * @template B request body type
   * @param id
   * @param method
   * @param httpRequestParams
   * @param subPropertyResponseOccurence an array of strings to get from the body of occurence type request response the nested sub property where the occurence is
   * @returns
   */
  update<R, B = void>(id: string | number, method: HttpMethod, httpRequestParams: HttpRequestParams<B, O>, subPropertyResponseOccurence: string[] = []): Promise<R> {
    this.clearOccurenceCache(id, subPropertyResponseOccurence);
    this.clearListsCache();
    return this.doHttpRequest<R, B>(method, httpRequestParams).then((response) => {
      return response;
    });
  }

  /**
   * For specific requests that not need to be cached and clear cache if necessary
   *
   * @template R Response type
   * @template B request body type
   * @param method
   * @param httpRequestParams
   * @param clearCache
   * @param clearListsCache
   * @param clearOccurenceCache
   * @param occurenceId
   * @returns
   */
  request<R, B = void>(method: HttpMethod, httpRequestParams: HttpRequestParams<B, O>, clearCache = false, clearListsCache = false, clearOccurenceCache = false, occurenceId?: string | number, subPropertyResponseOccurence: string[] = []): Promise<R> {
    if (clearCache) {
      this.clearCache();
    }
    if (clearListsCache) {
      this.clearListsCache();
    }
    if (clearOccurenceCache && occurenceId) {
      this.clearOccurenceCache(occurenceId, subPropertyResponseOccurence);
    }

    return this.doHttpRequest<R, B>(method, httpRequestParams).then((response) => {
      return response;
    });
  }

  /**
   * For specific requests not match with getList, get, findByKey, create, update and delete methods that relying on cache and clear cache if necessary
   *
   * @template R Response type
   * @template B request body type
   * @param method
   * @param httpRequestParams
   * @param clearCache
   * @param clearListsCache
   * @param clearOccurenceCache
   * @param occurenceId
   * @returns
   */
  requestCached<R, B = void>(method: HttpMethod, httpRequestParams: HttpRequestParams<B, O>, requestType: RequestType, clearCache = false, clearListsCache = false, clearOccurenceCache = false, occurenceId?: string | number, subPropertyResponseOccurence: string[] = []): Promise<R> {
    if (clearCache) {
      this.clearCache();
    }
    if (clearListsCache) {
      this.clearListsCache();
    }
    if (clearOccurenceCache && occurenceId) {
      this.clearOccurenceCache(occurenceId, subPropertyResponseOccurence);
    }
    return this.requestWithCache<R, B>(this.doCachedHttpRequest.bind(this)<R, B>, method, httpRequestParams, requestType);
  }

}
