import {
  postJson, csrfSettings, ApiError, ajax, capitalize, supplant
} from './utils'

/**
 * Describes an API.
 */
export default class Api {

  /**
   * Constructs an Api instance. Accepts an endpoint tree.
   */
  constructor( endpoints = {} ) {
    this.merge = ::this.merge
    this.request = ::this.request
    this.crud = {}
    this.merge( endpoints )
  }

  /**
   * Constructs an endpoint call function and sets it.
   */
  makeEndpoint( name, path, method, options = {} ) {

    // Prepare the context to be passed to the request method.
    let ctx = {
      type: 'json',
      path: path + ((path[path.length - 1] == '/') ? '' : '/'),
      method: method,
      ...options
    }

    // If we were given a function to call, bind it appropriately.
    // Otherwise just use the standard request.
    let request = opts => this.request( ctx, opts )
    const { handler } = options
    if( handler !== undefined )
      this[name] = (...args) => handler( request, ...args )
    else
      this[name] = request
    return this[name]
  }

  /**
   * Merge an endpoint tree.
   */
  merge( endpoints, path = '' ) {
    if( !endpoints )
      throw new Error( 'invalid endpoint data given to Api.merge' )
    for( const key of Object.keys( endpoints ) ) {
      let ep = endpoints[key]

      // Check if we're looking at an endpoint.
      let match = /^(GET|POST|PUT|PATCH|DELETE|CRUD)$/.exec( key )
      if( match ) {

        // If we matched a CRUD endpoint, perform the setup.
        if( match[1] == 'CRUD' ) {
          const ii = path.lastIndexOf( '/' ) + 1
          let crudKey = path.slice( ii )
          let crudPath = path.slice( 0, ii )
          this.makeCrudEndpoints( crudKey, crudPath )
        }

        // The endpoint can be just the name of the function
        // or it can be an object of details.
        else {
          if( !(ep instanceof Object) )
            ep = { name: ep }
          const {name, options={}} = ep

          // Make the endpoint.
          this.makeEndpoint( name, path + '/', match[1], options )
        }
      }

      // If not an endpoint, check for a CRUD shorthand.
      else if( ep == 'CRUD' )
        this.makeCrudEndpoints( key, path )

      // If not an endpoint or CRUD, continue down the tree.
      else
        this.merge( ep, path + '/' + key )
    }
  }

  makeCrudEndpoints( key, path ) {
    /* let ep = [key.slice( 0, -1 ), key]*/
    const joiner = ((path[path.length - 1] == '/') ? '' : '/')
    const basePath = path + joiner + key // ep[1]
    /* const baseName = capitalize( ep[0] )
     * const baseNamePlural = capitalize( ep[1] )*/
    this.crud[key] = {
      list: this.makeEndpoint( key + 'List', basePath, 'GET' ),
      create: this.makeEndpoint( key + 'Create', basePath, 'POST', {
        handler: (req, payload, opts = {}) => req({
          ...opts,
          payload
        })
      }),
      detail: this.makeEndpoint( key + 'Get', basePath + '/{id}', 'GET', {
        handler: (req, id, opts = {}) => {
          return req({
            ...opts,
            params: {id}
          })
        }
      }),
      update: this.makeEndpoint( key + 'Update', basePath + '/{id}', 'PATCH', {
        handler: (req, id, payload, opts = {}) => {
          return req({
            ...opts,
            params: {id},
            payload
          })
        }
      }),
      remove: this.makeEndpoint( key + 'Remove', basePath + '/{id}', 'DELETE', {
        handler: (req, id, opts = {}) => req({
          ...opts,
          params: {id}
        })
      })
    }
  }

  /**
   * Perform a request call.
   */
  request( endpoint, options = {} ) {
    const {
      method = endpoint.method,
      path = endpoint.path,
      params = {},
      type = endpoint.type,
      payload,
      contentType = endpoint.contentType,
      include = (endpoint.include || []),
    } = options
    let { urlRoot } = options
    let queryString = []

    // Process the body. This can end up being a FormData object
    // or a json string.
    let body
    if( method != 'GET' ) {
      if( payload !== undefined ) {
        if( type == 'form' ) {
          body = new FormData()
          for( let k in payload )
            body.append( k, payload[k] )
        }
        else {
          body = payload || {}
          body = JSON.stringify( body )
        }
      }
    }
    else {
      if( payload !== undefined ) {
        for( const k in payload )
          queryString.push( k + '=' + encodeURIComponent( payload[k] ) )
      }
    }

    // Replace any URL arguments. This is typically just hte ID of
    // an object.
    let finalPath = supplant( path, params )

    // Do we have any included models?
    if( include && include.length )
      queryString.push( 'include=' + include.join( ',' ) )

    // Complete the path with the query string.
    if( queryString.length > 0 )
      finalPath += '?' + queryString.join( '&' )

    // If we've been given an URL root, add it in here. This is useful
    // for writing Node tests.
    if( urlRoot ) {
      if( urlRoot[urlRoot.length - 1] == '/' )
        urlRoot = urlRoot.substring( 0, urlRoot.length - 1 )
      finalPath = urlRoot + finalPath
    }

    console.debug( `API ${method} ${type}: ${finalPath}`, payload )
    return ajax( finalPath, body, method, type, contentType )
  }
}

export {ajax, postJson, csrfSettings, ApiError}
