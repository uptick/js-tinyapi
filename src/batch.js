import uuid from 'uuid'

import {makeHeaders, fetchHeaders} from './utils'
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
    this.mutableBatchUrl = opts.mutableBatchUrl || this.batchUrl
    this.batch = {
      auto: []
    }
    this.maximum = 1000
    this.timeout = opts.timeout // ms
    this.mutMethods = new Set(['post', 'put', 'patch'])
    this._to = null
  }

  contributeToApi(api) {
    const $this = this
    api.batch = function() {
      const batchApi = Object.create(api)
      const group = uuid.v4()
      batchApi.batchOptions = {
        group
      }
      batchApi.send = () => {
        return $this.submitBatch(group)
      }
      batchApi.clear = () => {
        delete $this.batch[group]
      }
      return batchApi
    }
  }

  process = (api, request, options) => {
    let b = {request}

    // Merge options with any options given directly via the
    // API. These kinds of options come from the "batch" method.
    options = {
      ...(api.batchOptions || {}),
      ...options
    }

    // Don't try and batch a request specifically flagged to be avoided.
    if (options.skipBatching) {
      return this.submit(request)
    }

    // Note that the promise function argument runs synchronously
    // in order to explicitly support this use-case.
    let promise = new Promise((resolve, reject) => {
      b.resolve = resolve
      b.reject = reject
    })
    const group = options.group || 'auto'
    this.batch[group] = (this.batch[group] || [])
    this.batch[group].push(b)
    if (group == 'auto') {
      if (this.batch[group].length == this.maximum) {
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
    }

    return promise
  }

  submitBatch = (group = 'auto') => {
    // TODO: Any chance of concurrency issues?
    let batch = this.batch[group] || []
    delete this.batch[group]
    if (group == 'auto') {
      this._to = null
    }

    let request = this.combineRequests(batch)
    return this.submit(request)
               .then(r => this.splitResponses(batch, r))
  }

  combineRequests = batch => {
    return {
      url: this.selectUrl(batch),
      method: 'post',
      body: JSON.stringify({
        batch: batch.map(b => this.transformRequest(b.request))
      }),
      headers: fetchHeaders({
        method: 'post',
      }),
      credentials: 'same-origin'
    }
  }

  selectUrl = batch => {
    if (batch.length > 1) {
      for (const b of batch) {
        if (this.mutMethods.has(b.request.method.toLowerCase())) {
          return this.mutableBatchUrl
        }
      }
    }
    return this.batchUrl
  }

  transformRequest = request => {
    let r = {
      url: request.url,
      method: request.method,
      headers: request.headers
    }
    if (request.body) {
      r.body = request.body
    }
    return r
  }

  splitResponses = (batch, response) => {
    const results = []
    for (let ii = 0; ii < batch.length; ++ii) {
      let r = response.data[ii]
      let data = r.body
      let success = false
      if (r.status_code) {
        if (r.status_code < 300) {
          success = true
        }
      }
      if (success) {
        batch[ii].resolve({
          response: r,
          data,
        })
      } else {
        if (!data) data = {errors: {detail: r.reason_phrase}}
        batch[ii].reject({
          response: r,
          data,
        })
      }
      results.push(data)
    }
    return results
  }
}
