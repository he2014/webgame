/**
 +-------------------------------------------------------------------
 * leo-tools
 +-------------------------------------------------------------------
 * @version    1.0.0 beta
 * @author     leo
 +-------------------------------------------------------------------
 */

import {documentElement} from '../constant'
import {$} from "./core"
import {isFunction, extend, isWindow} from '../util'
import {addGetHookIf, curCSS, css, $css, rnumnonpx, cssHooks} from './css.js'
import support from './support'

function scrollWarp(method, prop) {
    let top = 'pageYOffset' === prop
    return function scroll(selector, val) {
        selector = $(selector)

        if(val === undefined) {
            let win
            selector = selector[0]
            if(isWindow(selector)) {
                win = selector
            }else if(selector.nodeType === 9) {
                win = selector.defaultView
            }
            return win ? win[prop] : selector[method]
        }

        let callback = isFunction(val)
            ? (node, i) => {
                scroll(node, val(node, i))
            }
            : (node, i) => {
                let win
                if(isWindow(node)) {
                    win = node
                }else if(node.nodeType === 9) {
                    win = node.defaultView
                }
                if(win) {
                    win.scrollTo(!top ? val : win.pageXOffset, top ? val : win.pageYOffset)
                }else {
                    node[method] = val
                }
            }

        selector.forEach((node, i) => {
            callback(node, i)
        })
    }
}

export const $scrollLeft = scrollWarp('scrollLeft', 'pageXOffset')
export const $scrollTop = scrollWarp('scrollTop', 'pageYOffset')

export function $offsetParent(selector) {
    return $(selector).map(node => {
        let offsetParent = node.offsetParent

        while(offsetParent && css(offsetParent, 'position') === 'static') {
            offsetParent = offsetParent.offsetParent
        }

        return offsetParent || documentElement
    })
}

export function $position(selector) {
    selector = $(selector)

    if(!selector[0]) {
        return
    }

    let offsetParent,
        offset,
        doc,
        elem = selector[0],
        parentOffset = {
            top: 0,
            left: 0,
        }

    if(css(elem, 'position') === 'fixed') {
        offset = elem.getBoundingClientRect()
    }else {
        offset = $offset(selector)

        doc = elem.ownerDocument
        offsetParent = elem.offsetParent || doc.documentElement
        while(
            offsetParent &&
            (offsetParent === doc.body || offsetParent === doc.documentElement) &&
            css(offsetParent, 'position') === 'static'
            ) {
            offsetParent = offsetParent.parentNode
        }
        if(offsetParent && offsetParent !== elem && offsetParent.nodeType === 1) {
            parentOffset = $offset(offsetParent)
            parentOffset.top += css(offsetParent, 'borderTopWidth', true)
            parentOffset.left += css(offsetParent, 'borderLeftWidth', true)
        }
    }

    return {
        top: offset.top - parentOffset.top - css(elem, 'marginTop', true),
        left: offset.left - parentOffset.left - css(elem, 'marginLeft', true),
    }
}

export function $offset(selector, options) {
    selector = $(selector)

    if(options) {
        selector.forEach((node, i) => {
            setOffset(node, options, i)
        })

        return
    }

    let win,
        rect,
        elem = selector[0]

    if(!elem) {
        return
    }

    if(!elem.getClientRects().length) {
        return {
            top: 0,
            left: 0,
        }
    }

    rect = elem.getBoundingClientRect()
    win = elem.ownerDocument.defaultView

    return {
        top: rect.top + win.pageYOffset,
        left: rect.left + win.pageXOffset,
    }
}

export function setOffset(elem, options, i) {
    let curPosition,
        curLeft,
        curCSSTop,
        curTop,
        curOffset,
        curCSSLeft,
        calculatePosition,
        position = css(elem, 'position'),
        curElem = $(elem),
        props = {}

    if(position === 'static') {
        elem.style.position = 'relative'
    }

    curOffset = $offset(curElem)
    curCSSTop = css(elem, 'top')
    curCSSLeft = css(elem, 'left')
    calculatePosition =
        (position === 'absolute' || position === 'fixed') && (curCSSTop + curCSSLeft).indexOf('auto') > -1

    if(calculatePosition) {
        curPosition = $position(curElem)
        curTop = curPosition.top
        curLeft = curPosition.left
    }else {
        curTop = parseFloat(curCSSTop) || 0
        curLeft = parseFloat(curCSSLeft) || 0
    }

    if(isFunction(options)) {
        options = options(elem, i, extend({}, curOffset))
    }

    if(options.top != null) {
        props.top = (options.top - curOffset.top) + curTop
    }
    if(options.left != null) {
        props.left = (options.left - curOffset.left) + curLeft
    }

    if('using' in options) {
        options.using(elem, props)
    }else {
        $css(curElem, props)
    }
}

;['top', 'left'].forEach((item, i) => {
    cssHooks[item] = addGetHookIf(support.pixelPosition, function(elem, computed) {
        if(computed) {
            computed = curCSS(elem, prop)
            return rnumnonpx.test(computed) ? $position(elem)[prop] + 'px' : computed
        }
    })
})

