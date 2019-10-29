/**
 +-------------------------------------------------------------------
 * leo-tools
 +-------------------------------------------------------------------
 * @version    1.0.0 beta
 * @author     leo
 +-------------------------------------------------------------------
 */

export const objectProto = Object.prototype
export const hasOwnProperty = objectProto.hasOwnProperty
export const toString = objectProto.toString
export const document = window.document
export const documentElement = document.documentElement
export const ArrayProto = Array.prototype
export const indexOf = ArrayProto.indexOf
export const slice = ArrayProto.slice
export const concat = ArrayProto.concat
export const getProto = Object.getPrototypeOf
export const fnToString = hasOwnProperty.toString
export const ObjectFunctionString = fnToString.call(Object)