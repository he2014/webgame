import fecha from './fecha'
import {firstUpperCase} from '../../utils/index'

export const isDate = function(date) {
    if(date === null || date === undefined) return false
    if(isNaN(new Date(date).getTime())) return false
    return true
}

export const isDateObject = function(val) {
    return val instanceof Date
}

export const toDate = function(date) {
    return isDate(date) ? new Date(date) : null
}

export const getDayCountOfMonth = function(year, month) {
    if(month === 3 || month === 5 || month === 8 || month === 10) {
        return 30
    }

    if(month === 1) {
        if(year % 4 === 0 && year % 100 !== 0 || year % 400 === 0) {
            return 29
        }else {
            return 28
        }
    }

    return 31
}

export const getFirstDayOfMonth = function(date) {
    const temp = new Date(date.getTime())
    temp.setDate(1)
    return temp.getDay()
}

export function createDate(y = 0, m = 0, d = 1, h = 0, M = 0, s = 0, ms = 0) {
    const date = new Date(y, m, d, h, M, s, ms)

    if(y < 100 && y >= 0 && isFinite(date.getFullYear())) {
        date.setFullYear(y)
    }
    return date
}

export const prevDate = function(date, amount = 1) {
    return createDate(date.getFullYear(), date.getMonth(), date.getDate() - amount, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds())
}

export const nextDate = function(date, amount = 1) {
    return createDate(date.getFullYear(), date.getMonth(), date.getDate() + amount, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds())
}

export const prevMonth = function(date) {
    let year = date.getFullYear()
    let month = date.getMonth()
    if(month === 0) {
        year -= 1
        month = 11
    }else {
        month -= 1
    }
    const monthDate = Math.min(date.getDate(), getDayCountOfMonth(year, month))
    return modifyDate(date, year, month, monthDate)
}

export const nextMonth = function(date) {
    let year = date.getFullYear()
    let month = date.getMonth()
    if(month === 11) {
        year += 1
        month = 0
    }else {
        month += 1
    }
    const monthDate = Math.min(date.getDate(), getDayCountOfMonth(year, month))
    return modifyDate(date, year, month, monthDate)
}

export const prevYear = function(date, amount = 1) {
    const year = date.getFullYear() - amount
    const month = date.getMonth()
    const monthDate = Math.min(date.getDate(), getDayCountOfMonth(year, month))
    return modifyDate(date, year, month, monthDate)
}

export const nextYear = function(date, amount = 1) {
    const year = date.getFullYear() + amount
    const month = date.getMonth()
    const monthDate = Math.min(date.getDate(), getDayCountOfMonth(year, month))
    return modifyDate(date, year, month, monthDate)
}

export const sameDate = function(date1, date2) {
    if(date1.getTime() === date2.getTime()) {
        return true
    }
    return false
}

export const dateToObject = function(date) {
    return {
        'year': date.getFullYear(),
        'month': date.getMonth() + 1,
        'date': date.getDate(),
        'hours': date.getHours(),
        'minutes': date.getMinutes(),
        'seconds': date.getSeconds(),
        'milliseconds': date.getMilliseconds()
    }
}

export const objectToDate = function(op = {}) {
    if(typeof op !== 'object'){
        return null
    }
    const date = new Date()
    let y
    Object.keys(op).forEach((key) => {
        let val = op[key]
        if(key === 'month') {
            val = val - 1
        }
        date[`set${firstUpperCase(key)}`](val)
        if(key === 'year') {
            y = val
        }
    })
    if(y < 100 && y >= 0 && isFinite(date.getFullYear())) {
        date.setFullYear(y)
    }
    return date
}

export const modifyDate = function(date, y, m, d) {
    return createDate(y, m, d, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds())
}

export const modifyTime = function(date, h, m, s) {
    return createDate(date.getFullYear(), date.getMonth(), date.getDate(), h, m, s, date.getMilliseconds())
}

export const clearTime = function(date) {
    return createDate(date.getFullYear(), date.getMonth(), date.getDate())
}

export const clearMilliseconds = function(date) {
    return createDate(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), 0)
}

export function createUTCDate(y) {
    const date = new Date(Date.UTC.apply(null, arguments))
    if(y < 100 && y >= 0 && isFinite(date.getUTCFullYear())) {
        date.setUTCFullYear(y)
    }
    return date
}

function getDoy(dow, fwd) {
    return 7 + dow - fwd
}

export function firstDayOfWeek(locale) {
    return locale.week.dow
}

function getfwd(locale) {
    return locale.week.fwd
}

function firstWeekOffset(year, dow, fwd) {
    let fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7
    return -fwdlw + fwd - 1
}

