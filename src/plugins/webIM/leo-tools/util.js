/**
 +-------------------------------------------------------------------
 * leo-tools
 +-------------------------------------------------------------------
 * @version    1.0.0 beta
 * @author     leo
 +-------------------------------------------------------------------
 */

import {document, toString, getProto, hasOwnProperty as hasOwn, fnToString, ObjectFunctionString} from './constant'
import getType, {baseGetTag} from './internal/type'

const rgenerateId = /\d\.\d{4}/

export function generateId(prefix = 'LeoJs') {
    return String(Math.random() + Math.random()).replace(rgenerateId, prefix)
}

export function merge(first, second) {
    let len = +second.length,
        j = 0,
        i = first.length

    for(; j < len; j++) {
        first[i++] = second[j]
    }

    first.length = i

    return first
}

export function isPlainObject(obj) {
    let proto, Ctor

    if(!obj || toString.call(obj) !== "[object Object]") {
        return false
    }

    proto = getProto(obj)

    if(!proto) {
        return true
    }

    Ctor = hasOwn.call(proto, "constructor") && proto.constructor
    return typeof Ctor === "function" && fnToString.call(Ctor) === ObjectFunctionString
}

export function isObject(value) {
    const type = typeof value
    return value != null && (type == 'object' || type == 'function')
}

export function isFunction(value) {
    if(!isObject(value)) {
        return false
    }

    if(typeof value.nodeType === "number") {
        return false
    }

    const tag = baseGetTag(value)

    return tag == '[object Function]' || tag == '[object AsyncFunction]' ||
        tag == '[object GeneratorFunction]' || tag == '[object Proxy]'
}

export function isWindow(obj) {
    return obj != null && obj === obj.window
}

export function nodeName(elem, name) {
    return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase()
}

export function type(obj) {
    if(obj == null) {
        return obj + ''
    }

    return typeof obj === 'object' || typeof obj === 'function'
        ? getType(obj) || 'object'
        : typeof obj
}

export function isXMLDoc(elem) {
    const documentElement = elem && (elem.ownerDocument || elem).documentElement
    return documentElement ? documentElement.nodeName !== "HTML" : false
}

export function extend(...arg) {
    let options,
        name,
        src,
        copy,
        copyIsArray,
        clone,
        target = arg[0] || {},
        i = 1,
        length = arg.length,
        deep = false

    if(typeof target === 'boolean') {
        deep = target

        target = arg[i] || {}
        i++
    }

    if(typeof target !== 'object' && !isFunction(target)) {
        target = {}
    }

    if(i === length) {
        target = this
        i--
    }

    for(; i < length; i++) {
        if((options = arg[i]) != null) {
            for(name in options) {
                src = target[name]
                copy = options[name]

                if(target === copy) {
                    continue
                }

                if(deep && copy && (isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
                    if(copyIsArray) {
                        copyIsArray = false
                        clone = src && Array.isArray(src) ? src : []
                    }else {
                        clone = src && isPlainObject(src) ? src : {}
                    }

                    target[name] = extend(deep, clone, copy)
                }else if(copy !== undefined) {
                    target[name] = copy
                }
            }
        }
    }

    return target
}

function fcamelCase(all, letter) {
    return letter.toUpperCase()
}

const rmsPrefix = /^-ms-/
const rdashAlpha = /-([a-z])/g

export function camelCase(string) {
    return string.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase)
}

const preservedScriptAttributes = {
    type: true,
    src: true,
    noModule: true,
}

export function globalEval(code, doc, node) {
    doc = doc || document

    let i, script = doc.createElement("script")

    script.text = code
    if(node) {
        for(i in preservedScriptAttributes) {
            if(node[i]) {
                script[i] = node[i]
            }
        }
    }
    doc.head.appendChild(script).parentNode.removeChild(script)
}

export function isNode(node) {
    return !!(node && node.nodeName)
}

export function isNodeList(variable) {
    return (
        typeof variable === 'object' &&
        /^\[object (HTMLCollection|NodeList|Object)\]$/.test(Object.prototype.toString.call(variable)) &&
        variable.length !== undefined &&
        (variable.length === 0 || (typeof variable[0] === 'object' && variable[0].nodeType > 0))
    )
}

export function loadStyles(doc = document) {
    let head = doc.head || doc.getElementsByTagName('head')[0]

    if(!head) {
        head = doc.createElement('head')
        const body = doc.body || doc.getElementsByTagName('body')[0]
        if(body) {
            body.parentNode.insertBefore(head, body)
        }else {
            doc.documentElement.appendChild(head)
        }
    }

    const style = doc.createElement('style')
    style.type = 'text/css'
    head.appendChild(style)

    return style
}

export function getTranslateXY(transform) {
    const matrix = transform.replace(/[^0-9\-.,]/g, '').split(',')

    if(matrix.length > 1) {
        return {
            x: matrix[12] || matrix[4],
            y: matrix[13] || matrix[5],
        }
    }else {
        return {
            x: 0,
            y: 0,
        }
    }
}
