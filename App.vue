<script>
	export default {
		onLaunch: function() {
			// console.log('App Launch')
			wx.cloud.init({
				env: "quiz-0gb2aw2vb2850af4"
			});
		},
		onShow: function() {
			// console.log('App Show')
		},
		onHide: function() {
			// console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	/* 注意要写在第一行，同时给style标签加入lang="scss"属性 */
	@import "@/uni_modules/uview-plus/index.scss";
	@import '@/style/normalize.scss';
	@import '@/style/reset.scss';
</style>