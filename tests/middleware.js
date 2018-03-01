import 'isomorphic-fetch'
import { expect } from 'code'
import sinon from 'sinon'

import Api from '../src'
import * as utils from '../src/utils'
import Middleware from '../src/middleware'

// Don't dump stuff to the terminal.
console.debug = () => {}

class PrefixMiddleware extends Middleware {
  process = obj => {
    return {
      ...obj,
      before: (obj.before || 0) + 1
    }
  }
}

class SubmitMiddleware extends Middleware {
  process = obj => {
    return this.submit( obj ).then( result => ({
      ...result,
      before: obj.before
    }))
  }
}

class PostfixMiddleware extends Middleware {
  process = obj => {
    return {
      ...obj,
      after: (obj.after || 0) + 1
    }
  }
}

describe( 'Given an Api with a post and a middleware', () => {
  let api = new Api({
    A: {
      POST: {
        name: 'a',
        options: {
          type: 'form'
        }
      }
    }
  })
  let middleware = new Middleware( api )
  api.middlewares.push( middleware )

  beforeEach(() => {
    sinon.stub( middleware, 'process' )
  })

  afterEach(() => {
    middleware.process.restore()
  })

  describe( 'calling the endpoint', () => {

    it( 'should call the middleware\'s process method', () => {
      api.a()
      expect( middleware.process.called ).to.be.true()
    })

  })

})

describe( 'Given an Api with a post and a middleware chain', () => {
  let api = new Api({
    A: {
      POST: {
        name: 'a'
      }
    }
  })
  api.middlewares.push(...[
    new PrefixMiddleware( api ),
    new PrefixMiddleware( api ),
    new SubmitMiddleware( api ),
    new PostfixMiddleware( api ),
    new PostfixMiddleware( api )
  ])

  beforeEach(() => {
    sinon.stub( utils, 'ajax' )
    utils.ajax.onCall( 0 ).resolves({})
  })

  afterEach(() => {
    utils.ajax.restore()
  })

  describe( 'calling the endpoint', () => {

    it( 'should call each middleware in turn', () => {
      return api.a().then( result => {
        expect( result.before ).to.equal( 2 )
        expect( result.after ).to.equal( 2 )
      })
    })

  })

})
