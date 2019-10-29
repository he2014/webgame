import {
    parseDate,
    formatDate,
    toDate,
    isDateObject,
    cloneDate,
    getDayCountOfMonth,
    getFirstDayOfMonth,
    objectToDate,
    dateToObject,
    sameDate,
    isLeapYear,
    daysInYear,
    getDayOfMonth,
    weekOfYear,
    dayOfYearFromWeeks,
    startOf,
    diffDate,
    createDate,
    createUTCDate
} from './date'
import fecha from './fecha'
import {firstUpperCase} from '../../utils/index'

const locales = {
    'zh-cn': {
        week: {
            fwd: 4,//包含1月4日的那一周是今年的第一个星期
            dow: 1, // 日历以周几开头（0周天-6周六）
        },
        i18n: {
            dayNamesShort: '周日_周一_周二_周三_周四_周五_周六'.split('_'),
            dayNames: '星期日_星期一_星期二_星期三_星期四_星期五_星期六'.split('_'),
            monthNamesShort: '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
            monthNames: '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split('_'),
            amPm: ['上午', '下午'],
            DoFn: function DoFn(D) {
                return `第${D}天`
            }
        }
    },
    'en': {
        week: {
            fwd: 1,//包含1月1日的那一周是今年的第一个星期
            dow: 0, // 日历以周几开头（0周天-6周六）
        },
        i18n: fecha.i18n
    },
}

class LeoDate {
    static defaultOption = {
        lang: 'zh-cn',
        format: 'yyyy-MM-dd',
        parseFormat: 'yyyy-MM-dd'
    }

    static parseDate(value, format = 'yyyy-MM-dd', i18n = LeoDate.getLocales()['zh-cn'].i18n) {
        return parseDate(value, format, i18n)
    }

    static formatDate(date, format = 'yyyy-MM-dd', i18n = LeoDate.getLocales()['zh-cn'].i18n) {
        return formatDate(date, format, i18n)
    }

    static setObjectToDate(obj) {
        return objectToDate(obj)
    }

    static createDate = createDate

    static createUTCDate = createUTCDate

    static clearDate(date, names) {
        if(Array.isArray(names)) {
            names.forEach((name) => {
                if(name === 'year') {
                    date.setFullYear(0)
                }else if(name === 'date') {
                    date.setDate(1)
                }else {
                    date[`set${firstUpperCase(name)}`](0)
                }
            })
        }
        return date
    }

    static clearTime(date) {
        LeoDate.clearDate(date, ['hours', 'minutes', 'seconds', 'milliseconds'])
        return date
    }

    static setDate(value, format, i18n) {
        if(isDateObject(value)) {
            return value
        }
        if(LeoDate.isLeoDate(value)) {
            return value.getDate()
        }
        if(format && i18n) {
            return parseDate(value, format, i18n)
        }
        let currentDate = objectToDate(value)
        if(!currentDate) {
            currentDate = toDate(value)
        }
        if(!isDateObject(currentDate)) {
            throw new Error('not set value')
        }
        return currentDate
    }

    static getLocales() {
        return locales
    }

    static isLeoDate(leoDate) {
        return leoDate instanceof LeoDate
    }

    static clone(date) {
        return cloneDate(date)
    }

    static getDayCountOfMonth(date) {
        return getDayCountOfMonth(date.getFullYear(), date.getMonth())
    }

    static getFirstDayOfMonth(date) {
        return getFirstDayOfMonth(date)
    }

    static dateToObject(date) {
        return dateToObject(date)
    }

    static objectToDate(value) {
        return objectToDate(value)
    }

    static sameDate(date1, date2) {
        return sameDate(date1, date2)
    }

    static isLeapYear(date) {
        return isLeapYear(date.getFullYear())
    }

    static daysInYear(date) {
        return daysInYear(date.getFullYear())
    }

    static weekOfYear(date, dow, fwd) {
        return weekOfYear(date, dow, fwd)
    }

    static dayOfYearFromWeeks(year, week, weekday, dow, fwd) {
        return dayOfYearFromWeeks(year, week, weekday, dow, fwd)
    }

    static getDayOfMonth(date, val) {
        return getDayOfMonth(date, val - 1)
    }

    static setYears(date, num) {
        if(num === 0) {
            return date
        }
        const year = date.getFullYear() + num
        const month = date.getMonth()
        const monthDate = Math.min(date.getDate(), getDayCountOfMonth(year, month))
        date.setDate(monthDate)
        date.setFullYear(year)
        date.setMonth(month)
        return date
    }

    static setMonths(date, num) {
        if(num === 0) {
            return date
        }
        const year = date.getFullYear()
        const month = date.getMonth()
        const sMonth = month + num
        const absNum = Math.abs(sMonth)
        let changeMonth = absNum % 12
        let changeYear
        if(sMonth > 0) {
            changeYear = year + Math.floor(absNum / 12)
        }else {
            const absYear = Math.ceil(absNum / 12)
            changeYear = year - absYear
            if(absYear > 0) {
                changeMonth = 12 - changeMonth
            }
        }
        const monthDate = Math.min(date.getDate(), getDayCountOfMonth(changeYear, changeMonth))
        date.setDate(monthDate)
        date.setFullYear(changeYear)
        date.setMonth(changeMonth)
        return date
    }

