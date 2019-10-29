function encoderForArrayFormat(opts) {
    switch(opts.arrayFormat) {
        case 'index':
            return function(key, value, index) {
                return value === null ? [
                    encode(key, opts),
                    '[',
                    index,
                    ']',
                ].join('') : [
                    encode(key, opts),
                    '[',
                    encode(index, opts),
                    ']=',
                    encode(value, opts),
                ].join('')
            }

        case 'bracket':
            return function(key, value) {
                return value === null ? encode(key, opts) : [
                    encode(key, opts),
                    '[]=',
                    encode(value, opts),
                ].join('')
            }
        case 'traditional':
            return function(key, value) {
                //jquery.param(obj, traditional)
            }

        default:
            return function(key, value) {
                return value === null ? encode(key, opts) : [
                    encode(key, opts),
                    '=',
                    encode(value, opts),
                ].join('')
            }
    }
}

function parserForArrayFormat(opts) {
    let result

    switch(opts.arrayFormat) {
        case 'index':
            return function(key, value, accumulator) {
                result = /\[(\d*)\]$/.exec(key)

                key = key.replace(/\[\d*\]$/, '')

                if(!result) {
                    accumulator[key] = value
                    return
                }

                if(accumulator[key] === undefined) {
                    accumulator[key] = {}
                }

                accumulator[key][result[1]] = value
            }

        case 'bracket':
            return function(key, value, accumulator) {
                result = /(\[\])$/.exec(key)
                key = key.replace(/\[\]$/, '')

                if(!result) {
                    accumulator[key] = value
                    return
                }else if(accumulator[key] === undefined) {
                    accumulator[key] = [value]
                    return
                }

                accumulator[key] = [].concat(accumulator[key], value)
            }

        case 'traditional':
            return function traditional(key, value, accumulator) {
                result = key.match(/\[([^\[\]]*)\]/g)
                if(!result) {
                    accumulator[key] = value
                }else {
                    let inkey = key.replace(/\[[^\[\]]*\]/g, '')
                    result = ['[' + inkey + ']', ...result]
                    let tmp
                    const len = result.length
                    result.forEach((item, i) => {
                        const itemObject = getItemInfo(item)
                        const isLast = i === len - 1
                        if(isLast) {
                            if(itemObject.objectKey === '') {
                                tmp.push(value)
                            }else {
                                tmp[itemObject.objectKey] = value
                            }
                        }else {
                            const nextObject = getItemInfo(result[i + 1])
                            if(typeof tmp === 'undefined') {
                                if(typeof accumulator[itemObject.objectKey] === 'undefined') {
                                    if(nextObject.objectKey === '') {
                                        tmp = accumulator[itemObject.objectKey] = []
                                    }else {
                                        tmp = accumulator[itemObject.objectKey] = {}
                                    }
                                }else {
                                    tmp = accumulator[itemObject.objectKey]
                                }
                            }else {
                                if(typeof tmp[itemObject.objectKey] === 'undefined') {
                                    if(nextObject.objectKey === '') {
                                        tmp = tmp[itemObject.objectKey] = []
                                    }else {
                                        tmp = tmp[itemObject.objectKey] = {}
                                    }
                                }else {
                                    tmp = tmp[itemObject.objectKey]
                                }
                            }
                        }
                    })

                    function getItemInfo(item) {
                        const re = /\[([^\[\]]*)\]/
                        if(item) {
                            const objectKeyResult = re.exec(item)
                            return {
                                objectKeyResult,
                                objectKey: objectKeyResult && objectKeyResult[1],
                            }
                        }
                    }

                    tmp = null
                }
            }

        default:
            return function(key, value, accumulator) {
                if(accumulator[key] === undefined) {
                    accumulator[key] = value
                    return
                }

                accumulator[key] = [].concat(accumulator[key], value)
            }
    }
}

function encode(value, opts) {
    if(opts.encode) {
        return encodeURIComponent(value)
    }

    return value
}

function keysSorter(input) {
    if(Array.isArray(input)) {
        return input.sort()
    }else if(typeof input === 'object') {
        return keysSorter(Object.keys(input)).sort(function(a, b) {
            return Number(a) - Number(b)
        }).map(function(key) {
            return input[key]
        })
    }

    return input
}

export default {
    extract(str) {
        return str.split('?')[1] || ''
    },
    parse(str, opts) {
        opts = Object.assign({arrayFormat: 'none'}, opts)

        const formatter = parserForArrayFormat(opts)

        let ret = Object.create(null)

        if(typeof str !== 'string') {
            return ret
        }

        str = str.trim().replace(/^(\?|#|&)/, '')

        if(!str) {
            return ret
        }

        str.split('&').forEach(function(param) {
            let parts = param.replace(/\+/g, ' ').split('=')

            let key = parts.shift()
            let val = parts.length > 0 ? parts.join('=') : undefined

            val = val === undefined ? null : decodeURIComponent(val)

            formatter(decodeURIComponent(key), val, ret)
        })

        return Object.keys(ret).sort().reduce(function(result, key) {
            let val = ret[key]
            if(Boolean(val) && typeof val === 'object' && !Array.isArray(val) && opts.arrayFormat !== 'traditional') {
                result[key] = keysSorter(val)
            }else {
                result[key] = val
            }

            return result
        }, Object.create(null))
    },

    stringify(obj, opts) {
        const defaults = {
            encode: true,
            arrayFormat: 'none',
        }

        opts = objectAssign(defaults, opts)

        const formatter = encoderForArrayFormat(opts)

        return obj ? Object.keys(obj).sort().map(function(key) {
            let val = obj[key]

            if(val === undefined) {
                return ''
            }

            if(val === null) {
                return encode(key, opts)
            }

            if(Array.isArray(val)) {
                const result = []

                val.slice().forEach(function(val2) {
                    if(val2 === undefined) {
                        return
                    }

                    result.push(formatter(key, val2, result.length))
                })

                return result.join('&')
            }

            return encode(key, opts) + '=' + encode(val, opts)
        }).filter(function(x) {
            return x.length > 0
        }).join('&') : ''
    },
}