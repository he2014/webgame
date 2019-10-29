/**
 +-------------------------------------------------------------------
 * leo-tools
 +-------------------------------------------------------------------
 * @version    1.0.0 beta
 * @author     leo
 +-------------------------------------------------------------------
 */

import {isFunction, merge, type, nodeName} from '../util'
import {$filter} from './query'
import {$} from "./core"

const rhtml = /<|&#?\w+;/

function domManip(targets, arg, callback) {
    let l = targets.length

    if(l && arg.length) {
        let value = arg[0]
        if(type(value) === 'function') {
            targets.forEach((target, i) => {
                arg[0] = value(target, i, target.innerHTML)
                domManip([target], arg, callback, targets)
            })

            return
        }

        let context = targets[0].ownerDocument,
            nodes = concat.apply(
                [],
                concat.apply([], arg).map(node => {
                    let value = $(node)

                    if(value.length) {
                        return value
                    }

                    if(type(node) === 'string' && !rhtml.test(node)) {
                        return context.createTextNode(node)
                    }
                }),
            ),
            fragment,
            node,
            first

        if(!nodes.length) {
            return
        }

        fragment = context.createDocumentFragment()

        nodes.forEach(elem => {
            if(elem && targets.indexOf(elem) === -1) {
                fragment.appendChild(elem)
            }
        })

        first = fragment.firstChild

        if(fragment.childNodes.length === 1) {
            fragment = first
        }

        let iNoClone = l - 1

        if(first) {
            targets.forEach((target, index) => {
                node = fragment

                if(index !== iNoClone) {
                    node = node.cloneNode(true)
                }

                callback(target, node, index)
            })
        }
    }
}

function getAll(context, tag) {
    let ret =
        typeof context.getElementsByTagName !== 'undefined'
            ? context.getElementsByTagName(tag || '*')
            : typeof context.querySelectorAll !== 'undefined' ? context.querySelectorAll(tag || '*') : []

    return tag === undefined || (tag && nodeName(context, tag)) ? merge([context], ret) : ret
}

export function $remove(selector, removeSelector) {
    let node,
        nodes = removeSelector ? $filter(selector, removeSelector) : $(selector),
        i = 0

    for(; (node = nodes[i]) != null; i++) {
        if(node.parentNode) {
            node.parentNode.removeChild(node)
        }
    }
}

export function $empty(selector) {
    selector = $(selector)

    let elem,
        i = 0

    for(; (elem = selector[i]) != null; i++) {
        if(elem.nodeType === 1) {
            elem.textContent = ''
        }
    }
}

export function $text(selector, value) {
    selector = $(selector)

    if(value === undefined) {
        return text(selector)
    }

    selector.forEach((node, i) => {
        let val = isFunction(value) ? value(node, i, selector) : value

        if(val !== undefined && (node.nodeType === 1 || node.nodeType === 11 || node.nodeType === 9)) {
            $empty(node)
            node.textContent = val
        }
    })
}

export function $clone(selector) {
    return $(selector).map(node => {
        return node.cloneNode(true)
    })
}

export function $append(selector, ...arg) {
    domManip($(selector), arg, function(target, node, index) {
        if(target.nodeType === 1 || target.nodeType === 11 || target.nodeType === 9) {
            target.appendChild(node)
        }
    })
}

export function $prepend(selector, ...arg) {
    domManip($(selector), arg, function(target, node, index) {
        if(target.nodeType === 1 || target.nodeType === 11 || target.nodeType === 9) {
            target.insertBefore(node, target.firstChild)
        }
    })
}

export function $before(selector, ...arg) {
    domManip($(selector), arg, function(target, node, index) {
        if(target.parentNode) {
            target.parentNode.insertBefore(node, target)
        }
    })
}

export function $after(selector, ...arg) {
    domManip($(selector), arg, function(target, node, index) {
        if(target.parentNode) {
            target.parentNode.insertBefore(node, target.nextSibling)
        }
    })
}

export function $replaceWith(selector, ...arg) {
    domManip($(selector), arg, function(target, node, index) {
        cleanData && cleanData(getAll(target))
        let parent = target.parentNode
        if(parent) {
            parent.replaceChild(node, target)
        }
    })
}

const rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi

export function htmlPrefilter(html) {
    return html.replace(rxhtmlTag, '<$1></$2>')
}

export function $html(selector, value) {
    selector = $(selector)

    if(value === undefined) {
        let elem
        if((elem = selector[0]) && elem.nodeType === 1) {
            return elem.innerHTML
        }
    }

    let type = type(value)

    if(type === 'function') {
        selector.forEach((elem, i) => {
            let val = value(elem, i, elem.innerHTML)

            if(type(val) === 'string') {
                elem.innerHTML = htmlPrefilter(val)
            }
        })
    }else if(type === 'string') {
        value = htmlPrefilter(value)

        selector.forEach(elem => {
            elem.innerHTML = value
        })
    }
}