    static setQuarter(date, num) {
        if(num === 0) {
            return date
        }
        if(num < 0) {
            num += 1
        }
        const year = date.getFullYear()
        const month = date.getMonth()
        const cMonth = (num - 1) * 3 + month % 3
        const absNum = Math.abs(cMonth)
        let changeMonth = absNum % 12
        let changeYear
        if(cMonth > 0) {
            changeYear = year + Math.floor(absNum / 12)
        }else {
            const absYear = Math.ceil(absNum / 12)
            changeYear = year - absYear
            if(absYear > 0) {
                changeMonth = 12 - changeMonth
            }
        }
        const monthDate = Math.min(date.getDate(), getDayCountOfMonth(changeYear, changeMonth))
        date.setDate(monthDate)
        date.setFullYear(changeYear)
        date.setMonth(changeMonth)
        return date
    }

    static setDates(date, num) {
        if(num === 0) {
            return date
        }
        date.setDate(date.getDate() + num)
        return date
    }

    static setDay(date, num) {
        const distance = (num - date.getDay()) % 7
        date.setDate(date.getDate() + distance)
        return date
    }

    static setHours(date, num) {
        if(num === 0) {
            return date
        }
        date.setHours(date.getHours() + num)
        return date
    }

    static setMinutes(date, num) {
        if(num === 0) {
            return date
        }
        date.setMinutes(date.getMinutes() + num)
        return date
    }

    static setSeconds(date, num) {
        if(num === 0) {
            return date
        }
        date.setSeconds(date.getSeconds() + num)
        return date
    }

    static setMilliseconds(date, num) {
        if(num === 0) {
            return date
        }
        date.setMilliseconds(date.getMilliseconds() + num)
        return date
    }

    static diffDate(date1, date2, units) {
        return diffDate(date1, date2, units)
    }

    static startOf(date, units) {
        startOf(date, units)
        if(units === 'day') {
            LeoDate.setDay(date, 0)
        }
        return date
    }

    static firstDayOfWeek(locale) {
        return firstDayOfWeek(locale)
    }

    static getfwd(locale) {
        return getfwd(locale)
    }

    constructor(value, option = {}) {
        this.setOption(option)
        this.setDate(value)
    }

    setOption(option) {
        this.option = Object.assign({}, LeoDate.defaultOption, option)
        return this
    }

    getOption() {
        return Object.assign({}, this.option)
    }

    getLocale() {
        return locales[this.option.lang]
    }

    setDate(value, format, i18n = this.getLocale().i18n) {
        this.currentDate = LeoDate.setDate(value, format, i18n)
        return this
    }

    setObjectToDate(obj) {
        this.currentDate = objectToDate(obj)
        return this
    }

    parseDate(value, format = this.option.parseFormat, i18n = this.getLocale().i18n) {
        this.currentDate = parseDate(value, format, i18n)
        return this
    }

    clone() {
        return new LeoDate(this.getDate(), this.getOption())
    }

    getDate() {
        return cloneDate(this.currentDate)
    }

    formatDate(format = this.option.format, i18n = this.getLocale().i18n) {
        return formatDate(this.currentDate, format, i18n)
    }

    getDayCountOfMonth() {
        return getDayCountOfMonth(this.currentDate.getFullYear(), this.currentDate.getMonth())
    }

    getFirstDayOfMonth() {
        return getFirstDayOfMonth(this.currentDate)
    }

    dateToObject() {
        return dateToObject(this.currentDate)
    }

    sameDate(date2) {
        if(!isDateObject(date2)) {
            throw new Error('is not date')
        }
        return sameDate(this.currentDate, date2)
    }

    isLeapYear() {
        return isLeapYear(this.currentDate.getFullYear())
    }

    daysInYear() {
        return daysInYear(this.currentDate.getFullYear())
    }

    clearDate(names) {
        LeoDate.clearDate(this.currentDate, names)
        return this
    }

    clearTime(date) {
        LeoDate.clearTime(this.currentDate)
        return this
    }

    firstDayOfWeek() {
        return this.getLocale().week.dow
    }

    getfwd() {
        return this.getLocale().week.fwd
    }

    weekOfYear() {
        const locale = this.getLocale()
        return weekOfYear(this.currentDate, locale.week.dow, locale.week.fwd)
    }

    dayOfYearFromWeeks(week, weekday) {
        const locale = this.getLocale()
        return dayOfYearFromWeeks(this.currentDate.getFullYear(), week, weekday, locale.week.dow, locale.week.fwd)
    }

    startOf(units) {
        startOf(this.currentDate, units)
        if(units === 'day') {
            this.setDay(0)
        }
        return this
    }

    getDayOfMonth(val) {
        return getDayOfMonth(this.currentDate, val - 1)
    }

    setYears(num) {
        LeoDate.setYears(this.currentDate, num)
        return this
    }

    setMonths(num) {
        LeoDate.setMonths(this.currentDate, num)
        return this
    }

    setQuarter(num) {
        LeoDate.setQuarter(this.currentDate, num)
        return this
    }

    setDates(num) {
        LeoDate.setDates(this.currentDate, num)
        return this
    }

    setDay(num) {
        LeoDate.setDay(this.currentDate, num)
        return this
    }

    setHours(num) {
        LeoDate.setHours(this.currentDate, num)
        return this
    }

    setMinutes(num) {
        LeoDate.setMinutes(this.currentDate, num)
        return this
    }

    setSeconds(num) {
        LeoDate.setSeconds(this.currentDate, num)
        return this
    }

    setMilliseconds(num) {
        LeoDate.setMilliseconds(this.currentDate, num)
        return this
    }

    diffDate(date2, units) {
        if(!isDateObject(date2)) {
            throw new Error('is not date')
        }
        return diffDate(this.currentDate, date2, units)
    }
}

export default LeoDate