/**
 +-------------------------------------------------------------------
 * leo-tools
 +-------------------------------------------------------------------
 * @version    1.0.0 beta
 * @author     leo
 +-------------------------------------------------------------------
 */

import {find, uniqueSort, matchesSelector} from "./selector"
import {$, contains} from "./core"
import {merge} from '../util'
import {$css} from "./css"
import {document} from "../constant"

export function $find(selector, findSelector) {
    selector = $(selector)

    let i,
        len = selector.length,
        ret = []

    if(typeof findSelector !== 'string') {
        return $(findSelector).filter(node => {
            for(i = 0; i < len; i++) {
                if(contains(selector[i], node)) {
                    return true
                }
            }
        })
    }

    for(i = 0; i < len; i++) {
        find(findSelector, selector[i], ret)
    }

    return len > 1 ? uniqueSort(ret) : ret
}

export function $add(selector, addSelector, context) {
    selector = $(selector)

    return uniqueSort(merge(selector, $(addSelector, context)))
}

export function $is(selector, isSelector) {
    selector = $(selector)

    let callback = typeof isSelector === 'string'
        ? el => {
            if(el.nodeType === 1) {
                return matchesSelector(el, isSelector)
            }
        }
        : isFunction(isSelector)
            ? (el, i) => {
                return !!isSelector(el, i)
            }
            : el => {
                return $(isSelector).some(node => {
                    return node === el
                })
            }

    return selector.some((el, i) => {
        return callback(el, i)
    })
}

export function $filter(selector, filterSelector) {
    selector = $(selector)

    let callback = isFunction(filterSelector)
        ? (el, i) => {
            return !!filterSelector(el, i)
        }
        : el => {
            return $is(el, filterSelector)
        }

    return selector.filter((el, i) => {
        return callback(el, i)
    })
}

export function $not(selector, notSelector) {
    selector = $(selector)

    let callback = isFunction(notSelector)
        ? (el, i) => {
            return !!notSelector(el, i)
        }
        : el => {
            return $is(el, notSelector)
        }

    return selector.filter((el, i) => {
        return !callback(el, i)
    })
}

export function $has(selector, hasSelector) {
    selector = $(selector)

    let targets = $(hasSelector, selector),
        l = targets.length

    return selector.filter(function(node) {
        for(let i = 0; i < l; i++) {
            if(contains(node, targets[i])) {
                return true
            }
        }
    })
}

export function $closest(selector, closestSelector, context) {
    selector = $(selector)

    let cur,
        i = 0,
        l = selector.length,
        matched = [],
        pos = typeof closestSelector !== 'string' ? $(closestSelector, context) : 0

    for(; i < l; i++) {
        for(cur = selector[i]; cur && cur !== context; cur = cur.parentNode) {
            if(
                cur.nodeType < 11 &&
                (pos ? pos.indexOf(cur) > -1 : cur.nodeType === 1 && matchesSelector(cur, closestSelector))
            ) {
                matched.push(cur)
                break
            }
        }
    }

    return matched.length > 1 ? uniqueSort(matched) : matched
}

export function $scrollParent(selector, includeHidden) {
    const position = $css(selector, 'position')
    const excludeStaticParent = position === "absolute"
    const overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/
    const scrollParent = $filter($parents(selector), (elem) => {
        if(excludeStaticParent && $css(elem, 'position') === 'static') {
            return false
        }
        return overflowRegex.test($css(elem, 'overflow') + $css(elem, 'overflow-y') +
            $css(elem, 'overflow-x'))
    })
    return position === "fixed" || !scrollParent.length ?
        $(selector)[0].ownerDocument || document :
        scrollParent[0]
}