import 'isomorphic-fetch'
import { expect } from 'code'
import sinon from 'sinon'

import Api from '../src'
import * as utils from '../src/utils'
import Batch from '../src/batch'

// Don't dump stuff to the terminal.
console.debug = () => {}

describe( 'Given an Api with Batch middleware', () => {
  let api = new Api({
    A: {
      GET: {
        name: 'a'
      }
    },
    B: {
      GET: {
        name: 'b'
      }
    }
  })
  api.pushMiddleware( new Batch({ batchUrl: '/batch/' }) )

  beforeEach(() => {
    sinon.stub( global, 'fetch' )
  })

  afterEach(() => {
    fetch.restore()
  })

  describe( 'calling multiple endpoints', () => {

    it( 'should resolve appropriately', () => {
      fetch.onCall( 0 ).resolves([
        {
          body: 'a'
        },
        {
          body: 'b'
        }
      ])
      let pa = api.a()
      let pb = api.b()
      return Promise.all( [pa, pb] )
                    .then( results => {
                      expect( results ).to.equal( ['a', 'b'] )
                    })
    })

    it( 'should reject appropriately', () => {
      fetch.onCall( 0 ).resolves([
        {
          status_code: 403,
          body: 'a'
        },
        {
          body: 'b'
        }
      ])
      let pa = api.a().catch( r => 'error' )
      let pb = api.b()
      return Promise.all( [pa, pb] )
                    .then( results => {
                      expect( results ).to.equal( ['error', 'b'] )
                    })
    })

  })

})
