function jsonApiList( values, key ) {
  if( values && values.length ) {
    return [key + '=' + values.join( ',' )]
  }
  return []
}

function jsonApiInclude( values, key ) {
  return jsonApiList( values, key || 'include')
}

function jsonApiSort( values, key ) {
  return jsonApiList( values, key || 'sort')
}

function jsonApiFilter( values, key ) {
  if( values && Object.keys( values ).length ) {
    const k = key || 'filter'
    return Object.keys( values ).map( attr =>
      `filter[${attr}]=${values[attr]}`
    )
  }
  return []
}

function jsonApiQuery( opts ) {
  const {
    include,
    sort,
    filter
  } = opts || {}
  let parts = (opts.initial || []).concat(
    jsonApiInclude( include ).concat(
      jsonApiFilter( filter ).concat(
        jsonApiSort( sort )
      )
    )
  )
  if( parts.length > 0 ) {
    return '?' + parts.join( '&' )
  }
  return ''
}

export {
  jsonApiQuery
}
