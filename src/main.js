import 'whatwg-fetch';
import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false
Vue.config.errorHandler = console.error;

new Vue({
  render: h => h(App)
}).$mount('#app')
