function jsonApiList(values, key) {
  if (!Array.isArray(values))
    values = [values]
  if (values && values.length)
    return [key + '=' + values.join(',')]
  return []
}

function jsonApiInclude(values, key) {
  return jsonApiList(values, key || 'include')
}

function jsonApiSort(values, key) {
  return jsonApiList(values, key || 'sort')
}

function jsonApiFilter(values, options) {
  const {key, raw} = options || {}
  if (values && Object.keys(values).length) {
    const k = key || 'filter'
    const tmpl = raw ? ((k, v) => `${k}=${v}`) : ((k, v) => `filter[${k}]=${v}`)
    return Object.keys(values).map(attr => tmpl(attr, values[attr]))
  }
  return []
}

function jsonApiFields(values, key) {
  if (values && Object.keys(values).length) {
    const k = key || 'filter'
    return Object.keys(values).map(res =>
      `fields[${res}]=${values[res]}`
    )
  }
  return []
}

function jsonApiQuery(opts) {
  const {
    include,
    sort,
    filter,
    fields,
    rawFilters: raw
  } = opts || {}
  let parts = (opts.initial || []).concat(
    jsonApiInclude(include).concat(
      jsonApiFilter(filter, {raw}).concat(
        jsonApiSort(sort).concat(
          jsonApiFields(fields)
        )
      )
    )
  )
  if (parts.length > 0)
    return '?' + parts.join('&')
  return ''
}

export {
  jsonApiQuery
}
