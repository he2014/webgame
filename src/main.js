import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ViewUI from 'view-design'
import 'view-design/dist/styles/iview.css'
import { apolloProvider } from '@/login/index'
import VueApollo from 'vue-apollo'
import MessageManage from '@/plugins/webIM/message-manage'
//  VueApollo
Vue.use(MessageManage)
Vue.use(VueApollo)

Vue.config.productionTip = false
Vue.use(ViewUI)
new Vue({
  provide: apolloProvider.provide(),
  router,
  store,
  render: h => h(App)
}).$mount('#app')