export function daysInYear(year) {
    return isLeapYear(year) ? 366 : 365
}

export function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

export function weeksInYear(year, dow, fwd) {
    const weekOffset = firstWeekOffset(year, dow, fwd),
        weekOffsetNext = firstWeekOffset(year + 1, dow, fwd)
    return (daysInYear(year) - weekOffset + weekOffsetNext) / 7
}

function setMonth(dateObj, val) {
    const dayOfMonth = getDayOfMonth(dateObj, val)
    return dateObj.setMonth(val, dayOfMonth)
}

export function getDayOfMonth(dateObj, val) {
    return Math.min(dateObj.getDate(), getDayCountOfMonth(dateObj.getFullYear(), val))
}

export function startOf(dateObj, units) {
    switch(units) {
        case 'year':
            setMonth(dateObj, 0)
        case 'quarter':
        case 'month':
            dateObj.setDate(1)
        case 'day':
        case 'date':
            dateObj.setHours(0)
        case 'hour':
            dateObj.setMinutes(0)
        case 'minute':
            dateObj.setSeconds(0)
        case 'second':
            dateObj.setMilliseconds(0)
    }
    if(units === 'quarter'){
        dateObj.setMonth(Math.floor(dateObj.getMonth() / 3) * 3)
    }

    return dateObj
}

export function cloneDate(dateObj) {
    return new Date(dateObj)
}

export function getDayOfYear(dateObj) {
    return Math.round((startOf(cloneDate(dateObj), 'day') - startOf(cloneDate(dateObj), 'year')) / 864e5) + 1
}

export function weekOfYear(dateObj, dow = firstDayOfWeek(), fwd = getfwd()) {
    const year = dateObj.getFullYear()
    let weekOffset = firstWeekOffset(year, dow, fwd),
        week = Math.floor((getDayOfYear(dateObj) - weekOffset - 1) / 7) + 1,
        resWeek, resYear

    if(week < 1) {
        resYear = year - 1
        resWeek = week + weeksInYear(resYear, dow, fwd)
    }else if(week > weeksInYear(year, dow, fwd)) {
        resWeek = week - weeksInYear(year, dow, fwd)
        resYear = year + 1
    }else {
        resYear = year
        resWeek = week
    }

    return {
        week: resWeek,
        year: resYear
    }
}

export function dayOfYearFromWeeks(year, week, weekday, dow = firstDayOfWeek(), fwd = getfwd()) {
    let localWeekday = (7 + weekday - dow) % 7,
        weekOffset = firstWeekOffset(year, dow, fwd),
        dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
        resYear, resDayOfYear

    if(dayOfYear <= 0) {
        resYear = year - 1
        resDayOfYear = daysInYear(resYear) + dayOfYear
    }else if(dayOfYear > daysInYear(year)) {
        resYear = year + 1
        resDayOfYear = dayOfYear - daysInYear(year)
    }else {
        resYear = year
        resDayOfYear = dayOfYear
    }

    return {
        year: resYear,
        dayOfYear: resDayOfYear
    }
}

function getI18nSettings() {
    return locale.i18n
}

export const formatDate = function(date, format, i18n) {
    date = toDate(date)
    if(!date) return ''
    return fecha.format(date, format || 'yyyy-MM-dd', i18n)
}

export const parseDate = function(string, format, i18n) {
    return fecha.parse(string, format || 'yyyy-MM-dd', i18n)
}

const secondNum = 1000
const minuteNum = secondNum * 60
const hourNum = minuteNum * 60
const dayNum = hourNum * 24
const weekNum = dayNum * 7

export const diffDate = function(date1, date2, units) {
    let date1Time = date1.getTime()
    let date2Time = date2.getTime()
    let output = 0

    switch(units) {
        case 'year':
            output = monthDiff(date1, date2) / 12
            break
        case 'month':
            output = monthDiff(date1, date2)
            break
        case 'quarter':
            output = monthDiff(date1, date2) / 3
            break
        case 'second':
            output = (date1Time - date2Time) / secondNum
            break
        case 'minute':
            output = (date1Time - date2Time) / minuteNum
            break
        case 'hour':
            output = (date1Time - date2Time) / hourNum
            break
        case 'date':
            output = (date1Time - date2Time) / dayNum
            break
        case 'week':
            output = (date1Time - date2Time) / weekNum
            break
        default:
            output = date1Time - date2Time
    }

    return {
        output,
        units
    }
}

function monthDiff(a, b) {
    return ((a.getFullYear() - b.getFullYear()) * 12) + (a.getMonth() - b.getMonth())
}

