<template>
	<view>
		{{mineInfo.nickName}}
		<button @click="getUserInfo()" type="primary" v-if="!loggedIn">点击登录</button>
		<button @click="logout()" type="warn" v-if="loggedIn">退出登录</button>
	</view>
</template>

<script lang="ts">
	import { checkSession } from '../../common/utils';

	export default {
		data() {
			return {
				mineInfo: { nickName: "我的昵称" },
				loggedIn: false,
				codeRef: "",
				loginInfo: {}
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

<style>

</style>