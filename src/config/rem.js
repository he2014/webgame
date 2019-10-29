;(function(doc, win) {
  var ua = navigator.userAgent
  var isAndroid = /android/i.test(ua)
  var docEl = doc.documentElement
  var resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize'
  var recalc = function() {
    if (
      doc.activeElement.tagName === 'INPUT' ||
      doc.activeElement.tagName === 'TEXTAREA'
    ) {
      if (isAndroid) {
        setTimeout(function() {
          var top = doc.activeElement.getBoundingClientRect().top
          console.log('top', top);
          win.scrollTo(0, top)
        }, 0)
      }
    }
    var clientWidth = docEl.clientWidth
    if (!clientWidth) return
    docEl.style.fontSize = 20 * (clientWidth / 375) + 'px' // 这里设置fontsize相当于在375宽度下，1rem 为20px ,那么对应320下就只有17px,在441宽度下为23.52px
  }
  if (!doc.addEventListener) return
  win.addEventListener(resizeEvt, recalc, false)
  doc.addEventListener('DOMContentLoaded', recalc, false)
})(document, window)
