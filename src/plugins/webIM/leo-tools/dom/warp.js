/**
 +-------------------------------------------------------------------
 * leo-tools
 +-------------------------------------------------------------------
 * @version    1.0.0 beta
 * @author     leo
 +-------------------------------------------------------------------
 */

import {$not} from './query'
import {$} from "./core"
import {isFunction} from '../util'
import {$clone, $append, $replaceWith} from './manipulation'

export function $wrapAll(selector, html) {
    selector = $(selector)

    let elem = selector[0]

    if(elem) {
        if(isFunction(html)) {
            html = html(elem)
        }

        let wrap = $(html, elem.ownerDocument)[0]

        if(!wrap) {
            return
        }

        wrap = $clone(wrap, true)[0]

        if(elem.parentNode) {
            elem.parentNode.insertBefore(wrap, elem)
        }

        while(wrap.firstElementChild) {
            wrap = wrap.firstElementChild
        }

        $append(wrap, selector)
    }
}

export function $wrapInner(selector, html) {
    selector = $(selector)

    if(isFunction(html)) {
        return selector.forEach((node, i) => {
            $wrapInner(node, html(node, i))
        })
    }

    selector.forEach((node) => {
        let contents = $contents(node)

        if(contents.length) {
            $wrapAll(contents, html)
        }else {
            $append(node, html)
        }
    })
}

export function $wrap(selector, html) {
    selector = $(selector)

    let isFunction = isFunction(html)

    selector.forEach((node, i) => {
        $wrapAll(node, isFunction ? html(node, i) : html)
    })
}

export function $unwrap(selector, unwrapSelector) {
    $not($parent(selector, unwrapSelector), 'body').forEach((elem) => {
        $replaceWith(elem, elem.childNodes)
    })
}