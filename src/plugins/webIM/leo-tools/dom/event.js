/**
 +-------------------------------------------------------------------
 * leo-tools
 +-------------------------------------------------------------------
 * @version    1.0.0 beta
 * @author     leo
 +-------------------------------------------------------------------
 */

import {$} from "./core"
import {extend} from '../util'
import {document, slice} from '../constant'
import {$closest} from './query'

let _zid = 1,
    isString = function(obj) {
        return typeof obj == 'string'
    },
    handlers = {},
    specialEvents = {},
    focusinSupported = 'onfocusin' in window,
    focus = {
        focus: 'focusin',
        blur: 'focusout',
    },
    hover = {
        mouseenter: 'mouseover',
        mouseleave: 'mouseout',
    }

specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

function zid(element) {
    return element._zid || (element._zid = _zid++)
}

function findHandlers(element, event, fn, selector) {
    event = parse(event)

    let matcher

    if(event.ns) {
        matcher = matcherFor(event.ns)
    }

    return (handlers[zid(element)] || []).filter(function(handler) {
        return (
            handler &&
            (!event.e || handler.e == event.e) &&
            (!event.ns || matcher.test(handler.ns)) &&
            (!fn || zid(handler.fn) === zid(fn)) &&
            (!selector || handler.sel == selector)
        )
    })
}

function parse(event) {
    let parts = ('' + event).split('.')

    return {
        e: parts[0],
        ns: parts.slice(1).sort().join(' '),
    }
}

function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
}

function eventCapture(handler, captureSetting) {
    if(typeof captureSetting !== 'undefined') {
        return captureSetting
    }

    return handler.del && (!focusinSupported && handler.e in focus)
}

function realEvent(type) {
    return hover[type] || (focusinSupported && focus[type]) || type
}

function add(element, events, fn, data, selector, delegator, capture) {
    let id = zid(element),
        set = handlers[id] || (handlers[id] = [])

    events.split(/\s/).forEach(function(event) {
        if(event == 'ready') {
            return ready(fn)
        }

        let handler = parse(event)

        handler.fn = fn
        handler.sel = selector

        if(handler.e in hover) {
            fn = function(e) {
                let related = e.relatedTarget

                if(!related || (related !== this && !contains(this, related))) {
                    return handler.fn.apply(this, arguments)
                }
            }
        }

        handler.del = delegator

        let callback = delegator || fn

        handler.proxy = function(e) {
            e = compatible(e)

            if(e.isImmediatePropagationStopped()) {
                return
            }

            e.data = data

            let result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))

            if(result === false) {
                e.preventDefault()
                e.stopPropagation()
            }

            return result
        }

        handler.i = set.length
        set.push(handler)

        if('addEventListener' in element) {
            element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
        }
    })
}

function remove(element, events, fn, selector, capture) {
    let id = zid(element)
    ;(events || '').split(/\s/).forEach(function(event) {
        findHandlers(element, event, fn, selector).forEach(function(handler) {
            delete handlers[id][handler.i]

            if('removeEventListener' in element) {
                element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
            }
        })
    })
}

const returnTrue = function() {
        return true
    },
    returnFalse = function() {
        return false
    },
    ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$|webkitMovement[XY]$)/,
    eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped',
    }

function compatible(event, source) {
    if(source || !event.isDefaultPrevented) {
        source || (source = event)

        for(let name in eventMethods) {
            let sourceMethod = source[name]
            let predicate = eventMethods[name]

            event[name] = function() {
                this[predicate] = returnTrue

                return sourceMethod && sourceMethod.apply(source, arguments)
            }

            event[predicate] = returnFalse
        }

        try {
            event.timeStamp || (event.timeStamp = Date.now())
        }catch(ignored) {
        }

        if(
            source.defaultPrevented !== undefined
                ? source.defaultPrevented
                : 'returnValue' in source
                ? source.returnValue === false
                : source.getPreventDefault && source.getPreventDefault()
        ) {
            event.isDefaultPrevented = returnTrue
        }
    }

    return event
}

function createProxy(event) {
    let key,
        proxy = {
            originalEvent: event,
        }

    for(key in event) {
        if(!ignoreProperties.test(key) && event[key] !== undefined) {
            proxy[key] = event[key]
        }
    }

    return compatible(proxy, event)
}

export function $on({elems, event, selector, data, callback, one, capture}) {
    let autoRemove, delegator

    if(event && !isString(event)) {
        for(let type in event) {
            let fn = event[type]

            $on({elems, event: type, selector, data, callback: fn, one})
        }

        return
    }

    if(callback === false) {
        callback = returnFalse
    }

    $(elems).forEach(element => {
        if(one) {
            autoRemove = function(e) {
                remove(element, e.type, callback)
                return callback.apply(this, arguments)
            }
        }

        if(selector) {
            delegator = function(e) {
                let evt,
                    match = $closest(e.target, selector, element)[0]

                if(match && match !== element) {
                    evt = extend(createProxy(e), {
                        currentTarget: match,
                        liveFired: element,
                    })

                    return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
                }
            }
        }

        add(element, event, callback, data, selector, delegator || autoRemove, capture)
    })
}

export function $one({elems, event, selector, data, callback}) {
    return $on({elems, event, selector, data, callback, one: true})
}

export function $off({elems, event, selector, callback, capture}) {
    if(event && !isString(event)) {
        for(let type in event) {
            let fn = event[type]

            $off({elems, event: type, selector, callback: fn})
        }

        return
    }

    if(callback === false) {
        callback = returnFalse
    }

    $(elems).forEach(elem => {
        remove(elem, event, callback, selector, capture)
    })
}

export function $trigger(selector, event, args) {
    event = isString(event) || isPlainObject(event) ? Event(event) : compatible(event)
    event._args = args

    $(selector).forEach(elem => {
        if(event.type in focus && typeof elem[event.type] == 'function') {
            elem[event.type]()
        }else if('dispatchEvent' in elem) {
            elem.dispatchEvent(event)
        }else {
            $triggerHandler(elem, event, args)
        }
    })
}

export function $triggerHandler(selector, event, args) {
    let e, result

    $(selector).forEach((element, i) => {
        e = createProxy(isString(event) ? Event(event) : event)
        e._args = args
        e.target = element
        findHandlers(element, event.type || event).some(function(handler, i) {
            result = handler.proxy(e)

            if(e.isImmediatePropagationStopped()) {
                return true
            }
        })
    })

    return result
}

export function Event(type, props) {
    if(!isString(type)) {
        props = type
        type = props.type
    }

    let event = document.createEvent(specialEvents[type] || 'Events'),
        bubbles = true

    if(props) {
        for(let name in props) {
            name == 'bubbles' ? (bubbles = !!props[name]) : (event[name] = props[name])
        }
    }

    event.initEvent(type, bubbles, true)

    return compatible(event)
}

let passiveSupported = 'notTest'

export function getPassiveSupported() {
    if(passiveSupported !== 'notTest'){
        return passiveSupported
    }

    passiveSupported = false

    try {
        const options = Object.defineProperty({}, "passive", {
            get: function() {
                passiveSupported = true
            },
        })

        window.addEventListener("test", null, options)
    }catch(err) {
    }

    return passiveSupported
}

