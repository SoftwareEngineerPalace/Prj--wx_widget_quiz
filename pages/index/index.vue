<template>
	<view class="main">
		<button class="btn" @click="onJavaScript" type="primary">JavaScript 答题</button>
		<button class="btn" @click="onJavaScriptCMS">JavaScript 后台</button>
		<button class="btn" @click="onEcmaScript" type="primary">ECMAScript 6 答题</button>
		<button class="btn" @click="onEcmaScriptCMS">ECMAScript 6 后台</button>
		<button class="btn" @click="onTypeScript" type="primary">TypeScript 答题</button>
		<button class="btn" @click="onTypeScriptCMS">TypeScript 后台</button>
		<button @click="getUserInfo()" type="primary" v-if="!loggedIn">点击登录</button>
		<button @click="logout()" type="warn" v-if="loggedIn">退出登录</button>
	</view>
</template>

<script setup lang="ts">
	import { ref, onMounted, Ref } from 'vue';
	import { checkSession } from '../../common/utils';

	const loggedIn : Ref<boolean> = ref(false);
	const codeRef : Ref<string> = ref('');
	const loginInfo = ref({});

	onMounted(async () => {
		wx.cloud.init({
			env: "quiz-0gb2aw2vb2850af4"
		});

		const hasSession = await checkSession();
		loggedIn.value = hasSession as boolean;
		console.log('是已登录状态', hasSession);
	})

	const onJavaScript = () => {
		uni.navigateTo({
			url: '/pages/quiz/quiz?quizType=javascript',
		})
	}

	const onJavaScriptCMS = () => {
		uni.navigateTo({
			url: '/pages/cms/cms?quizType=javascript'
		})
	}

	const onEcmaScript = () => {
		uni.navigateTo({
			url: '/pages/quiz/quiz?quizType=es6'
		})
	}

	const onEcmaScriptCMS = () => {
		uni.navigateTo({
			url: '/pages/cms/cms?quizType=es6'
		})
	}

	const onTypeScript = () => {
		uni.navigateTo({
			url: '/pages/quiz/quiz?quizType=ts'
		})
	}

	const onTypeScriptCMS = () => {
		uni.navigateTo({
			url: '/pages/cms/cms?quizType=ts'
		})
	}

	const getUserInfo = async () => {
		uni.showLoading({
			title: '加载中',
		});
		uni.getUserProfile({
			desc: '登录后可同步数据',
			success: async (value) => {
				const { nickName, avatarUrl } = value.userInfo;
				loginInfo.value = { nickName, avatarUrl };
				uni.login({
					provider: 'weixin',
					success: async (rsp) => {
						console.log('uni.login rsp', rsp);
						const { code } = rsp;
						codeRef.value = code;

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
								uni.setStorageSync('token', rsp.result.token)
								loggedIn.value = true;
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
	}

	const logout = () => {
		uni.showModal({
			title: '确定要退出登录吗？',
			success: function (res) {
				if (res.confirm) {
					uni.removeStorageSync('token')
					loginInfo.value = { nickname: "", avatarUrl: '' };
					loggedIn.value = false;
				} else if (res.cancel) {
					console.log('用户点击取消');
				}
			}
		});
	};
</script>

<style lang="scss" scoped>
	page {
		width: 100vw;
		height: 100vh;
		background-color: #eeeeee;

		.main {
			display: flex;
			flex-direction: column;
			padding-top: 30rpx;
			width: 100%;
			height: 100vh;
			background-color: #eeeeee;

			.btn {
				width: 60%;
				margin-bottom: 30rpx;
				border: none;

				&::after {
					border: none;
				}
			}
		}
	}
</style>