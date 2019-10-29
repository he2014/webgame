/**
 +-------------------------------------------------------------------
 * leo-tools
 +-------------------------------------------------------------------
 * @version    1.0.0 beta
 * @author     leo
 +-------------------------------------------------------------------
 */

import {$} from "./core"
import {isFunction, isXMLDoc, isPlainObject, nodeName} from '../util'
import support from './support'

{
    let input = document.createElement('input'),
        select = document.createElement('select'),
        opt = select.appendChild(document.createElement('option'))

    input.type = 'checkbox'

    support.checkOn = input.value !== ''

    support.optSelected = opt.selected

    input = document.createElement('input')
    input.value = 't'
    input.type = 'radio'
    support.radioValue = input.value === 't'
}

const propFix = {
        for: 'htmlFor',
        class: 'className',
    }

;[
    'tabIndex',
    'readOnly',
    'maxLength',
    'cellSpacing',
    'cellPadding',
    'rowSpan',
    'colSpan',
    'useMap',
    'frameBorder',
    'contentEditable',
].forEach(item => {
    propFix[item.toLowerCase()] = item
})

const rfocusable = /^(?:input|select|textarea|button)$/i
const rclickable = /^(?:a|area)$/i
const propHooks = {
    tabIndex: {
        get: function(elem) {
            let tabindex = elem.getAttribute('tabindex')

            if(tabindex) {
                return parseInt(tabindex, 10)
            }

            if(rfocusable.test(elem.nodeName) || (rclickable.test(elem.nodeName) && elem.href)) {
                return 0
            }

            return -1
        },
    },
}

if(!support.optSelected) {
    propHooks.selected = {
        get: function(elem) {
            let parent = elem.parentNode
            if(parent && parent.parentNode) {
                parent.parentNode.selectedIndex
            }
            return null
        },
        set: function(elem) {
            let parent = elem.parentNode
            if(parent) {
                parent.selectedIndex

                if(parent.parentNode) {
                    parent.parentNode.selectedIndex
                }
            }
        },
    }
}

function prop(elem, name, value) {
    let ret,
        hooks,
        nType = elem.nodeType

    if(nType === 3 || nType === 8 || nType === 2) {
        return
    }

    if(nType !== 1 || !isXMLDoc(elem)) {
        name = propFix[name] || name
        hooks = propHooks[name]
    }

    if(value !== undefined) {
        if(hooks && 'set' in hooks && (ret = hooks.set(elem, value, name)) !== undefined) {
            return ret
        }

        return (elem[name] = value)
    }

    if(hooks && 'get' in hooks && (ret = hooks.get(elem, name)) !== null) {
        return ret
    }

    return elem[name]
}

export function $prop(selector, name, value) {
    if(isPlainObject(name)) {
        for(let n in name) {
            $prop(selector, n, name[n])
        }

        return
    }

    selector = $(selector)

    if(value === undefined) {
        return prop(selector[0], name)
    }

    let callback = isFunction(value)
        ? (node, i) => {
            prop(node, name, value(node, i, prop(node, name)))
        }
        : (node, i) => {
            prop(node, name, value)
        }

    selector.forEach((node, i) => {
        callback(node, i)
    })
}

export function $removeProp(selector, name) {
    $(selector).forEach(node => {
        delete node[name]
    })
}

const attrHooks = {
    type: {
        set: function(elem, value) {
            if(!support.radioValue && value === 'radio' && nodeName(elem, 'input')) {
                let val = elem.value
                elem.setAttribute('type', value)
                if(val) {
                    elem.value = val
                }
                return value
            }
        },
    },
}

