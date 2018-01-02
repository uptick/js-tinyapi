import Cookies from 'js-cookie';

export function ApiError( message ) {
  this.message = message;
  this.stack = (new Error()).stack;
}
ApiError.prototype = Object.create( Error.prototype );
ApiError.prototype.name = 'ApiError';

export function supplant( text, o ) {
  return text.replace(
    /{([^{}]*)}/g,
    function( a, b ) {
      var r = o[b];
      if( r === undefined )
        throw new ApiError( `Missing string template: ${b}` );
      return typeof r === 'string' || typeof r === 'number' ? r : a;
    }
  );
}

export function capitalize( name ) {
  return name[0].toUpperCase() + name.slice( 1 );
}

/**
 * Global storage for current csrf settings.
 */
var csrfSettings = {
  token: Cookies.get( 'csrftoken' ) || 'NO-CSRF-TOKEN'
};

function fetchHeaders( opts ) {
  const {method = 'get', dataType, contentType='application/vnd.api+json', additionalHeaders} = opts || {};
  let headers = new Headers({
    'X-Requested-With': 'XMLHttpRequest'
  });
  if( dataType == 'json' )
    headers.set( 'Content-Type', contentType );
  if( !(/^(GET|HEAD|OPTIONS\TRACE)$/i.test( method )) )
    headers.set( 'X-CSRFToken', csrfSettings.token );
  for ( const k in additionalHeaders )
    headers.set(k, additionalHeaders[k])
  return headers;
}

export function ajax( url, body, method, dataType, contentType, additionalHeaders ) {
  let requestInit = {
    method,
    headers: fetchHeaders( {method, dataType, contentType, additionalHeaders} ),
    credentials: 'same-origin'
  };
  if( method.toLowerCase() != 'get' &&  method.toLowerCase() != 'head' && method.toLowerCase() != 'options')
    requestInit.body = body
  let request = new Request( url, requestInit );
  return fetch( request )
    .then( response => {
      if( response.ok ) {
        if( response.status != 204 ) {
          if (typeof TINYAPI_NODE !== 'undefined' && TINYAPI_NODE) {
            return response
          }
          return response.json()
        }
        else
          return {};
      }
      return response.json()
                     .catch( e => Object({ status: response.status }))
                     .then( e => Promise.reject( e ));
    });
}

/**
 * Helper for posting JSON data.
 */
function postJson( url, data, contentType ) {
  return ajax( url, JSON.stringify( data ), 'post', 'json', contentType, {} );
}

/**
 * Helper for posting form data.
 */
function postForm( url, data, contentType ) {
  let body = new FormData();
  for( let k in data )
    body.append( k, data[k] );
  return ajax( url, body, 'post', contentType, {} );
}

export {postJson, postForm, csrfSettings};
