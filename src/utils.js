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
var ajaxSettings = {
  csrf: Cookies.get( 'csrftoken' ) || 'NO-CSRF-TOKEN',
  bearer: null
};

function fetchHeaders( opts ) {
  const {
    method = 'get',
    dataType,
    contentType='application/vnd.api+json',
    additionalHeaders,
    useBearer = true
  } = opts || {};
  let headers = new Headers({
    'X-Requested-With': 'XMLHttpRequest'
  });
  // TODO: What is going on here??
  if( dataType == 'json' )
    headers.set( 'Content-Type', contentType );
  if( !(/^(GET|HEAD|OPTIONS\TRACE)$/i.test( method )) )
    headers.set( 'X-CSRFToken', ajaxSettings.token );
  if( useBearer && ajaxSettings.bearer ) {
    headers.set( 'Authorization', 'Bearer ' + ajaxSettings.bearer )
  }
  for ( const k in additionalHeaders )
    headers.set(k, additionalHeaders[k])
  return headers;
}

export function ajax( url, body, method, dataType, contentType, additionalHeaders, useBearer ) {
  let requestInit = {
    method,
    headers: fetchHeaders({ method, dataType, contentType, additionalHeaders, useBearer }),
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
function postForm({ url, payload, dataType, useBearer = true }) {
  let body = new FormData();
  for( let k in payload )
    body.append( k, payload[k] );
  return ajax( url, body, 'post', dataType, undefined, {}, useBearer );
}

export {postJson, postForm, ajaxSettings}
