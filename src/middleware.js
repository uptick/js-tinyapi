import { ajax } from './utils'

export default class Middleware {

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
    return ajax( request )
  }
}
