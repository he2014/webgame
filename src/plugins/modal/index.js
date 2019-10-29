import modal from '@/components/com/TheInfoTipWrap'

export default {
  install (Vue) {
    Vue.prototype.$Modal = ({
      data
    } = {}) => {
      let div = document.createElement('div')
      document.body.appendChild(div)
      const _modal = new Vue({
        el: div,
        data,
        render: function (createElement) {
          const _this = this
          return createElement(
            modal
          )
        }
      })
    }
  }
}
