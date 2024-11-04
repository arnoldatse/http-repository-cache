import DefaultHttpExceptionType from "../httpRequest/exception/DefaultHttpExceptionType";
import HttpMethod from "../httpRequest/HttpMethod";
import HttpRequestAdapter, { HttpRequestParams } from "../httpRequest/HttpRequestAdapter";
import ObjectUtils from "../utils/ObjectUtils";

export enum RequestType {
  LIST,
  OCCURRENCE
}

interface RequestSignature<B = void> {
  method: HttpMethod;
  body?: B;
  headers?: Record<string, string>;
}

type OccurrenceDataCacheSignature = Record<string, unknown>;
type DataCacheSignature = OccurrenceDataCacheSignature | OccurrenceDataCacheSignature[];

/**
 * Represents a cache entry for a repository.
 *
 * @template B - The type of the request body.
 * 
 * @property {number} lastFetch - The timestamp of the last fetch operation.
 * @property {RequestSignature<B>} signature - The signature of the request.
 * @property {RequestType} requestType - The type of the request.
 * @property {unknown} data - The cached data.
 */
interface Cache<B> {
  lastFetch: number;
  signature: RequestSignature<B>;
  requestType: RequestType;
  data: unknown;
}

type url = string;

/**
 * RepositoryCache class handle cache for http requests
 *
 * @template O type of request options
 */
export default class RepositoryCache<O = unknown> {
  private cache: Record<url, Cache<unknown>> = {};

  /**
   * Cache validity in seconds
   */
  private _cacheValidity: number;

  /**
   *
   * @param httpRequest  HttpRequestAdapter instance to make http requests
   * @param idKey The key to identify the occurrence in the response data
   * @param eternalCache True if cache never expire, false otherwise
   * @param cacheValidity Cache validity in seconds
   */
  constructor(private httpRequest: HttpRequestAdapter<O>, private idKey: string, private eternalCache = false, cacheValidity = 60) {
    this._cacheValidity = cacheValidity;
  }

  /**
   * Sets the HTTP request adapter for the repository cache.
   *
   * @param httpRequest - The HTTP request adapter to be used.
   */
  setHttpRequest(httpRequest: HttpRequestAdapter<O>) {
    this.httpRequest = httpRequest;
  }

  private createRequestSignature<B>(method: HttpMethod, httpRequestParams: HttpRequestParams<B, O>): RequestSignature<B> {
    const requestHeader = this.httpRequest.buildRequestHeader(httpRequestParams);
    return {
      method: method,
      ...(httpRequestParams.body && { body: httpRequestParams.body }),
      ...(Object.keys(requestHeader).length > 0 && { headers: requestHeader })
    }

  }

  private cacheResponse<R = unknown, B = void>(method: HttpMethod, httpRequestParams: HttpRequestParams<B, O>, requestType: RequestType, response: R) {
    this.cache[httpRequestParams.url] = {
      lastFetch: Date.now(),
      signature: this.createRequestSignature(method, httpRequestParams),
      requestType,
      data: response
    }
  }

  /**
   * Clears the entire cache by resetting it to an empty object.
   * This method should be used when you want to invalidate all cached data.
   */
  clearCache() {
    this.cache = {};
  }

  /**
   * Clears all cached entries in the repository cache that have a request type of `LIST`.
   * Iterates over the keys in the cache and deletes any entry where the request type is `LIST`.
   */
  clearListsCache() {
    Object.keys(this.cache).forEach(cacheKey => {
      if (this.cache[cacheKey]?.requestType === RequestType.LIST) {
        delete this.cache[cacheKey];
      }
    });
  }


  /**
   * Clears the occurrence cache for a specific ID.
   *
   * @param id - The ID of the occurrence to clear from the cache. Can be a string or a number.
   * @param subPropertyResponseOccurrence - An optional array of string sub-properties response occurrences to consider when clearing the cache.
   */
  clearOccurrenceCache(id: string | number, subPropertyResponseOccurrence?: string[]) {
    Object.keys(this.cache).map((cacheKey) => {
      const cache = this.cache[cacheKey];
      if (cache?.requestType === RequestType.OCCURRENCE) {
        const data = this.getOccurrenceFromResponse(cache.data, subPropertyResponseOccurrence ?? []);
        if (data[this.idKey] === id) {
          delete this.cache[cacheKey];
        }
      }
    })
  }

  /**
   * If response has sub properties, get the list from nested property that has data list in the response
   * @param response
   * @param subPropertyResponseList
   * @returns
   */
  private getListFromResponse(response: unknown, subPropertyResponseList?: string[]): DataCacheSignature {
    let list = response as Record<string, unknown> | OccurrenceDataCacheSignature[];
    if (subPropertyResponseList) {
      subPropertyResponseList.forEach((subProperty) => {
        if (!Array.isArray(list)) {
          list = list[subProperty] as Record<string, unknown> | OccurrenceDataCacheSignature[];
        }
      });
    }
    return list;
  }

