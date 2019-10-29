/**
 +-------------------------------------------------------------------
 * leo-tools
 +-------------------------------------------------------------------
 * @version    1.0.0 beta
 * @author     leo
 +-------------------------------------------------------------------
 */

import support from './support'
import {$, contains} from "./core"
import {document, documentElement} from '../constant'
import {isFunction, isPlainObject, extend, isWindow, camelCase} from '../util'

const pnum = (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source
export const rnumnonpx = new RegExp('^(' + pnum + ')(?!px)[a-z%]+$', 'i')
const rcssNum = new RegExp('^(?:([+-])=|)(' + pnum + ')([a-z%]*)$', 'i')
const cssExpand = ['Top', 'Right', 'Bottom', 'Left']
const rcustomProp = /^--/
const rboxStyle = new RegExp(cssExpand.join('|'), 'i')
const rdisplayswap = /^(none|table(?!-c[ea]).+)/
const cssShow = {
    position: 'absolute',
    visibility: 'hidden',
    display: 'block',
}
const cssNormalTransform = {
        letterSpacing: '0',
        fontWeight: '400',
    }

;(function() {
    let pixelPositionVal, boxSizingReliableVal, scrollboxSizeVal, pixelBoxStylesVal,
        reliableMarginLeftVal,
        container = document.createElement("div"),
        div = document.createElement("div")

    if(!div.style) {
        return
    }

    div.style.backgroundClip = "content-box"
    div.cloneNode(true).style.backgroundClip = ""
    support.clearCloneStyle = div.style.backgroundClip === "content-box"

    function computeStyleTests() {
        if(!div) {
            return
        }

        container.style.cssText = "position:absolute;left:-11111px;width:60px;" +
            "margin-top:1px;padding:0;border:0"
        div.style.cssText =
            "position:relative;display:block;box-sizing:border-box;overflow:scroll;" +
            "margin:auto;border:1px;padding:1px;" +
            "width:60%;top:1%"
        documentElement.appendChild(container).appendChild(div)

        let divStyle = window.getComputedStyle(div)
        pixelPositionVal = divStyle.top !== "1%"

        reliableMarginLeftVal = roundPixelMeasures(divStyle.marginLeft) === 12

        div.style.right = "60%"
        pixelBoxStylesVal = roundPixelMeasures(divStyle.right) === 36

        boxSizingReliableVal = roundPixelMeasures(divStyle.width) === 36

        div.style.position = "absolute"
        scrollboxSizeVal = roundPixelMeasures(div.offsetWidth / 3) === 12 || "absolute"

        documentElement.removeChild(container)

        div = null
    }

    function roundPixelMeasures(measure) {
        return Math.round(parseFloat(measure))
    }

    extend(support, {
        boxSizingReliable: function() {
            computeStyleTests()
            return boxSizingReliableVal
        },
        pixelBoxStyles: function() {
            computeStyleTests()
            return pixelBoxStylesVal
        },
        pixelPosition: function() {
            computeStyleTests()
            return pixelPositionVal
        },
        reliableMarginLeft: function() {
            computeStyleTests()
            return reliableMarginLeftVal
        },
        scrollboxSize: function() {
            computeStyleTests()
            return scrollboxSizeVal
        },
    })
}())

function swap(elem, options, callback, args) {
    let ret,
        name,
        old = {}

    for(name in options) {
        old[name] = elem.style[name]
        elem.style[name] = options[name]
    }

    ret = callback.apply(elem, args || [])

    for(name in options) {
        elem.style[name] = old[name]
    }

    return ret
}

const vendorProps = {}
const cssPrefixes = ['Webkit', 'Moz', 'ms']
const emptyStyle = document.createElement('div').style

function vendorPropName(name) {
    let capName = name[0].toUpperCase() + name.slice(1),
        i = cssPrefixes.length

    while(i--) {
        name = cssPrefixes[i] + capName
        if(name in emptyStyle) {
            return name
        }
    }
}

function finalPropName(name) {
    let final = cssProps[name] || vendorProps[name]

    if(final) {
        return final
    }
    if(name in emptyStyle) {
        return name
    }

    return vendorProps[name] = vendorPropName(name) || name
}

function adjustCSS(elem, prop, valueParts) {
    let adjusted,
        scale,
        maxIterations = 20,
        currentValue = function() {
            return css(elem, prop, '')
        },
        initial = currentValue(),
        unit = (valueParts && valueParts[3]) || (cssNumber[prop] ? '' : 'px'),
        initialInUnit = elem.nodeType && (cssNumber[prop] || (unit !== 'px' && +initial)) && rcssNum.exec(css(elem, prop))

    if(initialInUnit && initialInUnit[3] !== unit) {
        initial = initial / 2
        unit = unit || initialInUnit[3]
        initialInUnit = +initial || 1

        while(maxIterations--) {
            style(elem, prop, initialInUnit + unit)
            if(
                (1 - scale) * (1 - (scale = currentValue() / initial || 0.5)) <= 0
            ) {
                maxIterations = 0
            }
            initialInUnit = initialInUnit / scale
        }

        initialInUnit = initialInUnit * 2
        style(elem, prop, initialInUnit + unit)

        valueParts = valueParts || []
    }

    if(valueParts) {
        initialInUnit = +initialInUnit || +initial || 0

        adjusted = valueParts[1]
            ? initialInUnit + (valueParts[1] + 1) * valueParts[2]
            : +valueParts[2]
    }
    return adjusted
}

function getStyles(elem) {
    let view = elem.ownerDocument.defaultView

    if(!view || !view.opener) {
        view = window
    }

    return view.getComputedStyle(elem)
}

export function curCSS(elem, name, computed) {
    let width,
        minWidth,
        maxWidth,
        ret,
        style = elem.style

    computed = computed || getStyles(elem)

    if(computed) {
        ret = computed.getPropertyValue(name) || computed[name]

        if(ret === '' && !contains(elem.ownerDocument, elem)) {
            ret = style(elem, name)
        }

        if(
            !support.pixelBoxStyles() &&
            rnumnonpx.test(ret) &&
            rboxStyle.test(name)
        ) {
            width = style.width
            minWidth = style.minWidth
            maxWidth = style.maxWidth

            style.minWidth = style.maxWidth = style.width = ret
            ret = computed.width

            style.width = width
            style.minWidth = minWidth
            style.maxWidth = maxWidth
        }
    }

    return ret !== undefined ? ret + '' : ret
}

export function addGetHookIf(conditionFn, hookFn) {
    return {
        get: function() {
            if(conditionFn()) {
                delete this.get
                return
            }

            return (this.get = hookFn).apply(this, arguments)
        },
    }
}

function setPositiveNumber(elem, value, subtract) {
    let matches = rcssNum.exec(value)

    return matches ? Math.max(0, matches[2] - (subtract || 0)) + (matches[3] || 'px') : value
}

function boxModelAdjustment(elem, dimension, box, isBorderBox, styles, computedVal) {
    let i = dimension === 'width' ? 1 : 0,
        extra = 0,
        delta = 0

    if(box === (isBorderBox ? 'border' : 'content')) {
        return 0
    }

    for(; i < 4; i += 2) {
        if(box === 'margin') {
            delta += css(elem, box + cssExpand[i], true, styles)
        }

        if(!isBorderBox) {
            delta += css(elem, 'padding' + cssExpand[i], true, styles)
            if(box !== 'padding') {
                delta += css(elem, 'border' + cssExpand[i] + 'Width', true, styles)
            }else {
                extra += css(elem, 'border' + cssExpand[i] + 'Width', true, styles)
            }
        }else {
            if(box === 'content') {
                delta -= css(elem, 'padding' + cssExpand[i], true, styles)
            }
            if(box !== 'margin') {
                delta -= css(elem, 'border' + cssExpand[i] + 'Width', true, styles)
            }
        }
    }
    if(!isBorderBox && computedVal >= 0) {
        delta += Math.max(
            0,
            Math.ceil(
                elem['offset' + dimension[0].toUpperCase() + dimension.slice(1)] - computedVal - delta - extra - 0.5,
            ),
        )
    }

    return delta
}

function getWidthOrHeight(elem, dimension, extra) {
    let styles = getStyles(elem),
        val = curCSS(elem, dimension, styles),
        isBorderBox = css(elem, 'boxSizing', false, styles) === 'border-box',
        valueIsBorderBox = isBorderBox

    if(rnumnonpx.test(val)) {
        if(!extra) {
            return val
        }
        val = 'auto'
    }

    valueIsBorderBox = valueIsBorderBox && (support.boxSizingReliable() || val === elem.style[dimension])

    if(val === 'auto' || (!parseFloat(val) && css(elem, 'display', false, styles) === 'inline')) {
        val = elem['offset' + dimension[0].toUpperCase() + dimension.slice(1)]

        valueIsBorderBox = true
    }

    val = parseFloat(val) || 0

    return (
        val +
        boxModelAdjustment(
            elem,
            dimension,
            extra || (isBorderBox ? 'border' : 'content'),
            valueIsBorderBox,
            styles,
            val,
        ) +
        'px'
    )
}

export const cssHooks = {
    opacity: {
        get: function(elem, computed) {
            if(computed) {
                let ret = curCSS(elem, 'opacity')

                return ret === '' ? '1' : ret
            }
        },
    },
}

export const cssNumber = {
    "animationIterationCount": true,
    "columnCount": true,
    "fillOpacity": true,
    "flexGrow": true,
    "flexShrink": true,
    "fontWeight": true,
    "lineHeight": true,
    "opacity": true,
    "order": true,
    "orphans": true,
    "widows": true,
    "zIndex": true,
    "zoom": true,
}

const cssProps = {}

function style(elem, name, value, extra) {
    if(!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
        return
    }

    let ret,
        type,
        hooks,
        origName = camelCase(name),
        isCustomProp = rcustomProp.test(name),
        style = elem.style

    if(!isCustomProp) {
        name = finalPropName(origName)
    }

    hooks = cssHooks[name] || cssHooks[origName]

    if(value !== undefined) {
        type = typeof value

        if(type === 'string' && (ret = rcssNum.exec(value)) && ret[1]) {
            value = adjustCSS(elem, name, ret)

            type = 'number'
        }

        if(value == null || value !== value) {
            return
        }

        if(type === 'number') {
            value += (ret && ret[3]) || (cssNumber[origName] ? '' : 'px')
        }

        if(!support.clearCloneStyle && value === '' && name.indexOf('background') === 0) {
            style[name] = 'inherit'
        }

        if(!hooks || !('set' in hooks) || (value = hooks.set(elem, value, extra)) !== undefined) {
            if(isCustomProp) {
                style.setProperty(name, value)
            }else {
                style[name] = value
            }
        }
    }else {
        if(hooks && 'get' in hooks && (ret = hooks.get(elem, false, extra)) !== undefined) {
            return ret
        }

        return style[name]
    }
}

export function css(elem, name, extra, styles) {
    let val,
        num,
        hooks,
        origName = camelCase(name),
        isCustomProp = rcustomProp.test(name)

    if(!isCustomProp) {
        name = finalPropName(origName)
    }

    hooks = cssHooks[name] || cssHooks[origName]

    if(hooks && 'get' in hooks) {
        val = hooks.get(elem, true, extra)
    }

    if(val === undefined) {
        val = curCSS(elem, name, styles)
    }

    if(val === 'normal' && name in cssNormalTransform) {
        val = cssNormalTransform[name]
    }

    if(extra === '' || extra) {
        num = parseFloat(val)
        return extra === true || isFinite(num) ? num || 0 : val
    }

    return val
}

export function $css(selector, name, value) {
    if(isPlainObject(name)) {
        for(let n in name) {
            $css(selector, n, name[n])
        }

        return
    }

    selector = $(selector)

    if(Array.isArray(name)) {
        let i = 0,
            elem = selector[0],
            map = {},
            styles = getStyles(elem),
            len = name.length

        for(; i < len; i++) {
            map[name[i]] = css(elem, name[i], false, styles)
        }

        return map
    }

    if(value === undefined) {
        return css(selector[0], name)
    }

    let callback = isFunction(value)
        ? (node, i) => {
            style(node, name, value(node, i, css(node, name)))
        }
        : (node, i) => {
            style(node, name, value)
        }

    selector.forEach((node, i) => {
        callback(node, i)
    })
}

;['height', 'width'].forEach(dimension => {
    cssHooks[dimension] = {
        get(elem, computed, extra) {
            if(computed) {
                return rdisplayswap.test(css(elem, 'display')) &&
                (!elem.getClientRects().length || !elem.getBoundingClientRect().width)
                    ? swap(elem, cssShow, function() {
                        return getWidthOrHeight(elem, dimension, extra)
                    })
                    : getWidthOrHeight(elem, dimension, extra)
            }
        },

        set(elem, value, extra) {
            let matches,
                styles = getStyles(elem),
                scrollBoxSize = support.scrollboxSize() === styles.position,
                boxSizingNeeded = scrollBoxSize || extra,
                isBorderBox = boxSizingNeeded && css(elem, "boxSizing", false, styles) === "border-box",
                subtract = extra ? boxModelAdjustment(elem, dimension, extra, isBorderBox, styles) : 0

            if(isBorderBox && scrollBoxSize) {
                subtract -= Math.ceil(
                    elem["offset" + dimension[0].toUpperCase() + dimension.slice(1)] -
                    parseFloat(styles[dimension]) -
                    boxModelAdjustment(elem, dimension, "border", false, styles) -
                    0.5,
                )
            }

            if(subtract && (matches = rcssNum.exec(value)) && (matches[3] || 'px') !== 'px') {
                elem.style[dimension] = value
                value = css(elem, dimension)
            }

            return setPositiveNumber(elem, value, subtract)
        },
    }
})

cssHooks.marginLeft = addGetHookIf(support.reliableMarginLeft, function(elem, computed) {
    if(computed) {
        return (
            (parseFloat(curCSS(elem, 'marginLeft')) ||
                elem.getBoundingClientRect().left -
                swap(elem, {marginLeft: 0}, function() {
                    return elem.getBoundingClientRect().left
                })) + 'px'
        )
    }
})

function dimensionsWarp(funcName, name, type, defaultExtra = true) {
    return function dimensions(selector, margin, value) {
        selector = $(selector)

        let extra = defaultExtra || (margin === true || value === true ? 'margin' : 'border')

        value = arguments.length > 1 && (defaultExtra || typeof margin !== "boolean") ? margin : value

        if(value === undefined || typeof value === 'boolean') {
            let elem = selector[0]

            if(isWindow(elem)) {
                return funcName.indexOf('outer') === 0
                    ? elem['inner' + name]
                    : elem.document.documentElement['client' + name]
            }

            if(elem.nodeType === 9) {
                let doc = elem.documentElement

                return Math.max(
                    elem.body['scroll' + name],
                    doc['scroll' + name],
                    elem.body['offset' + name],
                    doc['offset' + name],
                    doc['client' + name],
                )
            }

            return css(elem, type, extra)
        }

        let callback = isFunction(value)
            ? (node, i) => {
                style(node, type, value(node, i, dimensions(node)), extra)
            }
            : (node, i) => {
                style(node, type, value, extra)
            }

        selector.forEach((node, i) => {
            callback(node, i)
        })
    }
}

export const $innerHeight = dimensionsWarp('$innerHeight', 'Height', 'height')
export const $height = dimensionsWarp('$height', 'Height', 'height')
export const $outerHeight = dimensionsWarp('$outerHeight', 'Height', 'height', false)
export const $innerWidth = dimensionsWarp('$innerWidth', 'Width', 'width')
export const $width = dimensionsWarp('$width', 'Width', 'width')
export const $outerWidth = dimensionsWarp('$outerWidth', 'Width', 'width', false)

