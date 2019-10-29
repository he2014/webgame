/**
 +-------------------------------------------------------------------
 * leo-tools
 +-------------------------------------------------------------------
 * @version    1.0.0 beta
 * @author     leo
 +-------------------------------------------------------------------
 */

import {document, documentElement, indexOf} from '../constant'
import {generateId, merge} from '../util'
import {contains} from "./core"

function sortOrder(a, b) {
    if(a === b) {
        hasDuplicate = true
        return 0
    }

    let compare = !a.compareDocumentPosition - !b.compareDocumentPosition
    if(compare) {
        return compare
    }

    compare = (a.ownerDocument || a) === (b.ownerDocument || b) ?
        a.compareDocumentPosition(b) :
        1

    if(compare & 1) {
        if(a === document || a.ownerDocument === document &&
            contains(document, a)) {
            return -1
        }
        if(b === document || b.ownerDocument === document &&
            contains(document, b)) {
            return 1
        }

        return sortInput ?
            (indexOf.call(sortInput, a) - indexOf.call(sortInput, b)) :
            0
    }

    return compare & 4 ? -1 : 1
}

const rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g

function fcssescape(ch, asCodePoint) {
    if(asCodePoint) {
        if(ch === "\0") {
            return "\uFFFD"
        }

        return ch.slice(0, -1) + "\\" + ch.charCodeAt(ch.length - 1).toString(16) + " "
    }

    return "\\" + ch
}

export function escape(sel) {
    return (sel + "").replace(rcssescape, fcssescape)
}

let leoRandom = generateId('leoRandom')
let sortStable = leoRandom.split('').sort(sortOrder).join('') === leoRandom
let hasDuplicate
let sortInput

export function uniqueSort(results) {
    let elem,
        duplicates = [],
        j = 0,
        i = 0

    hasDuplicate = false
    sortInput = !sortStable && results.slice(0)
    results.sort(sortOrder)

    if(hasDuplicate) {
        while((elem = results[i++])) {
            if(elem === results[i]) {
                j = duplicates.push(i)
            }
        }
        while(j--) {
            results.splice(duplicates[j], 1)
        }
    }

    sortInput = null

    return results
}

const matches = documentElement.matches ||
    documentElement.webkitMatchesSelector ||
    documentElement.mozMatchesSelector ||
    documentElement.oMatchesSelector ||
    documentElement.msMatchesSelector

export function find(selector, context, results, seed) {
    let elem, nodeType,
        i = 0

    results = results || []
    context = context || document

    if(!selector || typeof selector !== "string") {
        return results
    }

    if((nodeType = context.nodeType) !== 1 && nodeType !== 9) {
        return []
    }

    if(seed) {
        while((elem = seed[i++])) {
            if(matchesSelector(elem, selector)) {
                results.push(elem)
            }
        }
    }else {
        merge(results, context.querySelectorAll(selector))
    }

    return results
}

export function matchesSelector(elem, expr) {
    return matches.call(elem, expr)
}

export function findMatches(expr, elements) {
    return find(expr, null, null, elements)
}

export function attr(elem, name) {
    return elem.getAttribute(name)
}

export function text(elem) {
    let node,
        ret = "",
        i = 0,
        nodeType = elem.nodeType

    if(!nodeType) {
        while((node = elem[i++])) {
            ret += text(node)
        }
    }else if(nodeType === 1 || nodeType === 9 || nodeType === 11) {
        return elem.textContent
    }else if(nodeType === 3 || nodeType === 4) {
        return elem.nodeValue
    }

    return ret
}