class ApiError extends Error {
  constructor( ...args ) {
    super( ...args )
    try {
      Error.captureStackTrace( this, ApiError )
    }
    catch( e ) {
    }
  }
}

export { ApiError }
