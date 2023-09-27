import App from './App';
import uview from '@/uni_modules/uview-plus';
// declare const wx: any;

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor';

Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
	...App
})
app.$mount()
// #endif

// #ifdef VUE3
import {
	createSSRApp
} from 'vue'
export function createApp() {
	const app = createSSRApp(App)
	app.use(uview)
	return {
		app
	}
}
// 如此配置即可
uni.$u.config.unit = 'rpx'
// #endif