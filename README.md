# redux-tinyapi

[![npm version](https://badge.fury.io/js/js-tinyapi.svg)](http://badge.fury.io/js/js-tinyapi)
![Downloads](http://img.shields.io/npm/dm/js-tinyapi.svg?style=flat)

## Installing
```sh
yarn add js-tinyapi
```

## Setup
Create a custom api object containing all the endpoints you create
```javascript
import tinyApi from 'js-tinyapi'
const api = new tinyApi()
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
