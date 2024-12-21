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
    - [Custom error status handling](#custom-error-status-handling)
  - [RepositoryCache](#repositorycache)
    - [RepositoryCache Constructor](#repositorycache-constructor)
    - [When complete objects in lists](#when-complete-objects-in-lists)
    - [When partial objects in lists](#when-partial-objects-in-lists)
    - [With data in responses sub properties](#with-data-in-responses-sub-properties)
    - [Other requests actions](#other-requests-actions)
    - [Custom expiration time](#custom-expiration-time)
    - [Manually clear cache](#manually-clear-cache)
  - [Exception handling](#exception-handling)
- [Create custom Http Request class](#create-custom-http-request-class)

- [Report Bug](#report-bug)
- [Contribute](#contribute)
- [Creator](#creator)
- [LICENCE](#licence)

# **Motivation**

In frontend applications, developers often bind HTTP requests directly to their components. This approach can lead to significant issues when there are API updates or incompatibilities, especially if the frontend is developed before the backend API is ready. Such backend constraints can deeply impact the application's functionality and necessitate updates. To mitigate this, a layered development approach is recommended, focusing on the data source layer.

In a frontend application, the backend or API is considered a data source from which information is read and written. To define this layer in our frontend applications, the Repository pattern, commonly used in backend architecture, has proven effective over time.

Although repositories are an excellent approach to separate data source interaction from application behavior, writing all repository methods like `getList()`, `getById()`, `create()`, `update()`, `delete()`, etc., can quickly become tedious and repetitive. In frontend development, these methods often need to handle repetitive actions such as configuring authorization, including credentials, handling request cancellations, and more. To address these issues, developers might write a complex, preconfigured HTTP request class for each new project to perform all these configurations for repository requests.

Another challenge with handling HTTP requests is the lack of intuitiveness in dealing with failed requests using common tools like Fetch API or Axios. These tools typically reject an error when the server can't be reached but resolve the error response when the server encounters an error.

This is where the **`http-repository-cache`** library comes in. This library allows you to perform HTTP requests from your repositories without repeatedly writing complex HTTP request configurations or manually creating a large, complex class with preconfigured HTTP request tools. All you need to do is define a unique instance of the built-in `HttpRequest` class and instantiate the [RepositoryCache](#repositorycache) class with this instance in your repositories. This setup enables you to perform requests and enjoy cached requests with simplicity.

# **Features**

- **Authorization Handling**: Easily configure authorization for requests using Bearer TOKEN or include credentials.
- **Intuitive Requests Error Handling**: Intuitive error handling for failed requests with simple `HttpException` interface.
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

It's important to know that you should only have a single instance of the `HttpRequest` class (here, the [FetchHttpRequest](#fetchhttprequest)) to maintain a consistent configuration for all [RepositoryCache](#repositorycache) instances that will use it. Additionally, you should have only one instance of each repository class that contains a [RepositoryCache](#repositorycache) instance. This ensures that each part of your application using these repositories can benefit from the caching system.

# **Common Usage**

## **FetchHttpRequest**

### **Requests With Authentication TOKEN**

To ensure that all requests include the Authorization header with the Bearer token, call the `setAuthToken(authToken: string)` method on the unique instance of the [FetchHttpRequest](#fetchhttprequest). For example, you can do this when the user signs in and the backend returns the user's token. Conversely, to remove the token and make requests without the Authorization header, call the `removeAuthToken()` method on the same instance of [FetchHttpRequest](#fetchhttprequest), such as when the user logs out.

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

By default, credentials are not included in your requests. To include credentials in your requests using the [FetchHttpRequest](#fetchhttprequest) class, you can use the `includeCredentials()` method. Conversely, if you want to exclude credentials from your requests, you can use the `notIncludeCredentials()` method.

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

By default, the [FetchHttpRequest](#fetchhttprequest) class includes the `Content-Type: application/json` header in requests that have a body. However, you can control whether this header is included or not using the `contentTypeJSON` property in the `httpRequestParams` object. Also when you define `contentTypeJSON` to `false` the body of the request is no more stringified before sent, this is useful when you try to send a `FormData` as a body for instance.

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
const body = new FormData();
body.append("lastName", "Doe");
body.append("firstName", "John");

// Perform a POST request without the Content-Type: application/json header
fetchHttpRequest.post({
  url: "http://example.com/api/data",
  body,
  contentTypeJSON: false,
});
```

### **Request custom headers**

Custom headers allow you to include additional information in your HTTP requests, such as custom authentication tokens, user-agent strings, or any other metadata required by your server.

You can define custom headers for each request using the `httpRequestParams` object. This can be done for any request method (GET, POST, PATCH, PUT, DELETE) by specifying the headers property in the `httpRequestParams`.

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

Custom success status codes allow you to define additional HTTP status codes that should be considered successful responses. By default, the [FetchHttpRequest](#fetchhttprequest) class considers the following status codes as successful:

- 200 (OK)
- 201 (Created)
- 204 (No Content)

However, there may be scenarios where your application needs to treat other status codes as successful. You can define custom success status codes for each request using the `successStatusCodes` property in the `httpRequestParams` object.

**How [FetchHttpRequest](#fetchhttprequest) Handles Success Requests**

The [FetchHttpRequest](#fetchhttprequest) class processes the response of an HTTP request and checks the status code. If the status code is one of the default success status codes or one of the custom success status codes provided, the response is considered successful, and the response body is returned. Otherwise, an exception is thrown.

**Example: Custom Success Status Codes with POST Request**

```typescript
const fetchHttpRequest = new FetchHttpRequest();
const body = { lastName: "Doe", firstName: "John" };

const customSuccessStatusCodes = [207]; // 207 (Multi-Status)

// Perform a POST request with custom success status codes
fetchHttpRequest
  .post({
    url: "http://example.com/api/data",
    body,
    successStatusCodes: customSuccessStatusCodes,
  })
  .then((response) => {
    console.log("Request was successful:", response);
  })
  .catch((error) => {
    console.error("Request failed:", error);
  });
```

By specifying the `successStatusCodes` property in the `httpRequestParams`, you can easily define custom success status codes for your HTTP requests, ensuring that your requests are handled correctly based on your application's needs.

### **FetchRequestOptions**

`FetchRequestOptions` are additional options used by the Fetch API when performing requests. These options allow you to customize various aspects of the request, such as the mode, redirect, credentials, and more.

You can define these options in your requests by passing them as part of the `httpRequestParams` object. Below are an explicit example of how to use `FetchRequestOptions` in your requests.

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

The [FetchHttpRequest](#fetchhttprequest) class provides a method `setCustomErrorStatusHandling(customErrorStatusHandling: (status: number, body?: unknown) => void | HttpException<T>): void` to set a custom error status handling function. This function allows you to override the default handling of HTTP status code errors or handle custom status codes that are not natively handled.

**How Exceptions are Handled**

By default, [FetchHttpRequest](#fetchhttprequest) handles several common HTTP status code errors by throwing an `HttpException` with a specific type. The default exceptions are handled as follows:

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
| Other       | DefaultHttpExceptionType.UNKNOWN_ERROR      |

**Using Custom Error Status Handling**

You can use the `setCustomErrorStatusHandling(customErrorStatusHandling: (status: number, body?: unknown) => void | HttpException<T>): void` method to provide a custom function that takes an HTTP status code and an optional response body. This function can either perform some side effects and return void, or it can return an instance of HttpException.

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

By using the `setCustomErrorStatusHandling(customErrorStatusHandling: (status: number, body?: unknown) => void | HttpException<T>): void` method, you can tailor the error handling behavior of FetchHttpRequest to suit the specific needs of your application.

## **RepositoryCache**

After configuring the main instance of `HttpRequest`, the [RepositoryCache](#repositorycache) class is the primary class used to perform requests from repositories. It provides various methods to leverage caching, ensuring efficient and optimized data retrieval.

Behind the scenes, the [RepositoryCache](#repositorycache) class uses the provided `HttpRequest` implementation, such as [FetchHttpRequest](<(#fetchhttprequest-api)>), to perform requests. Therefore, to perform a request via [RepositoryCache](#repositorycache), you need to provide the `HttpMethod` to use and the `HttpRequestParams`.

### **Example: Performing Requests with RepositoryCache**

The following example demonstrates how to perform requests using the [RepositoryCache](#repositorycache) class. This example includes creating a repository class that uses [RepositoryCache](#repositorycache) to handle HTTP requests and caching.

```typescript
import {
  FetchHttpRequest,
  HttpMethod,
  RepositoryCache,
} from "http-repository-cache";

this.fetchHttpRequest = new FetchHttpRequest();
this.repositoryCache = new RepositoryCache(this.fetchHttpRequest, "id");

this.repositoryCache.findOrRequestGet(id, HttpMethod.GET, {
  url: `http://example.com/api/items/${id}`,
});
```

### **RepositoryCache Constructor**

The [RepositoryCache](#repositorycache) constructor initializes with the provided `HttpRequestAdapter` instance, an ID key, and optional parameters for eternal cache and cache validity in seconds.

```typescript
const fetchHttpRequest = new FetchHttpRequest();

// Creates a new instance of RepositoryCache with eternal caching (Cache never expire).
const repositoryCacheEternal = new RepositoryCache(
  fetchHttpRequest,
  "id",
  true
);

// Creates a new instance of RepositoryCache with expiration time (Each cached request has a lifetime of 120s).
const repositoryCacheWithExpiration = new RepositoryCache(
  fetchHttpRequest,
  "id",
  false,
  120
);
```

### **When complete objects in lists**

When the complete model objects are provided in list request responses, you don't need to call the individual get request directly to retrieve the complete model object, for example, to show its details. You can leverage the built-in cache system to find the item in the cached list response. If the item is not found because the list request has not been called yet, or the same item request has not been made, the request will be performed, the response will be cached for subsequent requests, and the response will be resolved.

You can achieve this by using the `findByKeyOrRequestGet()` or `findOrRequestGet()` methods of the [RepositoryCache](#repositorycache) class.

- use `findByKeyOrRequestGet()` when we are looking then item by another property than the id property provided in the [RepositoryCache](#repositorycache) constructor.
- use `findOrRequestGet()` when we are looking for the item by the id property provided in the [RepositoryCache](#repositorycache) constructor.

```typescript
import {
  FetchHttpRequest,
  HttpMethod,
  RepositoryCache,
} from "http-repository-cache";

class ItemRepository {
  private fetchHttpRequest: FetchHttpRequest;
  private repositoryCache: RepositoryCache;

  constructor() {
    this.fetchHttpRequest = new FetchHttpRequest();
    this.repositoryCache = new RepositoryCache(this.fetchHttpRequest, "id");
  }

  getList() {
    return this.repositoryCache.getList(HttpMethod.GET, {
      url: "http://example.com/api/items",
    });
  }

  getById(id: string | number) {
    return this.repositoryCache.findOrRequestGet(id, HttpMethod.GET, {
      url: `http://example.com/api/items/${id}`,
    });
  }

  getByName(name: string) {
    return this.repositoryCache.findByKeyOrRequestGet(
      "name",
      name,
      HttpMethod.GET,
      {
        url: `http://example.com/api/items/${id}`,
      }
    );
  }

  ...
}
```

If the API does not provide endpoints to get item details directly, and you need to use items from the list request response, you can use the `findByKeyOrRequestGetList()` or `findOrRequestGetList()` methods. These methods allow you to find items directly in the response list caches or perform a list request and retrieve the desired item from it.

- use `findByKeyOrRequestGetList()` when we are looking the item by another property than the id property provided in the RepositoryCache constructor.
- use `findOrRequestGetList()` when we are looking for the item by the id property provided in the [RepositoryCache](#repositorycache) constructor.

**Example**

Suppose you have an API that provides a list of users but does not have an endpoint to get details of a specific user. You can use the `findByKeyOrRequestGetList()` method to find a user by their `name` from the cached list or perform a list request if the cache is not available.

```typescript
import {
  FetchHttpRequest,
  HttpMethod,
  RepositoryCache,
} from "http-repository-cache";

class UserRepository {
  private fetchHttpRequest: FetchHttpRequest;
  private repositoryCache: RepositoryCache;

  constructor() {
    this.fetchHttpRequest = new FetchHttpRequest();
    this.repositoryCache = new RepositoryCache(this.fetchHttpRequest, "id");
  }

  getList() {
    return this.repositoryCache.getList(HttpMethod.GET, {
      url: "http://example.com/api/users",
    });
  }

  getById(id: string | number) {
    // Use findByKeyOrRequestGetList to find the user by id
    return this.repositoryCache.findOrRequestGetList(id, HttpMethod.GET, {
      url: "http://example.com/api/users",
    });
  }

  getByName(name: string) {
    // Use findByKeyOrRequestGetList to find the user by name
    return this.repositoryCache.findByKeyOrRequestGetList(
      "name",
      name,
      HttpMethod.GET,
      {
        url: "http://example.com/api/items/users",
      }
    );
  }

  ...
}
```

In this example, the `findOrRequestGetList` and `findByKeyOrRequestGetList` methods will first check if the user with the specified ID or name is available in the cached list. If not, it will perform the list request to fetch the users and then retrieve the user with the specified ID or name from the response.

### **When partial objects in lists**

When the API provides only partial objects in list responses, you can't use the data from these items to provide the complete item details. In such cases, you should use the request to get the item details and cache the response. To achieve this, you can use the `get()` method of the [RepositoryCache](#repositorycache) class. This method works similarly to the `getList()` method: it looks for an already valid cached response, and if found, returns the cached response. If not, it performs the request, caches the response, and resolves the response.

Example Repository
Below is an example repository with `getList()` and `get()` methods that match this use case and use the [RepositoryCache](#repositorycache) and its methods for each request, leveraging the cache as explained.

```typescript
import {
  FetchHttpRequest,
  HttpMethod,
  RepositoryCache,
} from "http-repository-cache";

class ItemRepository {
  private fetchHttpRequest: FetchHttpRequest;
  private repositoryCache: RepositoryCache;

  constructor() {
    this.fetchHttpRequest = new FetchHttpRequest();
    this.repositoryCache = new RepositoryCache(this.fetchHttpRequest, "id");
  }

  getList() {
    return this.repositoryCache.getList(HttpMethod.GET, {
      url: "http://example.com/api/items",
    });
  }

  get(id: string | number) {
    return this.repositoryCache.get(HttpMethod.GET, {
      url: `http://example.com/api/items/${id}`,
    });
  }

  ...
}
```

### **With data in responses sub properties**

All `find*` methods have parameters to define in which sub-properties our interesting items are located. This allows us to find the items we are looking for in cached request responses.

**Parameters**: `subPropertyResponseList: string[]` and `subPropertyResponseOccurrence: string[]`

- **`subPropertyResponseList`**: An array of strings to get from the body of list-type request responses the nested sub-property where the list is.

- **`subPropertyResponseOccurrence`**: An array of strings to get from the body of occurrence-type request responses the nested sub-property where the occurrence is.

These parameters help in navigating through nested JSON responses to locate the desired data.

**Example JSON Response**

Suppose we have the following JSON response where our data is nested under two sub-properties:

```json
{
  "meta": {
    "status": "success"
  },
  "response": {
    "data": {
      "items": [
        { "id": 1, "name": "Item 1" },
        { "id": 2, "name": "Item 2" }
      ]
    }
  }
}
```

In this example, the list of items is located under the response.data.items sub-properties.

**Using `findByKeyOrRequestGetList()` and `findOrRequestGetList()`**

To find an item by key from the cache or request to get all and cache it, you can use the `findByKeyOrRequestGetList` method with the `subPropertyResponseList` parameter:

```typescript
const fetchHttpRequest = new FetchHttpRequest();
const repositoryCache = new RepositoryCache(fetchHttpRequest, "id");

// Define the HTTP request parameters for the list request
const listHttpRequestParams: HttpRequestParams<void, unknown> = {
  url: "http://example.com/api/items",
};

// Define the key and value to find the item
const itemId = 1;

// Use findByKeyOrRequestGetList to find the item by ID
repositoryCache
  .findByKeyOrRequestGetList(
    "id",
    itemId,
    HttpMethod.GET,
    listHttpRequestParams,
    ["response", "data", "items"]
  )
  .then((item) => {
    console.log("Item found:", item);
  })
  .catch((error) => {
    console.error("Error finding item:", error);
  });
```

Similarly, you can use the `findOrRequestGetList()` method if you prefer to find an item by its ID directly:

```typescript
// Use findOrRequestGetList to find the item by ID
repositoryCache
  .findOrRequestGetList(itemId, HttpMethod.GET, listHttpRequestParams, [
    "response",
    "data",
    "items",
  ])
  .then((item) => {
    console.log("Item found:", item);
  })
  .catch((error) => {
    console.error("Error finding item:", error);
  });
```

**Using `findByKeyOrRequestGet()` and `findOrRequestGet()`**

To find an item by key from the cache or request and cache it, you can use the `findByKeyOrRequestGet()` method with the `subPropertyResponseOccurrence` parameter:

```typescript
const fetchHttpRequest = new FetchHttpRequest();
const repositoryCache = new RepositoryCache(fetchHttpRequest, "id");

// Define the HTTP request parameters for the occurrence request
const occurrenceHttpRequestParams: HttpRequestPFrepositorarams<void, unknown> =
  {
    url: `http://example.com/api/items/${itemId}`,
    method: HttpMethod.GET,
  };

// Use findByKeyOrRequestGet to find the item by ID
repositoryCache
  .findByKeyOrRequestGet(
    "id",
    itemId,
    HttpMethod.GET,
    occurrenceHttpRequestParams,
    [],
    ["response", "data", "item"]
  )
  .then((item) => {
    console.log("Item found:", item);
  })
  .catch((error) => {
    console.error("Error finding item:", error);
  });
```

Similarly, you can use the `findOrRequestGet()` method if you prefer to find an item by its ID directly:

```typescript
// Use findOrRequestGet to find the item by ID
repositoryCache
  .findOrRequestGet(
    itemId,
    HttpMethod.GET,
    occurrenceHttpRequestParams,
    [],
    ["response", "data", "item"]
  )
  .then((item) => {
    console.log("Item found:", item);
  })
  .catch((error) => {
    console.error("Error finding item:", error);
  });
```

By using these methods and parameters, you can efficiently navigate through nested JSON responses and leverage the caching system to optimize data retrieval in your application.

### Other requests actions

To perform create, update, delete, or other requests that do not need cache interaction, you can use the associated [RepositoryCache](#repositorycache) methods.

- **Create and Update Requests**: se the `create()` and `update()` methods of [RepositoryCache](#repositorycache) to handle `create` and `update` requests. These methods also manage the cache by clearing the relevant cached data.
- **Delete Requests**: Use the `update()` method of [RepositoryCache](#repositorycache) to handle `delete` requests. This method will clear the relevant cached data.
- **Other Requests**: For any other requests that do not need cache interaction, use the `doHttpRequest()` method of [RepositoryCache](#repositorycache).

**How `create()` and `update()` Methods Work with Cache**

- `create()` method: The `create()` method performs the HTTP request to create an item and clears the lists cache to ensure that any subsequent list requests will fetch the updated data from the server.
- `update()` method: The `update()` method performs the HTTP request to update an item, clears the lists cache, and clears the specific occurrence cache for the updated item to ensure that any subsequent requests will fetch the updated data from the server.

**Example**

Below is an example repository demonstrating how to use the `create()`, `update()`, and `doHttpRequest()` methods of [RepositoryCache](#repositorycache).

```typescript
import {
  FetchHttpRequest,
  HttpMethod,
  RepositoryCache,
} from "http-repository-cache";

class ItemRepository {
  private fetchHttpRequest: FetchHttpRequest;
  private repositoryCache: RepositoryCache;

  constructor() {
    this.fetchHttpRequest = new FetchHttpRequest();
    this.repositoryCache = new RepositoryCache(this.fetchHttpRequest, "id");
  }

  getList() {
    return this.repositoryCache.getList(HttpMethod.GET, {
      url: "http://example.com/api/items",
    });
  }

  get(id: string | number) {
    return this.repositoryCache.get(HttpMethod.GET, {
      url: `http://example.com/api/items/${id}`,
    });
  }

  create(item: { name: string; description: string }) {
    return this.repositoryCache.create(HttpMethod.POST, {
      url: "http://example.com/api/items",
      body: item,
    });
  }

  update(id: string | number, item: { name: string; description: string }) {
    return this.repositoryCache.update(id, HttpMethod.PUT, {
      url: `http://example.com/api/items/${id}`,
      body: item,
    });
  }

  delete(id: string | number) {
    return this.repositoryCache.update(id, HttpMethod.DELETE, {
      url: `http://example.com/api/items/${id}`,
    });
  }

  customRequest() {
    return this.repositoryCache.doHttpRequest(HttpMethod.PATCH, {
      url: "http://example.com/api/custom",
      body: { custom: "data" },
    });
  }
}
```

In this example, the `create()` and `update()` methods manage the cache by clearing the relevant cached data. The `delete` method uses the `update()` method to handle the delete request and clear the relevant cached data. The customRequest method demonstrates how to use the `doHttpRequest()` method for any other requests that do not need cache interaction.

### **Custom expiration time**

In the constructor of the [RepositoryCache](#repositorycache) class, you can define the cache validity to be eternal (cache never expires) or set a specific lifetime for the cache. By default, the cache lifetime is set to 60 seconds.

**Constructor Parameters**

- **`httpRequest`**: The HttpRequestAdapter instance to make HTTP requests.
- **`idKey`**: The key to identify the occurrence in the response data.
- **`eternalCache`**: A boolean value indicating whether the cache should never expire. Default is false.
- **`cacheValidity`**: The cache validity in seconds. Default is 60 seconds.

**Example: Default Cache Lifetime**
If you do not specify the `eternalCache` or `cacheValidity` parameters, the cache will use the default lifetime of 60 seconds:

```typescript
const fetchHttpRequest = new FetchHttpRequest();
const repositoryCache = new RepositoryCache(fetchHttpRequest, "id"); // Default cache validity of 60 seconds
```

**Example: Custom Cache Lifetime**
To configure the cache with a specific lifetime, set the `cacheValidity` parameter to the desired number of seconds:

```typescript
const fetchHttpRequest = new FetchHttpRequest();
const repositoryCache = new RepositoryCache(fetchHttpRequest, "id", false, 120); // Cache validity set to 120 seconds
```

**Example: Eternal Cache**
To configure the cache to never expire, set the `eternalCache` parameter to `true`:

```typescript
const fetchHttpRequest = new FetchHttpRequest();
const repositoryCache = new RepositoryCache(fetchHttpRequest, "id", true);
```

### **Manually clear cache**

The [RepositoryCache](#repositorycache) class provides several methods to manually clear the cache. These methods allow you to invalidate cached data as needed, ensuring that your application retrieves fresh data when necessary.

**Methods to Clear Cache**

- `clearCache()`: Clears the entire cache by resetting it to an empty object. This method should be used when you want to invalidate all cached data.
- `clearListsCache()`: Clears all cached entries in the repository cache that have a request type of `LIST`. This method should be used when you want to invalidate all cached list data.
- `clearOccurrenceCache(id: string | number, subPropertyResponseOccurrence?: string[]`: Clears the occurrence cache for a specific ID. This method should be used when you want to invalidate cached data for a specific item.

**Examples**

**Example: Clearing the Entire Cache**

```typescript
const fetchHttpRequest = new FetchHttpRequest();
const repositoryCache = new RepositoryCache(fetchHttpRequest, "id");

// Clear the entire cache
repositoryCache.clearCache();
```

**Example: Clearing Lists Cache**

```typescript
const fetchHttpRequest = new FetchHttpRequest();
const repositoryCache = new RepositoryCache(fetchHttpRequest, "id");

// Clear only the lists cache
repositoryCache.clearListsCache();
```

**Example: Clearing Occurrence Cache**

```typescript
const fetchHttpRequest = new FetchHttpRequest();
const repositoryCache = new RepositoryCache(fetchHttpRequest, "id");

// Clear the occurrence cache for a specific item
repositoryCache.clearOccurrenceCache(1);
```

**Example: Clearing Occurrence Cache with Sub-properties**

```typescript
const fetchHttpRequest = new FetchHttpRequest();
const repositoryCache = new RepositoryCache(fetchHttpRequest, "id");

// Clear the occurrence cache for a specific item with response nested sub-properties
repositoryCache.clearOccurrenceCache(1, ["property", "subProperty"]);
```

By using these methods, you can effectively manage the cache in your application, ensuring that your data remains up-to-date and consistent with the server.

## **Exception handling**

The library returns an object of type `HttpException` for any error encountered during HTTP requests. This object contains a `type` and a `body`. The `type` corresponds to one of the values of the `DefaultHttpExceptionType` enum, which represents known and handled types of errors. The body contains the response `body` of the failed request.

**DefaultHttpExceptionType Values**

The following table lists the available values of DefaultHttpExceptionType and their associated error type explanations:

| Exception Type     | Explanation                                                                  |
| ------------------ | ---------------------------------------------------------------------------- |
| UNAUTHORIZED       | The request requires user authentication.                                    |
| FORBIDDEN          | The server understood the request, but refuses to authorize it.              |
| PAYMENT_REQUIRED   | The server claim payment for this request.                                   |
| NOT_FOUND          | The requested resource could not be found.                                   |
| BAD_REQUEST        | The server could not understand the request due to invalid syntax.           |
| CONFLICT           | The request could not be completed due to a conflict with the current state. |
| ABORT_REQUEST      | The request was aborted.                                                     |
| SERVER_ERROR       | The server encountered an internal error and could not complete the request. |
| SERVER_UNAVAILABLE | The server is currently unavailable (overloaded or down).                    |
| UNKNOWN_ERROR      | An unknown error occurred.                                                   |

**Example: HttpException Interception**

Below is an example of how to intercept an `HttpException` when making a request using the [RepositoryCache](#repositorycache) class:

```typescript
import {
  FetchHttpRequest,
  HttpMethod,
  RepositoryCache,
  DefaultHttpExceptionType,
} from "http-repository-cache";

const fetchHttpRequest = new FetchHttpRequest();
const repositoryCache = new RepositoryCache(fetchHttpRequest, "id");

// Perform a request and handle exceptions
repositoryCache
  .get(HttpMethod.GET, { url: "http://example.com/api/items/1" })
  .then((item) => {
    console.log("Item:", item);
  })
  .catch((exception: HttpException) => {
    switch (exception.type) {
      case DefaultHttpExceptionType.UNAUTHORIZED:
        console.error("Exception: Unauthorized access. Please log in.");
        break;
      case DefaultHttpExceptionType.NOT_FOUND:
        console.error("Exception: Item not found.");
        break;
      case DefaultHttpExceptionType.SERVER_ERROR:
        console.error("Exception: Internal server error.");
        break;
      default:
        console.error("Exception:", exception.type, exception.body);
    }
  });
```

In this example, the `get()` method of the [RepositoryCache](#repositorycache) class is used to perform a GET request. If an exception occurs, the `catch` block intercepts the `HttpException` and handles it based on the type of the exception. The type is compared against the values of the `DefaultHttpExceptionType` enum to provide specific error handling logic.

# **Create custom Http Request class**

Sometimes you may have specific needs that the [FetchHttpRequest](#fetchhttprequest) class does not support. In such cases, you can write your own custom HTTP request class. To create a custom HTTP request class, you need to implement the `HttpRequestAdapter` interface so that RepositoryCache can use it to perform requests.

**HttpRequestAdapter Interface**

The `HttpRequestAdapter` interface defines the methods that your custom HTTP request class must implement. Below is the interface and an explanation of each method's utility and what should be respected.

```typescript
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
   * This method should be used to build the headers of all requests types
   *
   * @param httpRequestParams - The parameters for the HTTP request.
   * @returns The request header.
   */
  buildRequestHeader(
    httpRequestParams: HttpRequestParams<unknown, O>
  ): Record<string, string>;

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
```

Below is an example of an empty implementation of the HttpRequestAdapter interface. This implementation provides the structure for each method but does not include any actual logic.

```typescript
import { HttpRequestAdapter, HttpRequestParams } from "http-repository-cache";

interface CustomHttpRequestOptions {}

class CustomHttpRequest<CustomHttpRequestOptions>
  implements HttpRequestAdapter<CustomHttpRequestOptions>
{
  buildRequestHeader(
    httpRequestParams: HttpRequestParams<unknown, unknown>
  ): Record<string, string> {
    // Implement your logic to build request headers here
    return {};
  }

  get<R>(httpRequestParams: HttpRequestParams<never, unknown>): Promise<R> {
    // Implement your logic to send a GET request here
    return Promise.resolve({} as R);
  }

  post<R, B = unknown>(
    httpRequestParams: HttpRequestParams<B, unknown>
  ): Promise<R> {
    // Implement your logic to send a POST request here
    return Promise.resolve({} as R);
  }

  patch<R, B = unknown>(
    httpRequestParams: HttpRequestParams<B, unknown>
  ): Promise<R> {
    // Implement your logic to send a PATCH request here
    return Promise.resolve({} as R);
  }

  put<R, B = unknown>(
    httpRequestParams: HttpRequestParams<B, unknown>
  ): Promise<R> {
    // Implement your logic to send a PUT request here
    return Promise.resolve({} as R);
  }

  delete<R>(httpRequestParams: HttpRequestParams<never, unknown>): Promise<R> {
    // Implement your logic to send a DELETE request here
    return Promise.resolve({} as R);
  }
}

// Usage example
const customHttpRequest = new CustomHttpRequest();
```

In this example, the `CustomHttpRequest` class implements the `HttpRequestAdapter` interface. Each method is defined but does not contain any actual logic. You can fill in the logic for each method based on your specific requirements. This structure ensures that the [RepositoryCache](#repositorycache) can use the `CustomHttpRequest` class to perform requests.

# **Report Bug 🪳**

If you encounter any issues or bugs while using the http-repository-cache library, please report them on the [Github repository issues board](https://github.com/arnoldatse/http-repository-cache/issues).

Before submitting a new bug report, please verify that the issue has not already been reported. This helps us avoid duplicate reports and allows us to address issues more efficiently. Thank you for your cooperation!

# **Contribute**

I welcome contributions to the `http-repository-cache` library! If you would like to contribute, please follow these steps:

1. **Fork the Repository**: Start by forking the repository to your GitHub account.
2. **Clone the Repository**: Clone the forked repository to your local machine.

```
git clone https://github.com/your-username/http-repository-cache.git
cd http-repository-cache
```

3. **Create a Branch**: Create a new branch for your feature or bug fix.

```
git checkout -b feature-or-bugfix-name
```

4. **Make Changes**: Make your changes to the codebase. Ensure that your code follows the project's coding standards and includes appropriate tests.

5. **Commit Changes**: Commit your changes with a descriptive commit message.
6. **Push Changes**: Push your changes to your forked repository.
7. **Create a Pull Request**: Go to the original repository on GitHub and create a pull request from your forked repository. Provide a clear and descriptive title and description for your pull request.
8. **Review Process**: Your pull request will be reviewed. They may request changes or provide feedback. Please be responsive to comments and make any necessary updates.
9. **Merge**: Once your pull request is approved, it will be merged into the main branch.

Thank you for your contributions! Your help is greatly appreciated in making `http-repository-cache` better for everyone. 🙏🏿

# Creator

The `http-repository-cache` library was created and maintained by Arnold Atsé.

- website: [arnoldatse.dev](https://arnoldatse.dev)
- Github: [arnoldatse](https://github.com/arnoldatse)
- email: [atse.arnold@gmail.com](mailto:atse.arnold@gmail.com)

# License

[MIT](LICENSE.md)
