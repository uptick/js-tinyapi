import 'isomorphic-fetch'
import { expect } from 'code'
import sinon from 'sinon'
import FormData from 'form-data'

import Api from '../src'
import * as utils from '../src/utils'

// Don't dump stuff to the terminal.
console.debug = () => {}

// Set global FormData object.
global.FormData = FormData

describe( 'Given an empty Api', () => {

  describe( 'merging endpoint data', () => {

    it( 'should traverse the tree', () => {
      let api = new Api()
      api.merge({
        v1: {
          prefix: {
            A: {
              POST: {
                name: 'a'
              }
            }
          }
        }
      })
      expect( api.a ).to.exist()
      expect( api.a.context.path ).to.equal( '/v1/prefix/A/' )
    })

    it( 'should accept methods', () => {
      let api = new Api()
      api.merge({
        A: {
          POST: {
            name: 'a'
          }
        },
        B: {
          GET: {
            name: 'b'
          }
        }
      })
      expect( api.a.context.method ).to.equal( 'POST' )
      expect( api.b.context.method ).to.equal( 'GET' )
    })

    it( 'should accept a type', () => {
      let api = new Api()
      api.merge({
        A: {
          GET: {
            name: 'a',
            options: {
              type: 'form'
            }
          }
        },
        B: {
          GET: {
            name: 'b',
            options: {
              type: 'json'
            }
          }
        },
        C: {
          GET: {
            name: 'c'
          }
        }
      })
      expect( api.a.context.type ).to.equal( 'form' )
      expect( api.b.context.type ).to.equal( 'json' )
      expect( api.c.context.type ).to.not.exist()
    })

    it( 'should accept a handler', () => {
      let api = new Api()
      let handler = ( request ) => {}
      api.merge({
        A: {
          GET: {
            name: 'a',
            options: {
              handler
            }
          }
        }
      })
      expect( api.a.context.handler ).to.be.equal( handler )
    })

  })

})

describe( 'Given multiple methods in an Api', () => {
  let api = new Api({
    A: {
      GET: {
        name: 'a'
      }
    },
    B: {
      POST: {
        name: 'b'
      }
    },
    C: {
      PATCH: {
        name: 'c'
      }
    }
  })

  beforeEach(() => {
    sinon.stub( utils, 'ajax' )
  })

  afterEach(() => {
    utils.ajax.restore()
  })

  describe( 'calling the endpoint', () => {

    it( 'should use the GET method', () => {
      api.a()
      expect( utils.ajax.args[0][0].method ).to.equal( 'get' )
    })

    it( 'should use the POST method', () => {
      api.b()
      expect( utils.ajax.args[0][0].method ).to.equal( 'post' )
    })

    it( 'should use the PATCH method', () => {
      api.c()
      expect( utils.ajax.args[0][0].method ).to.equal( 'patch' )
    })

  })

})

describe( 'Given a JSON-API endpoint', () => {
  let api = new Api({
    A: {
      GET: {
        name: 'a'
      }
    }
  })

  beforeEach(() => {
    sinon.stub( utils, 'ajax' )
  })

  afterEach(() => {
    utils.ajax.restore()
  })

  describe( 'supplying includes', () => {

    it( 'should alter the query string', () => {
      api.a({ include: ['b', 'c'] })
      expect( utils.ajax.args[0][0].url ).to.equal( '/A/?include=b,c' )
    })

  })

  describe( 'supplying filters', () => {

    it( 'should alter the query string', () => {
      api.a({
        filter: {
          b: 10,
          c: 20
        }
      })
      expect( utils.ajax.args[0][0].url ).to.equal( '/A/?filter[b]=10&filter[c]=20' )
    })

  })

  describe( 'supplying sorting', () => {

    it( 'should alter the query string', () => {
      api.a({ sort: ['b', 'c'] })
      expect( utils.ajax.args[0][0].url ).to.equal( '/A/?sort=b,c' )
    })

  })

  describe( 'supplying multiple', () => {

    it( 'should combine correctly', () => {
      api.a({
        include: ['b', 'c'],
        filter: {
          b: 10,
          c: 20
        },
        sort: ['b', 'c']
      })
      expect( utils.ajax.args[0][0].url ).to.equal( '/A/?include=b,c&filter[b]=10&filter[c]=20&sort=b,c' )
    })

  })

  describe( 'supplying initial', () => {

    it( 'should combine correctly', () => {
      api.a({
        payload: {
          'd': 'y',
          'e': 'z'
        },
        include: ['b', 'c']
      })
      expect( utils.ajax.args[0][0].url ).to.equal( '/A/?d=y&e=z&include=b,c' )
    })

  })

})

describe( 'Given a form POST endpoint', () => {
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

  beforeEach(() => {
    sinon.stub( utils, 'ajax' )
  })

  afterEach(() => {
    utils.ajax.restore()
  })

  describe( 'supplying a payload', () => {

    it( 'should produce form data', () => {
      api.a({
        payload: {
          'b': 10,
          'c': 20
        }
      })
      expect( utils.ajax.args[0][0].body ).to.be.an.instanceof( FormData )
    })

    describe( 'and a json type', () => {

      it( 'should produce JSON data', () => {
        api.a({
          type: 'json',
          payload: {
            'b': 10,
            'c': 20
          }
        })
        expect( utils.ajax.args[0][0].body ).to.be.a.string()
      })

    })

    describe( 'and a json content-type', () => {

      it( 'should produce JSON data', () => {
        api.a({
          contentType: 'application/json',
          payload: {
            'b': 10,
            'c': 20
          }
        })
        expect( utils.ajax.args[0][0].body ).to.be.a.string()
      })

    })

    describe( 'and a form content-type', () => {

      it( 'should produce form data', () => {
        api.a({
          contentType: 'application/x-www-form-urlencoded',
          payload: {
            'b': 10,
            'c': 20
          }
        })
        expect( utils.ajax.args[0][0].body ).to.be.an.instanceof( FormData )
      })

    })

  })

})
