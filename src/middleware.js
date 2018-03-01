import { ajaxWithRequest } from './utils'

/**
 * Base class for middleware.
 *
 * Middleware allows custom operations to be injected into the flow
 * of making a request. They can either modify the request details,
 * alter how the request is made, or modify the response. There may
 * be at most one middleware that returns a promise, all others must
 * return an object.
 */
export default class Middleware {

  constructor( api ) {
    this.api = api
  }

  /**
   * Entrypoint for middleware.
   *
   * This method should be overridden in sub-classes, and is used to
   * provide an entrypoint for middleware. "obj" can be either the
   * request information before being sent, or it may be the response
   * from a previous middleware sending the request.
   */
  process = ( obj, ...args ) => {
    return this.submit( obj )
  }

  /**
   * Submit a request.
   */
  submit = request => {
    return ajaxWithRequest( request )
  }
}
