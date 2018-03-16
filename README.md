# js-tinyapi

[![npm version](https://badge.fury.io/js/js-tinyapi.svg)](http://badge.fury.io/js/js-tinyapi)
![Downloads](http://img.shields.io/npm/dm/js-tinyapi.svg?style=flat)

## Installing

```sh
yarn add js-tinyapi
```


## Setup

Create a custom api object containing all the endpoints you create

```javascript
import API from 'js-tinyapi'
const api = new API()
```


## Example

Perform a `GET` request to an endpoint

```javascript
// make endpoint
api.makeEndpoint('people', '/api/people', 'GET')

// call the endpoint
api.people()
  .then(data => {
    console.log(data)
  })
  .catch(error => {
    console.log(error)
  })
```

Perform a `POST` request an endpoint

```javascript
// make endpoint
api.makeEndpoint('people', '/api/people', 'POST')

// call the endpoint passing in the post payload
api.people({
  payload: {name: 'Mary'}
})
  .then(data => {
    console.log(data)
  })
  .catch(error => {
    console.log(error)
  })
```

Perform a custom request

```javascript
  options = {
    method: 'GET',
    path: '/api/people',
    params: {},
    type: 'json',
    payload: undefined,
    contentType: undefined,
    include: []
  }

  // call the endpoint with options
  api.request(null, options)
    .then(data => {
      console.log(data)
    })
    .catch(error => {
      console.log(error)
    })
```


## Create CRUD endpoints

```javascript
api.makeCrudEndpoints('people', '/api/')

api.peopleList() // GET /api/people
api.peopleCreate(payload) // POST /api/people with payload
api.peopleDetail(123) // GET /api/people?id=123
api.peopleUpdate(123, payload) // PATCH /api/people?id=123 with payload
api.peopleRemove(123) // DELETE /api/people?id=123
api.peopleOptions() // OPTIONS /api/people
```


## Merge in new endpoints

Merge in `POST` and/or `GET` endpoints

```javascript
api.merge({
  api: {
    people: {
      GET: {
        name: 'peopleGet'
      },
      POST: {
        name: 'peoplePost'
      }
    }
  }
})

api.peopleGet() // GET /api/people
api.peoplePost(payload) // POST /api/people with payload
```

Merge in a `CRUD` endpoint. The result of this merge is equivalent to the above [Create CRUD endpoints](#Create-CRUD-endpoints) example.

```javascript
api.merge({
  api: {
    people: {
      CRUD: {
        name: 'people'
      }
    }
  }
})
// OR
api.merge({
  api: {
    people: 'CRUD'
  }
})

// equivalent to
api.makeCrudEndpoints('people', '/api/')
```


## Middleware

A middleware layer is provided in order to easily alter the characteristics
of requests made through `js-tinyapi`. Three kinds of middleware may be
created:

 1. Request altering middleware.

 2. Response altering middleware.

 3. Fetch middleware.

The first, request altering middleware, is able to modify a request prior to
being fetched. The second, response altering middleware, is able to modify
a response after having been returned. The last, fetch middleware, is able
to alter how each request is sent to a server.

To create a basic middleware for modifying a request, inherit from the provided
middleware baseclass and override the `process` method:

```javascript
import Middleware from './middleware'

// Add an extra slash to all request URLs.
class AddSlash extends Middleware {
  process = request => {
    return {
      ...request,
      url: request.url + '/'
    }
  }
}
```

The above middleware returns a new request with an extra slash added to the URL.

To create a middleware that performs a fetch, simply return a promise that will
be resolved once the fetch has completed:

```javascript
import Middleware from './middleware'

// Add an extra slash to all request URLs.
class DelayedFetch extends Middleware {
  process = request => {
    return new Promise( (resolve, reject) => {
      setTimeout( () => {
        this.submit( request )
            .then( r => resolve( r ) )
      }, 500 )
    })
  }
}
```

The above will add a 500ms delay to all requests. Notice the use of `this.submit`;
this is a helper method to submit the supplied request object.

As an example, a batching middleware is provided. It can be enabled as such:

```javascript
import API, { Batch } from 'js-tinyapi'
const api = new API()
// prepare API as usual
api.pushMiddleware(
  new Batch({
    batchUrl: 'http://your.domain/api/batch/',
    timeout: 50
  })
)
```

This causes each incoming request to be "held" for up to 50 milliseconds,
waiting for further requests to be made. Once the timeout has expired, all
collected requests are sent to the batch endpoint simultaneously.
