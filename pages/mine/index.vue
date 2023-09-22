<template>
	<view>
		{{mineInfo.nickName}}
		<button @click="getUserInfo()" type="primary" v-if="!loggedIn">点击登录</button>
		<button @click="logout()" type="warn" v-if="loggedIn">退出登录</button>
	</view>
</template>

<script setup lang="ts">
	import { Ref, onMounted, ref } from 'vue';
	import { checkSession } from '../../common/utils';

	const mineInfo : Ref<any> = ref({ nickName: "我的昵称" });
	const loggedIn : Ref<boolean> = ref(false);
	const codeRef : Ref<string> = ref('');
	const loginInfo = ref({});

	onMounted(async () => {
		wx.cloud.init({
			env: "quiz-0gb2aw2vb2850af4"
		});

		const hasSession = await checkSession();
		const token = uni.getStorageSync('token');
		loggedIn.value = hasSession as boolean && !!token;
		console.log('是已登录状态', loggedIn.value);
	})

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
								console.log('uni.setStorageSync', rsp.result.token);
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

<style>

</style>