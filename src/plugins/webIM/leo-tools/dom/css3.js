/**
 +-------------------------------------------------------------------
 * leo-tools
 +-------------------------------------------------------------------
 * @version    1.0.0 beta
 * @author     leo
 +-------------------------------------------------------------------
 */

import {$css, cssHooks, cssNumber} from './css.js'
import {extend} from '../util'
import support from './support'

let div = document.createElement('div')

function getVendorPropertyName(prop) {
    if(prop in div.style) return prop

    let prefixes = ['Moz', 'Webkit', 'O', 'ms']
    let prop_ = prop.charAt(0).toUpperCase() + prop.substr(1)

    for(let i = 0; i < prefixes.length; ++i) {
        let vendorProp = prefixes[i] + prop_
        if(vendorProp in div.style) {
            return vendorProp
        }
    }
}

function checkTransform3dSupport() {
    div.style[support.transform] = ''
    div.style[support.transform] = 'rotateY(90deg)'
    return div.style[support.transform] !== ''
}

const isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1

support.transition = getVendorPropertyName('transition')
support.transitionDelay = getVendorPropertyName('transitionDelay')
support.transform = getVendorPropertyName('transform')
support.transformOrigin = getVendorPropertyName('transformOrigin')
support.filter = getVendorPropertyName('Filter')
support.transform3d = checkTransform3dSupport()

const eventNames = {
    'transition': 'transitionend',
    'MozTransition': 'transitionend',
    'OTransition': 'oTransitionEnd',
    'WebkitTransition': 'webkitTransitionEnd',
    'msTransition': 'MSTransitionEnd',
}

support.transitionEnd = eventNames[support.transition] || null

div = null

const transformMap = new WeakMap()

cssHooks['transit:transform'] = {
    get(elem) {
        return transformMap.get(elem) || new Transform()
    },

    set(elem, v) {
        let value = v

        if(!(value instanceof Transform)) {
            value = new Transform(value)
        }

        if(support.transform === 'WebkitTransform' && !isChrome) {
            elem.style[support.transform] = value.toString(true)
        }else {
            elem.style[support.transform] = value.toString()
        }

        transformMap.set(elem, value)
    },
}

cssHooks.transform = {
    set: cssHooks['transit:transform'].set,
}

cssHooks.filter = {
    get: function(elem) {
        return elem.style[support.filter]
    },

    set: function(elem, value) {
        elem.style[support.filter] = value
    },
}

registerCssHook('scale')
registerCssHook('scaleX')
registerCssHook('scaleY')
registerCssHook('translate')
registerCssHook('rotate')
registerCssHook('rotateX')
registerCssHook('rotateY')
registerCssHook('rotate3d')
registerCssHook('perspective')
registerCssHook('skewX')
registerCssHook('skewY')
registerCssHook('x', true)
registerCssHook('y', true)

function registerCssHook(prop, isPixels) {
    if(!isPixels) {
        cssNumber[prop] = true
    }

    cssHooks[prop] = {
        get(elem) {
            return $css(elem, 'transit:transform').get(prop)
        },

        set(elem, value) {
            let t = $css(elem, 'transit:transform')
            t.setFromString(prop, value)

            $css(elem, {
                'transit:transform': t,
            })
        },
    }
}

function Transform(str) {
    if(typeof str === 'string') {
        this.parse(str)
    }
    return this
}

const reparse = /([a-zA-Z0-9]+)\((.*?)\)/g

extend(Transform.prototype, {
    setFromString(prop, val) {
        let args =
            (typeof val === 'string') ? val.split(',') :
                (Array.isArray(val)) ? val :
                    [val]

        args.unshift(prop)
        Transform.prototype.set.apply(this, args)
    },

    set(prop) {
        let args = Array.prototype.slice.apply(arguments, [1])

        if(this.setter[prop]) {
            this.setter[prop].apply(this, args)
        }else {
            this[prop] = args.join(',')
        }
    },

    get(prop) {
        if(this.getter[prop]) {
            return this.getter[prop].apply(this)
        }else {
            return this[prop] || 0
        }
    },

    setter: {
        rotate(theta) {
            this.rotate = unit(theta, 'deg')
        },

        rotateX(theta) {
            this.rotateX = unit(theta, 'deg')
        },

        rotateY(theta) {
            this.rotateY = unit(theta, 'deg')
        },

        scale(x, y) {
            if(y === undefined) {
                y = x
            }

            this.scale = x + "," + y
        },

        skewX(x) {
            this.skewX = unit(x, 'deg')
        },

        skewY(y) {
            this.skewY = unit(y, 'deg')
        },

        perspective(dist) {
            this.perspective = unit(dist, 'px')
        },

        x(x) {
            this.set('translate', x, null)
        },

        y(y) {
            this.set('translate', null, y)
        },

        translate(x, y) {
            if(this._translateX === undefined) {
                this._translateX = 0
            }
            if(this._translateY === undefined) {
                this._translateY = 0
            }

            if(x !== null && x !== undefined) {
                this._translateX = unit(x, 'px')
            }
            if(y !== null && y !== undefined) {
                this._translateY = unit(y, 'px')
            }

            this.translate = this._translateX + "," + this._translateY
        },
    },

    getter: {
        x() {
            return this._translateX || 0
        },

        y() {
            return this._translateY || 0
        },

        scale() {
            let s = (this.scale || "1,1").split(',')

            if(s[0]) {
                s[0] = parseFloat(s[0])
            }
            if(s[1]) {
                s[1] = parseFloat(s[1])
            }

            return (s[0] === s[1]) ? s[0] : s
        },

        rotate3d() {
            let s = (this.rotate3d || "0,0,0,0deg").split(',')

            for(let i = 0; i <= 3; ++i) {
                if(s[i]) {
                    s[i] = parseFloat(s[i])
                }
            }
            if(s[3]) {
                s[3] = unit(s[3], 'deg')
            }

            return s
        },
    },

    parse(str) {
        str.replace(reparse, function(x, prop, val) {
            this.setFromString(prop, val)
        }.bind(this))
    },

    toString(use3d) {
        let re = []

        for(let i in this) {
            if(this.hasOwnProperty(i)) {
                if((!support.transform3d) && (
                    (i === 'rotateX') ||
                    (i === 'rotateY') ||
                    (i === 'perspective') ||
                    (i === 'transformOrigin'))) {
                    continue
                }

                if(i[0] !== '_') {
                    if(use3d && (i === 'scale')) {
                        re.push(i + "3d(" + this[i] + ",1)")
                    }else if(use3d && (i === 'translate')) {
                        re.push(i + "3d(" + this[i] + ",0)")
                    }else {
                        re.push(i + "(" + this[i] + ")")
                    }
                }
            }
        }

        return re.join(" ")
    },
})

const reunit = /^[\-0-9\.]+$/

function unit(i, units) {
    if((typeof i === "string") && (!i.match(reunit))) {
        return i
    }else {
        return "" + i + units
    }
}