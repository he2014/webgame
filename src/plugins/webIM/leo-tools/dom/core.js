/**
 +-------------------------------------------------------------------
 * leo-tools
 +-------------------------------------------------------------------
 * @version    1.0.0 beta
 * @author     leo
 +-------------------------------------------------------------------
 */

import {document, slice} from '../constant'
import {isPlainObject, isWindow} from '../util'

let readyList = []
let isReady

function fireReady(fn) {
    isReady = true

    while((fn = readyList.shift())) {
        fn()
    }

    document.removeEventListener('DOMContentLoaded', fireReady)
    window.removeEventListener('load', fireReady)
}

if(document.readyState === 'complete' || (document.readyState !== 'loading' && !document.documentElement.doScroll)) {
    window.setTimeout(fireReady)
}else {
    document.addEventListener('DOMContentLoaded', fireReady)
}

window.addEventListener('load', fireReady)

export function ready(fn) {
    if(!isReady) {
        readyList.push(fn)
    }else {
        fn()
    }
}

export function $id(id, context = document) {
    return context.getElementById(id)
}

export function $tag(tagName, context = document) {
    return context.getElementsByTagName(tagName)
}

export function $class(className, context = document) {
    return context.getElementsByClassName(className)
}

export function $qs(selector, context = document) {
    return context.querySelector(selector)
}

export function $qsa(selector, context = document) {
    return context.querySelectorAll(selector)
}

const reSimpleSelector = /^[\.#]?[\w-]*$/

function querySelector(selector, context = document) {
    let isSimpleSelector = reSimpleSelector.test(selector)
    if(typeof context === 'string') {
        context = querySelector(context)
    }

    context[0] && (context = context[0])

    if(isSimpleSelector) {
        if(selector[0] === '#') {
            const element = (context.getElementById ? context : document).getElementById(selector.slice(1))
            return element ? [element] : []
        }

        if(selector[0] === '.') {
            return slice.call(context.getElementsByClassName(selector.slice(1)))
        }

        return slice.call(context.getElementsByTagName(selector))
    }

    return slice.call(context.querySelectorAll(selector))
}

export function $(selector, context) {
    if(!selector) {
        return []
    }

    if(Array.isArray(selector)) {
        return selector
    }

    if(isPlainObject(selector)) {
        context = selector.context
        selector = selector.selector
    }

    if(selector.nodeType || isWindow(selector)) {
        return [selector]
    }

    if(selector instanceof HTMLCollection || selector instanceof NodeList) {
        return slice.call(selector)
    }

    if(typeof selector === 'string') {
        return querySelector(selector, context)
    }

    return []
}

const rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/
const reSingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/

export function $newHtml(html, context = document) {
    if(typeof html !== 'string') {
        return
    }

    let _html = html.match(rquickExpr)

    if(_html && (_html = _html[1])) {
        if(typeof context === 'string') {
            context = querySelector(context)
        }

        context[0] && (context = context[0])
        context = context && context.nodeType ? context.ownerDocument || context : document

        if(reSingleTag.test(_html)) {
            return [context.createElement(RegExp.$1)]
        }

        let domArr = [],
            container = context.createElement('div'),
            children = container.childNodes

        container.innerHTML = _html

        for(let i = 0, l = children.length; i < l; i++) {
            domArr.push(container.removeChild(children[i]))
        }

        return domArr
    }
}

export function contains() {
    let adown = a.nodeType === 9 ? a.documentElement : a,
        bup = b && b.parentNode

    return a === bup || !!(bup && bup.nodeType === 1 && adown.contains(bup))
}