function attr(elem, name, value) {
    let nType = elem.nodeType,
        hooks,
        ret

    if(nType === 3 || nType === 8 || nType === 2) {
        return
    }

    if(typeof elem.getAttribute === 'undefined') {
        return prop(elem, name, value)
    }

    if(nType !== 1 || !isXMLDoc(elem)) {
        hooks = attrHooks[name.toLowerCase()]
    }

    if(value !== undefined) {
        if(value === null) {
            removeAttr(elem, name)
            return
        }

        if(hooks && 'set' in hooks && (ret = hooks.set(elem, value, name)) !== undefined) {
            return ret
        }

        elem.setAttribute(name, value + '')

        return value
    }

    if(hooks && 'get' in hooks && (ret = hooks.get(elem, name)) !== null) {
        return ret
    }

    ret = elem.getAttribute(name)

    return ret == null ? undefined : ret
}

export function $attr(selector, name, value) {
    if(isPlainObject(name)) {
        for(let n in name) {
            $attr(selector, n, name[n])
        }

        return
    }

    selector = $(selector)

    if(value === undefined) {
        return attr(selector[0], name)
    }

    let callback = isFunction(value)
        ? (node, i) => {
            attr(node, name, value(node, i, attr(node, name)))
        }
        : (node, i) => {
            attr(node, name, value)
        }

    selector.forEach((node, i) => {
        callback(node, i)
    })
}

const rnothtmlwhite = /[^\x20\t\r\n\f]+/g

function removeAttr(elem, value) {
    let name,
        i = 0,
        attrNames = value && value.match(rnothtmlwhite)

    if(attrNames && elem.nodeType === 1) {
        while((name = attrNames[i++])) {
            elem.removeAttribute(name)
        }
    }
}

export function $removeAttr(selector, name) {
    $(selector).forEach(node => {
        removeAttr(node, name)
    })
}

const rreturn = /\r/g

function stripAndCollapse(value) {
    let tokens = value.match(rnothtmlwhite) || []
    return tokens.join(' ')
}

const valHooks = {
        option: {
            get(elem) {
                let val = elem.getAttribute('value')
                return val != null ? val : stripAndCollapse(text(elem))
            },
        },
        select: {
            get(elem) {
                let value,
                    option,
                    options = elem.options,
                    index = elem.selectedIndex,
                    one = elem.type === 'select-one',
                    values = one ? null : [],
                    max = one ? index + 1 : options.length,
                    i = index < 0 ? max : one ? index : 0

                for(; i < max; i++) {
                    option = options[i]
                    if(
                        (option.selected || i === index) &&
                        !option.disabled &&
                        (!option.parentNode.disabled || !nodeName(option.parentNode, 'optgroup'))
                    ) {
                        value = $val(option)

                        if(one) {
                            return value
                        }

                        values.push(value)
                    }
                }

                return values
            },

            set(elem, value) {
                let optionSet,
                    option,
                    options = elem.options,
                    values = Array.isArray(value) ? value : [value],
                    i = options.length

                while(i--) {
                    option = options[i]

                    if((option.selected = values.indexOf(valHooks.option.get(option)) > -1)) {
                        optionSet = true
                    }
                }

                if(!optionSet) {
                    elem.selectedIndex = -1
                }

                return values
            },
        },
    }

;['radio', 'checkbox'].forEach(name => {
    valHooks[name] = {
        set: function(elem, value) {
            if(Array.isArray(value)) {
                return (elem.checked = value.indexOf($val(elem)) > -1)
            }
        },
    }

    if(!support.checkOn) {
        valHooks[name].get = function(elem) {
            return elem.getAttribute('value') === null ? 'on' : elem.value
        }
    }
})

