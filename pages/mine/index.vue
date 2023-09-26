<template>
	<view class="base">
		{{mineInfo.nickName}}
		<button @click="getUserInfo()" type="primary" v-if="!loggedIn">点击登录</button>
		<button @click="logout()" type="warn" v-if="loggedIn">退出登录</button>

		<button @click="adminVisible=!adminVisible">{{adminVisible?'关闭后台':'显示后台'}}</button>
		<!-- 3 后台 -->
		<view class="admin-container" v-if="adminVisible">
			<button class="btn" @click="onCms" data-quizType="js">JavaScript 后台</button>
			<button class="btn" @click="onCms" data-quizType="es6">ECMAScript 6 后台</button>
			<button class="btn" @click="onCms" data-quizType="ts">TypeScript 后台</button>
			<button class="btn-task" @click="onTask">任务</button>
		</view>
	</view>
</template>

<script lang="ts">
	import { checkSession } from '../../common/utils';
	import queryString from 'query-string'

	export default {
		data() {
			return {
				mineInfo: { nickName: "我的昵称" },
				loggedIn: false,
				codeRef: "",
				loginInfo: {},
				adminVisible: false
			}
		},
		async onMounted() {
			wx.cloud.init({
				env: "quiz-0gb2aw2vb2850af4"
			});

			const hasSession = await checkSession();
			const token = uni.getStorageSync('token');
			this.loggedIn = hasSession as boolean && !!token;
			console.log('是已登录状态', this.loggedIn);
		},
		methods: {
			onCms(evt : any) {
				// console.log('onCms evt', evt);
				const { quiztype } = evt.target.dataset;
				const queryStr = queryString.stringify({ quizType: quiztype })
				const url = `/pages/cms/index?${queryStr}`;
				// console.log('onCms', url);
				uni.navigateTo({ url });
			},
			onTask() {
				const url = `/pages/task/index`;
				uni.navigateTo({ url });
			},
			async getUserInfo() {
				uni.showLoading({
					title: '加载中',
				});
				uni.getUserProfile({
					desc: '登录后可同步数据',
					success: async (value) => {
						const { nickName, avatarUrl } = value.userInfo;
						this.loginInfo = { nickName, avatarUrl };
						uni.login({
							provider: 'weixin',
							success: async (rsp) => {
								console.log('uni.login rsp', rsp);
								const { code } = rsp;
								this.codeRef = code;

								// 请求登录接口
								if (rsp.errMsg == 'login:ok') {
									const data = { code, nickName, avatarUrl };
									console.log("applet call login", data)
									const rsp : any = await wx.cloud.callFunction({
										name: 'login',
										data
									});
									console.log("applet call login callback", rsp)
									if (rsp.result.status === 200) {
										console.log('uni.setStorageSync', rsp.result.token);
										uni.setStorageSync('token', rsp.result.token)
										this.loggedIn = true;
									}
								}
							},
						});
					},
					fail: () => {
						uni.showToast({
							title: '授权已取消',
							icon: 'error',
							mask: true,
						});
					},
					complete: () => {
						// 隐藏loading
						uni.hideLoading();
					},
				});
			},
			logout() {
				uni.showModal({
					title: '确定要退出登录吗？',
					success: function (res) {
						if (res.confirm) {
							uni.removeStorageSync('token')
							this.loginInfo = { nickname: "", avatarUrl: '' };
							this.loggedIn = false;
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}
				});
			}
		}
	}
</script>

<style lang="scss">
	.base{
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
	}
</style>