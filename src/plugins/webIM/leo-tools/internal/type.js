import {hasOwnProperty, toString} from '../constant'

const symToStringTag = typeof Symbol != 'undefined' ? Symbol.toStringTag : undefined

export function baseGetTag(value) {
    if(value == null) {
        return value === undefined ? '[object Undefined]' : '[object Null]'
    }
    if(!(symToStringTag && symToStringTag in Object(value))) {
        return toString.call(value)
    }
    const isOwn = hasOwnProperty.call(value, symToStringTag)
    const tag = value[symToStringTag]
    let unmasked = false
    try {
        value[symToStringTag] = undefined
        unmasked = true
    }catch(e) {
    }

    const result = toString.call(value)
    if(unmasked) {
        if(isOwn) {
            value[symToStringTag] = tag
        }else {
            delete value[symToStringTag]
        }
    }
    return result
}

const dataViewTag = '[object DataView]'
const mapTag = '[object Map]'
const objectTag = '[object Object]'
const promiseTag = '[object Promise]'
const setTag = '[object Set]'
const weakMapTag = '[object WeakMap]'

const dataViewCtorString = `${DataView}`
const mapCtorString = `${Map}`
const promiseCtorString = `${Promise}`
const setCtorString = `${Set}`
const weakMapCtorString = `${WeakMap}`

let getTag = baseGetTag

if((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
    (getTag(new Map) != mapTag) ||
    (getTag(Promise.resolve()) != promiseTag) ||
    (getTag(new Set) != setTag) ||
    (getTag(new WeakMap) != weakMapTag)) {
    getTag = (value) => {
        const result = baseGetTag(value)
        const Ctor = result == objectTag ? value.constructor : undefined
        const ctorString = Ctor ? `${Ctor}` : ''

        if(ctorString) {
            switch(ctorString) {
                case dataViewCtorString:
                    return dataViewTag
                case mapCtorString:
                    return mapTag
                case promiseCtorString:
                    return promiseTag
                case setCtorString:
                    return setTag
                case weakMapCtorString:
                    return weakMapTag
            }
        }
        return result
    }
}

const reType = /^\[object\s(.*)\]$/

function getType(obj) {
    return getTag(obj).replace(reType, "$1")
}

export default getType