  /**
   * If response has sub properties, get the occurrence from nested property that has data occurrence in the response
   * @param response
   * @param subPropertyResponseOccurrence
   * @returns
   */
  private getOccurrenceFromResponse(response: unknown, subPropertyResponseOccurrence: string[]): OccurrenceDataCacheSignature {
    let occurrence = response as Record<string, unknown> | OccurrenceDataCacheSignature;
    if (subPropertyResponseOccurrence) {
      subPropertyResponseOccurrence.forEach((subProperty) => {
        occurrence = occurrence[subProperty] as Record<string, unknown> | OccurrenceDataCacheSignature;
      });
    }
    return occurrence;
  }

  /**
   * Find an item in cache according to key and key value
   *
   * @template T Response type
   * @param key
   * @param value
   * @param subPropertyResponseList an array of strings to get from the request list response body the nested sub property where the list is
   * @param subPropertyResponseOccurrence an array of strings to get from the request occurrence response body the nested sub property where the occurrence is
   * @returns
   */
  private findInCache<T>(key: string, value: string | number, subPropertyResponseList?: string[], subPropertyResponseOccurrence?: string[]): T | null {
    this.removeAllExpiredCache();

    let data: T | null = null;

    Object.values(this.cache).some(cache => {
      let cacheData: DataCacheSignature;
      if (cache.requestType === RequestType.LIST) {
        cacheData = this.getListFromResponse(cache.data, subPropertyResponseList);
        if (Array.isArray(cacheData)) {
          return cacheData.find((item) => {
            if (item[key] === value) {
              data = item as T;
              return true;
            }
            return false;
          })
        }
      }
      if (cache.requestType === RequestType.OCCURRENCE) {
        cacheData = this.getOccurrenceFromResponse(cache.data, subPropertyResponseOccurrence!);
        if (cacheData[key] === value) {
          data = cacheData as T;
          return true;
        }
      }

      return false;
    })

    return data;
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
    const foundCache = this.cache[httpRequestParams.url];
    if (foundCache) {
      const currentRequestSignature: RequestSignature<B> = this.createRequestSignature(requestMethod, httpRequestParams);

      if (ObjectUtils.isObjectsEquals(foundCache.signature, currentRequestSignature)) {
        return foundCache.data;
      }
    }
    return null;
  }

  /**
   * Removes all expired cache entries from the cache storage.
   * If `eternalCache` is set to true, this method does nothing.
   * Otherwise, it iterates through all cache entries and deletes
   * those that are expired.
   *
   * @private
   */
  private removeAllExpiredCache() {
    if (!this.eternalCache) {
      Object.keys(this.cache).forEach((key) => {
        if (this.cache[key] && this.isCacheExpired(this.cache[key])) {
          delete this.cache[key];
        }
      });
    }
  }

