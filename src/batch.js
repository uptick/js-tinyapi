import { fetchHeaders } from './utils'
import Middleware from './middleware'

/**
 * Automatic batching of requests.
 *
 * TODO
 */
export default class Batch extends Middleware {

  constructor(opts) {
    super()
    this.batchUrl = opts.batchUrl
    this.batch = []
    this.maximum = 20
    this.timeout = opts.timeout // ms
    this._to = null
  }

  process = (request, options) => {
    let b = {request}

    // Don't try and batch a request specifically flagged to be avoided.
    if (options.skipBatching) {
      return this.submit(request)
    }

    // Note that the promise function argument runs synchronously
    // in order to explicitly support this use-case.
    let promise = new Promise( ( resolve, reject ) => {
      b.resolve = resolve
      b.reject = reject
    })
    this.batch.push(b)
    if (this.batch.length == this.maximum) {
      clearTimeout(this._to)
      this.submitBatch()
    }
    else {

      // The first request to come in sets the timer, and we don't
      // reset the timer on any subsequent requests; it will just
      // catch anything that comes in within the timeout.
      if( !this._to ) {
        this._to = setTimeout( this.submitBatch, this.timeout )
      }

    }

    return promise
  }

  submitBatch = () => {
    // TODO: Any chance of concurrency issues?
    let batch = this.batch
    this.batch = []
    this._to = null

    let request = this.combineRequests(batch)
    this.submit(request)
        .then(r => this.splitResponses(batch, r))
  }

  combineRequests = batch => {
    return {
      url: this.batchUrl,
      method: 'post',
      body: JSON.stringify({
        batch: batch.map( b => this.transformRequest( b.request ) )
      }),
      headers: fetchHeaders({
        method: 'post',
      }),
      credentials: 'same-origin'
    }
  }

  transformRequest = request => {
    let r = {
      url: request.url,
      method: request.method,
      headers: request.headers
    }
    if( request.body ) {
      r.body = request.body
    }
    if( request.headers ) {
      r.headers = request.headers
    }
    return r
  }

  splitResponses = (batch, responses) => {
    for (let ii = 0; ii < batch.length; ++ii) {
      let r = responses[ii]

      // Currently use the presence of "status_code" to know that
      // something has gone wrong.
      if (r.status_code && r.status_code >= 300) {
        batch[ii].reject({
          status_code: r.status_code,
          reason_phrase: r.reason_phrase,
          body: r.body
        })
      }
      else
        batch[ii].resolve(r.body)
    }
  }
}