export function $val(selector, value) {
    selector = $(selector)

    let hooks, ret

    if(arguments.length === 1) {
        let elem = selector[0]

        if(elem) {
            hooks = valHooks[elem.type] || valHooks[elem.nodeName.toLowerCase()]

            if(hooks && 'get' in hooks && (ret = hooks.get(elem, 'value')) !== undefined) {
                return ret
            }

            ret = elem.value

            return typeof ret === 'string' ? ret.replace(rreturn, '') : ret == null ? '' : ret
        }

        return
    }

    let valueIsFunction = isFunction(value)

    selector.forEach((node, i) => {
        if(node.nodeType !== 1) {
            return
        }

        let val

        if(valueIsFunction) {
            val = value(node, i, $val(node))
        }else {
            val = value
        }

        if(val == null) {
            val = ''
        }else if(typeof val === 'number') {
            val += ''
        }else if(Array.isArray(val)) {
            val = val.map(value => {
                return value == null ? '' : value + ''
            })
        }

        hooks = valHooks[node.type] || valHooks[node.nodeName.toLowerCase()]

        if(!hooks || !('set' in hooks) || hooks.set(node, val, 'value') === undefined) {
            node.value = val
        }
    })
}

function classesToArray(value) {
    if(Array.isArray(value)) {
        return value
    }
    if(typeof value === "string") {
        return value.match(rnothtmlwhite) || []
    }
    return []
}

function getClass(elem) {
    return (elem.getAttribute && elem.getAttribute('class')) || ''
}

export function $addClass(selector, value) {
    selector = $(selector)

    if(isFunction(value)) {
        selector.forEach((node, i) => {
            $addClass(node, value(node, i, getClass(node)))
        })

        return
    }

    let classes = classesToArray(value)

    if(classes.length) {
        let cur,
            curValue,
            clazz,
            j,
            finalValue

        selector.forEach((elem, i) => {
            curValue = getClass(elem)
            cur = elem.nodeType === 1 && (' ' + stripAndCollapse(curValue) + ' ')

            if(cur) {
                j = 0

                while((clazz = classes[j++])) {
                    if(cur.indexOf(' ' + clazz + ' ') < 0) {
                        cur += clazz + ' '
                    }
                }

                finalValue = stripAndCollapse(cur)

                if(curValue !== finalValue) {
                    elem.setAttribute('class', finalValue)
                }
            }
        })
    }
}

export function $removeClass(selector, value) {
    selector = $(selector)

    if(isFunction(value)) {
        selector.forEach((node, i) => {
            $removeClass(node, value(node, i, getClass(node)))
        })

        return
    }

    if(typeof value === 'undefined') {
        return elem.setAttribute('class', '')
    }

    let classes = classesToArray(value)

    if(classes.length) {
        let cur,
            curValue,
            clazz,
            j,
            finalValue

        selector.forEach((elem, i) => {
            curValue = getClass(elem)
            cur = elem.nodeType === 1 && (' ' + stripAndCollapse(curValue) + ' ')

            if(cur) {
                j = 0

                while((clazz = classes[j++])) {
                    while(cur.indexOf(' ' + clazz + ' ') > -1) {
                        cur = cur.replace(' ' + clazz + ' ', ' ')
                    }
                }

                finalValue = stripAndCollapse(cur)

                if(curValue !== finalValue) {
                    elem.setAttribute('class', finalValue)
                }
            }
        })
    }
}

export function $toggleClass(selector, value, stateVal) {
    let type = typeof value

    selector = $(selector)

    if(typeof stateVal === "boolean" && type === "string") {
        return stateVal ? $addClass(selector, value) : $removeClass(selector, value)
    }

    if(isFunction(value)) {
        selector.forEach((node, i) => {
            $toggleClass(node, value(node, i, getClass(node), stateVal), stateVal)
        })

        return
    }

    selector.forEach((node, i) => {
        if(type === 'string') {
            let i = 0,
                className,
                classNames = classesToArray(value)

            while((className = classNames[i++])) {
                if($hasClass(node, className)) {
                    $removeClass(node, className)
                }else {
                    $addClass(node, className)
                }
            }
        }
    })
}

export function $hasClass(selector, className) {
    selector = $(selector)
    className = ' ' + className + ' '

    let i = 0,
        l = selector.length

    for(; i < l; i++) {
        if(selector[i].nodeType === 1 && (' ' + stripAndCollapse(getClass(elem)) + ' ').indexOf(className) > -1) {
            return true
        }
    }

    return false
}


