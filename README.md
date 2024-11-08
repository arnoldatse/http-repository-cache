- [Motivation](#motivation)
- [Features](#features)
- [Installation](#installation)
- [Usage Principles](#usage-principles)
- [Common Usage](#common-usage)
  - [FetchHttpRequest](#fetchhttprequest)
    - [Requests with authentication TOKEN](#requests-with-authentication-token)
    - [Include credentials](#include-credentials)
    - [Header Content-Type: application/json](#header-content-type-applicationjson)
    - [Request custom headers](#request-custom-headers)
    - [Request custom success status codes](#request-custom-success-status-codes)
    - [FetchRequestOptions](#fetchrequestoptions)
    - [Custom error status handling](custom-error-status-handling)
  - [RepositoryCache](#RepositoryCache)
    - [RepositoryCache Constructor](#RepositoryCache-Constructor)
    - [When complete objects in lists](#when-complete-objects-in-lists)
    - [When partial objects in lists](#when-partial-objects-in-lists)
    - [With specific requests actions](#With-specific-requests-actions)
    - [With data in responses sub properties](#With-data-in-responses-sub-properties)
    - [Custom expiration time](#custom-expiration-time)
    - [Eternal cache](#eternal-cache)
      - [Eternal cache when complete objects in list](#eternal-cache-when-complete-objects-in-list)
      - [Eternal cache when partial objects in list](#eternal-cache-when-partial-objects-in-list)
    - [Manually clear cache](#manually-clear-cache)
      - [Clear all cache](#Clear-all-cache)
      - [clear only lists cache](#clear-only-lists-cache)
      - [clear only occurrence cache](#clear-only-occurrence-cache)
  - [Exception handling](#exception-handling)
- [Create custom Http Request class](#create-custom-http-request-class)
- [API](#api)
  - [HttpMethod](#httpmethod-api)
  - [HttpRequestParams](#httprequestparams)
  - [FetchHttpRequest](#fetchhttprequest-api)
    - [setAuthToken(authToken: `string`): `void`](#setauthtoken)
    - [removeAuthToken(): `void`](#removeauthtoken)
    - [includeCredentials(): `void`](#includecredentials)
    - [notIncludeCredentials(): `void`](#notIncludecredentials)
    - [setCustomErrorStatusHandling(customErrorStatusHandling: (status: `number`, body?: `unknown`) => `void` | `HttpException<T>`): `void`](#setCustomErrorStatusHandling)
    - [unsetCustomErrorStatusHandling(): `void`](#unsetCustomErrorStatusHandling)
    - [buildRequestHeader(httpRequestParams: `HttpRequestParams<unknown, FetchRequestOptions>`): `void`](#buildRequestHeader)
    - [get`<R>`(httpRequestParams:` HttpRequestParams<never, FetchRequestOptions>`): `Promise<R>`](#fetchHttpRequest-get)
    - [post`<R, B = unknown>`(httpRequestParams: `HttpRequestParams<B, FetchRequestOptions>`): `Promise<R`>](#fetchHttpRequest-post)
    - [patch`<R, B = unknown>`(httpRequestParams: `HttpRequestParams<B, FetchRequestOptions>`): `Promise<R`>](#fetchHttpRequest-patch)
    - [put`<R, B = unknown>`(httpRequestParams: `HttpRequestParams<B, FetchRequestOptions>`): `Promise<R`>](#fetchHttpRequest-put)
    - [delete`<R>`(httpRequestParams:` HttpRequestParams<never, FetchRequestOptions>`): `Promise<R>`](#fetchHttpRequest-delete)
  - [RepositoryCache](#repositorycache-api)
    - [constructor(httpRequest: `HttpRequestAdapter<O>`, idKey: `string`, eternalCache: `boolean`, cacheValidity: `number`)](#RepositoryCache-constructor)
    - [setHttpRequest(httpRequest: `HttpRequestAdapter<O>`): `void`](#setHttpRequest)
    - [clearCache(): `void`](#clearCache)
    - [clearListsCache(): `void`](#clearListsCache)
    - [clearOccurrenceCache(id: `string | number`, subPropertyResponseOccurrence?: `string[]`): `void`](#clearOccurrenceCache)
    - [getList`<R, B = void>`(method: `HttpMethod`, httpRequestParams: `HttpRequestParams<B, O>`): `Promise<R>`](#getList)
    - [get`<R, B = void>`(method: `HttpMethod`, httpRequestParams: `HttpRequestParams<B, O>`): `Promise<R>`](#get)
    - [findByKey`<T>`(key: `string`, value: `string | number`, subPropertyResponseList?: `string[]`, subPropertyResponseOccurrence?: `string[]`): `Promise<T>`](#findByKey)
    - [findByKeyOrRequestGetList`<R, B = void>`(key: `string`, value: `string | number`, method: `HttpMethod`, httpRequestParams: `HttpRequestParams<B, O>`, subPropertyResponseList?: `string[]`, subPropertyResponseOccurrence?: `string[]`): `Promise<R>`](#findByKeyOrRequestGetList)
    - [findByKeyOrRequestGet`<R, B = void>`(key: string, value: `string | number`, method: `HttpMethod`, httpRequestParams: `HttpRequestParams<B, O>`, subPropertyResponseList?: `string[]`, subPropertyResponseOccurrence?: `string[]`): `Promise<R>`](#findByKeyOrRequestGet)
    - [<T>(id: `string | number`, subPropertyResponseList?: `string[]`, subPropertyResponseOccurrence?: `string[]`): `Promise<T>`](#find)
    - [findOrRequestGetList`<R, B = void>`(id: `string | number`, method: `HttpMethod`, httpRequestParams: `HttpRequestParams<B, O>`, subPropertyResponseList?: `string[]`, subPropertyResponseOccurrence?: `string[]`): `Promise<R>`](#findOrRequestGetList)
    - [findOrRequestGet`<R, B = void>`(id: `string | number`, method: `HttpMethod`, httpRequestParams: `HttpRequestParams<B, O>`, subPropertyResponseList?: `string[]`, subPropertyResponseOccurrence?: `string[]`): `Promise<R`>](#findOrRequestGet)
    - [create`<R, B = void>`(method: `HttpMethod`, httpRequestParams: `HttpRequestParams<B, O>`): `Promise<R>`](#create)
    - [ update`<R, B = void>`(id: `string | number`, method: `HttpMethod`, httpRequestParams: `HttpRequestParams<B, O>`, subPropertyResponseOccurrence: `string[]`): `Promise<R`>](#update)

# **Motivation**

In frontend applications, developers often bind HTTP requests directly to their components. This approach can lead to significant issues when there are API updates or incompatibilities, especially if the frontend is developed before the backend API is ready. Such backend constraints can deeply impact the application's functionality and necessitate updates. To mitigate this, a layered development approach is recommended, focusing on the data source layer.

In a frontend application, the backend or API is considered a data source from which information is read and written. To define this layer in our frontend applications, the Repository pattern, commonly used in backend architecture, has proven effective over time.

Although repositories are an excellent approach to separate data source interaction from application behavior, writing all repository methods like `getList()`, `getById()`, `create()`, `update()`, `delete()`, etc., can quickly become tedious and repetitive. In frontend development, these methods often need to handle repetitive actions such as configuring authorization, including credentials, handling request cancellations, and more. To address these issues, developers might write a complex, preconfigured HTTP request class for each new project to perform all these configurations for repository requests.

Another challenge with handling HTTP requests is the lack of intuitiveness in dealing with failed requests using common tools like Fetch API or Axios. These tools typically reject an error when the server can't be reached but resolve the error response when the server encounters an error.

This is where the **`http-repository-cache`** library comes in. This library allows you to perform HTTP requests from your repositories without repeatedly writing complex HTTP request configurations or manually creating a large, complex class with preconfigured HTTP request tools. All you need to do is define a unique instance of the built-in `HttpRequest` class and instantiate the [RepositoryCache](#repositorycache-api) class with this instance in your repositories. This setup enables you to perform requests and enjoy cached requests with simplicity.

# **Features**

- **Authorization Handling**: Easily configure authorization for requests using Bearer TOKEN or include credentials.
- **Intuitive Requests Error Handling**: Intuitive error handling for failed requests with simple HttpException interface.
- **Custom Error Status Handling**: Define your own custom error status handling logic to handle specific http failed status code not handled by the library.
- **Caching System**: Enjoy built-in caching for HTTP requests to improve performance and reduce redundant network calls.

# Installation

Installation
You can install the http-repository-cache library using npm, yarn, or pnpm. Choose your preferred package manager from the options below:

Using npm

```
npm install http-repository-cache
```

Using yarn

```
yarn add http-repository-cache
```

Using pnpm

```
pnpm add http-repository-cache
```

# **Usage Principles**

It's important to know that you should only have a single instance of the `HttpRequest` class (here, the [FetchHttpRequest](#fetchhttprequest-api)) to maintain a consistent configuration for all [RepositoryCache](#repositorycache-api) instances that will use it. Additionally, you should have only one instance of each repository class that contains a [RepositoryCache](#repositorycache-api) instance. This ensures that each part of your application using these repositories can benefit from the caching system.

# **Common Usage**

## **FetchHttpRequest**

### **Requests With Authentication TOKEN**

To ensure that all requests include the Authorization header with the Bearer token, call the [setAuthToken(authToken: string)](#setauthtoken) method on the unique instance of the [FetchHttpRequest](#fetchhttprequest-api). For example, you can do this when the user signs in and the backend returns the user's token. Conversely, to remove the token and make requests without the Authorization header, call the [removeAuthToken()](#removeauthtoken) method on the same instance of [FetchHttpRequest](#fetchhttprequest-api), such as when the user logs out.

**Example: Setting the Authorization Token on Sign-In**

```typescript
const fetchHttpRequest = new FetchHttpRequest();

// Simulate user sign-in and receiving a token from the backend
const userToken = "user-auth-token";
fetchHttpRequest.setAuthToken(userToken);

// Now all requests will include the Authorization header with the Bearer token
fetchHttpRequest.get({ url: "http://example.com/api/data" });
```

**Example: Removing the Authorization Token on Logout**

```typescript
const fetchHttpRequest = new FetchHttpRequest();

// Simulate user logout
fetchHttpRequest.removeAuthToken();

// Now requests will be made without the Authorization header
fetchHttpRequest.get({ url: "http://example.com/api/data" });
```

### **Include credentials**

Including credentials in your HTTP requests can be important for scenarios where you need to send cookies, authorization headers, or TLS client certificates along with your requests. This is often necessary for authentication and maintaining sessions.

By default, credentials are not included in your requests. To include credentials in your requests using the [FetchHttpRequest](#fetchhttprequest-api) class, you can use the [includeCredentials()](#includecredentials) method. Conversely, if you want to exclude credentials from your requests, you can use the [notIncludeCredentials()](#notIncludecredentials) method.

**Example: Including Credentials**

```typescript
const fetchHttpRequest = new FetchHttpRequest();

// Enable credentials inclusion
fetchHttpRequest.includeCredentials();

// Now all requests will include credentials such as cookies or authorization headers
fetchHttpRequest.get({ url: "http://example.com/api/data" });
```

**Example: Excluding Credentials**

```typescript
const fetchHttpRequest = new FetchHttpRequest();

// Disable credentials inclusion
fetchHttpRequest.notIncludeCredentials();

// Now requests will be made without including credentials
fetchHttpRequest.get({ url: "http://example.com/api/data" });
```

By using these methods, you can easily control whether credentials are included in your HTTP requests, ensuring that your requests are configured correctly based on your application's needs.

### **Header Content-Type: application/json**

The `Content-Type: application/json` header indicates that the body of the HTTP request is in JSON format. This header is important when sending data to the server, as it informs the server about the format of the data being sent.

By default, the [FetchHttpRequest](#fetchhttprequest-api) class includes the `Content-Type: application/json` header in requests that have a body. However, you can control whether this header is included or not using the contentTypeJSON property in the [httpRequestParams](#httprequestparams) object.

**Example: Including the Content-Type Header**

```typescript
const fetchHttpRequest = new FetchHttpRequest();
const body = { lastName: "Doe", firstName: "John" };

// Perform a POST request with the Content-Type: application/json header
fetchHttpRequest.post({
  url: "http://example.com/api/data",
  body,
  contentTypeJSON: true, // This is the default behavior
});

//or

// Perform a POST request with the Content-Type: application/json header
fetchHttpRequest.post({
  url: "http://example.com/api/data",
  body,
});
```

**Example: Excluding the Content-Type Header**

```typescript
const fetchHttpRequest = new FetchHttpRequest();
const body = { lastName: "Doe", firstName: "John" };

// Perform a POST request without the Content-Type: application/json header
fetchHttpRequest.post({
  url: "http://example.com/api/data",
  body,
  contentTypeJSON: false,
});
```

### **Request custom headers**

Custom headers allow you to include additional information in your HTTP requests, such as custom authentication tokens, user-agent strings, or any other metadata required by your server.

You can define custom headers for each request using the [httpRequestParams](#httprequestparams) object. This can be done for any request method (GET, POST, PATCH, PUT, DELETE) by specifying the headers property in the [httpRequestParams](#httprequestparams).

**Example: Custom Headers with PUT Request**

```typescript
const fetchHttpRequest = new FetchHttpRequest();
const body = { lastName: "Doe", firstName: "John" };

const customHeaders = {
  "user-agent": "CustomUserAgent",
  "x-custom-header": "CustomHeaderValue",
};

// Perform a PUT request with custom headers
fetchHttpRequest.put({
  url: "http://example.com/api/data",
  body,
  headers: customHeaders,
});
```

By specifying the headers property in the httpRequestParams, you can easily include custom headers in your HTTP requests, ensuring that your requests are configured correctly based on your application's needs.

### **Request custom success status codes**

Custom success status codes allow you to define additional HTTP status codes that should be considered successful responses. By default, the [FetchHttpRequest](#fetchhttprequest-api) class considers the following status codes as successful:

- 200 (OK)
- 201 (Created)
- 204 (No Content)

However, there may be scenarios where your application needs to treat other status codes as successful. You can define custom success status codes for each request using the `successStatusCodes` property in the `httpRequestParams` object.

**How [FetchHttpRequest](#fetchhttprequest-api) Handles Success Requests**

The [FetchHttpRequest](#fetchhttprequest-api) class processes the response of an HTTP request and checks the status code. If the status code is one of the default success status codes or one of the custom success status codes provided, the response is considered successful, and the response body is returned. Otherwise, an exception is thrown.

**Example: Custom Success Status Codes with POST Request**

```typescript
const fetchHttpRequest = new FetchHttpRequest();
const body = { lastName: 'Doe', firstName: 'John' };

const customSuccessStatusCodes = [207]; // 207 (Multi-Status)

// Perform a POST request with custom success status codes
fetchHttpRequest.post({
  url: "http://example.com/api/data",
  body,
  successStatusCodes: customSuccessStatusCodes
}).then(response => {
  console.log("Request was successful:", response);
}).catch(error => {
  console.error("Request failed:", error);
});
```
By specifying the `successStatusCodes` property in the [httpRequestParams](#httprequestparams), you can easily define custom success status codes for your HTTP requests, ensuring that your requests are handled correctly based on your application's needs.

### **FetchRequestOptions**

`FetchRequestOptions` are additional options used by the Fetch API when performing requests. These options allow you to customize various aspects of the request, such as the mode, redirect, credentials, and more.

You can define these options in your requests by passing them as part of the [httpRequestParams](#httprequestparams) object. Below are an explicit example of how to use `FetchRequestOptions` in your requests.

**Example: Using FetchRequestOptions**

```typescript
const fetchHttpRequest = new FetchHttpRequest();

// Define custom fetch request options
const requestOptions: FetchRequestOptions = {
  mode: "cors",
  cache: "no-cache",
  redirect: "follow",
  referrerPolicy: "no-referrer",
};

// Perform a GET request with custom fetch request options
fetchHttpRequest.get({
  url: "http://example.com/api/data",
  options: requestOptions,
});
```

### **Custom error status handling**

The [FetchHttpRequest](#fetchhttprequest-api) class provides a method [setCustomErrorStatusHandling(customErrorStatusHandling: (status: `number`, body?: `unknown`) => `void` | `HttpException<T>`): `void`](#setCustomErrorStatusHandling) to set a custom error status handling function. This function allows you to override the default handling of HTTP status code errors or handle custom status codes that are not natively handled.

**How Exceptions are Handled**

By default, [FetchHttpRequest](#fetchhttprequest-api) handles several common HTTP status code errors by throwing an `HttpException` with a specific type. The default exceptions are handled as follows:

| Status Code | Exception Type                              |
| ----------- | ------------------------------------------- |
| 400         | DefaultHttpExceptionType.BAD_REQUEST        |
| 401         | DefaultHttpExceptionType.UNAUTHORIZED       |
| 402         | DefaultHttpExceptionType.PAYMENT_REQUIRED   |
| 403         | DefaultHttpExceptionType.FORBIDDEN          |
| 404         | DefaultHttpExceptionType.NOT_FOUND          |
| 409         | DefaultHttpExceptionType.CONFLICT           |
| 500         | DefaultHttpExceptionType.SERVER_ERROR       |
| 503         | DefaultHttpExceptionType.SERVER_UNAVAILABLE |
| 503         | DefaultHttpExceptionType.UNKNOWN_ERROR      |

**Using Custom Error Status Handling**

You can use the [setCustomErrorStatusHandling(customErrorStatusHandling: (status: `number`, body?: `unknown`) => `void` | `HttpException<T>`): `void`](#setCustomErrorStatusHandling) method to provide a custom function that takes an HTTP status code and an optional response body. This function can either perform some side effects and return void, or it can return an instance of HttpException.

**Example: Overriding Handled Status Code Error**

```typescript
const fetchHttpRequest = new FetchHttpRequest();

// Custom error handling for status code 404
fetchHttpRequest.setCustomErrorStatusHandling((status, body) => {
  if (status === 404) {
    return {
      type: "CUSTOM_NOT_FOUND_ERROR",
      body,
    };
  }
});

// Perform a GET request
fetchHttpRequest.get({ url: "http://example.com/api/data" }).catch((error) => {
  console.error(error); // Will log the custom error for status 404
});
```

**Example: Handling Custom Status Code Error**

```typescript
const fetchHttpRequest = new FetchHttpRequest();

// Custom error handling for status code 418
fetchHttpRequest.setCustomErrorStatusHandling((status, body) => {
  if (status === 418) {
    return {
      type: "I_AM_A_TEAPOT",
      body,
    };
  }
});

// Perform a GET request
fetchHttpRequest.get({ url: "http://example.com/api/data" }).catch((error) => {
  console.error(error); // Will log the custom error for status 418
});
```

By using the [setCustomErrorStatusHandling(customErrorStatusHandling: (status: `number`, body?: `unknown`) => `void` | `HttpException<T>`): `void`](#setCustomErrorStatusHandling) method, you can tailor the error handling behavior of FetchHttpRequest to suit the specific needs of your application.
