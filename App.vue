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
		},
		globalData: {
			loginInfo: {}, // 个人信息
			quizList: [], // 全部题目
			errList: [], // 错题本
			favList: [], // 收藏
			rankingList: [], // 排名
			themeColor: '#5ab8b3'
		},
	}
</script>

<style lang="scss">
	/* 注意要写在第一行，同时给style标签加入lang="scss"属性 */
	@import "@/uni_modules/uview-plus/index.scss";
	@import '@/style/normalize.scss';
	@import '@/style/reset.scss';

	page {
		overflow: hidden;
	}
</style>