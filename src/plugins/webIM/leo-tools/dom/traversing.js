/**
 +-------------------------------------------------------------------
 * leo-tools
 +-------------------------------------------------------------------
 * @version    1.0.0 beta
 * @author     leo
 +-------------------------------------------------------------------
 */

import {concat} from '../constant'
import {$is, $filter} from './query'
import {$} from "./core"
import {nodeName} from '../util'
import {uniqueSort} from './selector'

function sibling(cur, dir) {
    while((cur = cur[dir]) && cur.nodeType !== 1) {
    }

    return cur
}

function dir(elem, dir, until) {
    let matched = [],
        truncate = until !== undefined

    while((elem = elem[dir]) && elem.nodeType !== 9) {
        if(elem.nodeType === 1) {
            if(truncate && $is(elem, until)) {
                break
            }

            matched.push(elem)
        }
    }

    return matched
}

function siblings(n, elem) {
    let matched = []

    for(; n; n = n.nextSibling) {
        if(n.nodeType === 1 && n !== elem) {
            matched.push(n)
        }
    }

    return matched
}

const rparentsprev = /^(?:parents|prev(?:Until|All))/

const guaranteedUnique = {
    children: true,
    contents: true,
    next: true,
    prev: true,
}

function warpTraversing(fn) {
    return (selector, until, treeSelector) => {
        selector = $(selector)

        let matched = selector.map((elem, i) => {
            return fn(elem, i, until)
        })

        matched = concat.apply([], matched)

        if(name.slice(-5) !== 'Until') {
            treeSelector = until
        }

        if(treeSelector && typeof treeSelector === 'string') {
            matched = $filter(matched, treeSelector)
        }

        if(selector.length > 1) {
            if(!guaranteedUnique[name]) {
                uniqueSort(matched)
            }

            if(rparentsprev.test(name)) {
                matched.reverse()
            }
        }

        return matched
    }
}

export const $parent = warpTraversing((elem) => {
    let parent = elem.parentNode
    return parent && parent.nodeType !== 11 ? parent : null
})

export const $parents = warpTraversing((elem) => {
    return dir(elem, 'parentNode')
})

export const $parentsUntil = warpTraversing((elem, i, until) => {
    return dir(elem, 'parentNode', until)
})

export const $next = warpTraversing((elem) => {
    return sibling(elem, "nextSibling")
})

export const $prev = warpTraversing((elem) => {
    return sibling(elem, "previousSibling")
})

export const $nextAll = warpTraversing((elem) => {
    return dir(elem, "nextSibling")
})

export const $prevAll = warpTraversing((elem) => {
    return dir(elem, "previousSibling")
})

export const $nextUntil = warpTraversing((elem, i, until) => {
    return dir(elem, "nextSibling", until)
})

export const $prevUntil = warpTraversing((elem, i, until) => {
    return dir(elem, "previousSibling", until)
})

export const $siblings = warpTraversing((elem) => {
    return siblings((elem.parentNode || {}).firstChild, elem)
})

export const $children = warpTraversing((elem) => {
    return siblings(elem.firstChild)
})

export const $contents = warpTraversing((elem) => {
    if(typeof elem.contentDocument !== "undefined") {
        return elem.contentDocument
    }

    if(nodeName(elem, 'template')) {
        elem = elem.content || elem
    }

    return merge([], elem.childNodes)
})