  /**
   * Getting request from cache if available. If not, request parameter are called to make the request
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
    const data = this.getRequestCache<B>(method, httpRequestParams);
    if (data) {
      return Promise.resolve(data as R);
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
    return this.requestWithCache<R, B>(this.doCachedHttpRequest.bind(this)<R, B>, method, httpRequestParams, RequestType.OCCURRENCE);
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
   * @param subPropertyResponseOccurrence an array of strings to get from the body of occurrence type request response the nested sub property where the occurrence is
   * @returns
   */
  findByKey<T>(key: string, value: string | number, subPropertyResponseList?: string[], subPropertyResponseOccurrence?: string[]): Promise<T> {
    const data = this.findInCache<T>(key, value, subPropertyResponseList, subPropertyResponseOccurrence);
    if (data) {
      return Promise.resolve(data);
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
   * @param subPropertyResponseOccurrence an array of strings to get from the body of occurrence type request response the nested sub property where the occurrence is
   * @returns
   */
  findByKeyOrRequestGetList<R, B = void>(key: string, value: string | number, method: HttpMethod, httpRequestParams: HttpRequestParams<B, O>, subPropertyResponseList?: string[], subPropertyResponseOccurrence?: string[]): Promise<R> {
    return this.findByKey<R>(key, value, subPropertyResponseList, subPropertyResponseOccurrence).catch(async () => {
      await this.getList<R, B>(method, httpRequestParams);
      return this.findByKey(key, value, subPropertyResponseList, subPropertyResponseOccurrence);
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
   * @param subPropertyResponseOccurrence an array of strings to get from the body of occurrence type request response the nested sub property where the occurrence is
   * @returns
   */
  findByKeyOrRequestGet<R, B = void>(key: string, value: string | number, method: HttpMethod, httpRequestParams: HttpRequestParams<B, O>, subPropertyResponseList?: string[], subPropertyResponseOccurrence?: string[]): Promise<R> {
    return this.findByKey<R>(key, value, subPropertyResponseList, subPropertyResponseOccurrence).catch(() => {
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
   * @param subPropertyResponseOccurrence an array of strings to get from the body of occurrence type request response the nested sub property where the occurrence is
   * @returns
   */
  findByKeyOrRequest<R, B = void>(key: string, value: string | number, method: HttpMethod, httpRequestParams: HttpRequestParams<B, O>, requestType: RequestType, subPropertyResponseList?: string[], subPropertyResponseOccurrence?: string[]): Promise<R> {
    return this.findByKey<R>(key, value, subPropertyResponseList, subPropertyResponseOccurrence).catch(() => {
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
   * @param subPropertyResponseOccurrence an array of strings to get from the body of occurrence type request response the nested sub property where the occurrence is
   * @returns
   */
  find<T>(id: string | number, subPropertyResponseList?: string[], subPropertyResponseOccurrence?: string[]): Promise<T> {
    return this.findByKey<T>(this.idKey, id, subPropertyResponseList, subPropertyResponseOccurrence);
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
   * @param subPropertyResponseOccurrence an array of strings to get from the body of occurrence type request response the nested sub property where the occurrence is
   * @returns
   */
  findOrRequestGetList<R, B = void>(id: string | number, method: HttpMethod, httpRequestParams: HttpRequestParams<B, O>, subPropertyResponseList?: string[], subPropertyResponseOccurrence?: string[]): Promise<R> {
    return this.findByKeyOrRequestGetList<R, B>(this.idKey, id, method, httpRequestParams, subPropertyResponseList, subPropertyResponseOccurrence);
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
   * @param subPropertyResponseOccurrence an array of strings to get from the body of occurrence type request response the nested sub property where the occurrence is
   * @returns
   */
  findOrRequestGet<R, B = void>(id: string | number, method: HttpMethod, httpRequestParams: HttpRequestParams<B, O>, subPropertyResponseList?: string[], subPropertyResponseOccurrence?: string[]): Promise<R> {
    return this.findByKeyOrRequestGet<R, B>(this.idKey, id, method, httpRequestParams, subPropertyResponseList, subPropertyResponseOccurrence);
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
   * Request to update an item and clear lists cache and specific occurrence cache
   *
   * @template R Response type
   * @template B request body type
   * @param id
   * @param method
   * @param httpRequestParams
   * @param subPropertyResponseOccurrence an array of strings to get from the body of occurrence type request response the nested sub property where the occurrence is
   * @returns
   */
  update<R, B = void>(id: string | number, method: HttpMethod, httpRequestParams: HttpRequestParams<B, O>, subPropertyResponseOccurrence: string[] = []): Promise<R> {
    this.clearOccurrenceCache(id, subPropertyResponseOccurrence);
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
   * @param clearOccurrenceCache
   * @param occurrenceId
   * @returns
   */
  request<R, B = void>(method: HttpMethod, httpRequestParams: HttpRequestParams<B, O>, clearCache = false, clearListsCache = false, clearOccurrenceCache = false, occurrenceId?: string | number, subPropertyResponseOccurrence: string[] = []): Promise<R> {
    return this.doHttpRequest<R, B>(method, httpRequestParams).then((response) => {
      if (clearCache) {
        this.clearCache();
      }
      if (clearListsCache) {
        this.clearListsCache();
      }
      if (clearOccurrenceCache && occurrenceId) {
        this.clearOccurrenceCache(occurrenceId, subPropertyResponseOccurrence);
      }

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
   * @param clearOccurrenceCache
   * @param occurrenceId
   * @returns
   */
  requestCached<R, B = void>(method: HttpMethod, httpRequestParams: HttpRequestParams<B, O>, requestType: RequestType, clearCache = false, clearListsCache = false, clearOccurrenceCache = false, occurrenceId?: string | number, subPropertyResponseOccurrence: string[] = []): Promise<R> {
    return this.requestWithCache<R, B>(this.doCachedHttpRequest.bind(this)<R, B>, method, httpRequestParams, requestType).then((response) => {
      if (clearCache) {
        this.clearCache();
      }
      if (clearListsCache) {
        this.clearListsCache();
      }
      if (clearOccurrenceCache && occurrenceId) {
        this.clearOccurrenceCache(occurrenceId, subPropertyResponseOccurrence);
      }

      return response;
    });
  }

}
