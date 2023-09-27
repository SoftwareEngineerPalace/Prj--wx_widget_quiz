<template>
	<view class="base">
		<view class="container-up">
			<view class="personal-info">
				<view>{{loginInfo.nickName}}</view>
				<u--image :src="loginInfo.avatarUrl" shape="circle" width="80px" height="80px"></u--image>
			</view>
			<u-line class="line" color="#dddddd"></u-line>
			<view class="common-items">
				<view class="card">
					<u-icon name="order" color="#bbbbbb" size="50"></u-icon>
					<view>错题本</view>
				</view>
				<view class="card">
					<u-icon name="chat-fill" color="#bbbbbb" size="50"></u-icon>
					<view>评论</view>
				</view>
				<view class="card">
					<u-icon name="star-fill" color="#bbbbbb" size="50"></u-icon>
					<view>收藏</view>
				</view>
			</view>
		</view>

		<view class="container-down">
			<view class="bar record">
				<view class="left">
					<u-icon name="order" color="#bbbbbb" size="50"></u-icon>
					<view class='label'>我的做题记录</view>
				</view>
				<u-icon name="arrow-right" color="#bbbbbb" size="50"></u-icon>
			</view>
			<u-line class="line" color="#dddddd"></u-line>
			<view class="bar praise">
				<view class="left">
					<u-icon name="thumb-up-fill" color="#bbbbbb" size="50"></u-icon>
					<view class='label'>我收到的赞</view>
				</view>
				<u-icon name="arrow-right" color="#bbbbbb" size="50"></u-icon>
			</view>
			<u-line class="line" color="#dddddd"></u-line>
			<view class="bar share">
				<view class="left">
					<u-icon name="share-fill" color="#bbbbbb" size="50"></u-icon>
					<view class='label'>分享</view>
				</view>
				<u-icon name="arrow-right" color="#bbbbbb" size="50"></u-icon>
			</view>
			<u-line class="line" color="#dddddd"></u-line>
			<view class="bar feedback">
				<view class='left'>
					<u-icon name="chat-fill" color="#bbbbbb" size="50"></u-icon>
					<view class="label">问题反馈</view>
				</view>
				<u-icon name="arrow-right" color="#bbbbbb" size="50"></u-icon>
			</view>
			<u-line class="line" color="#dddddd"></u-line>
			<view class="bar setting">
				<view class="left"> <u-icon name="setting-fill" color="#bbbbbb" size="50"></u-icon>
					<view class="label">设置</view>
				</view>
				<u-icon name="arrow-right" color="#bbbbbb" size="50"></u-icon>
			</view>
			<u-line class="line" color="#dddddd"></u-line>
			<view class="bar about">
				<view class='left'>
					<u-icon name="error-circle" color="#bbbbbb" size="50"></u-icon>
					<view class="label">关于程序</view>
				</view>
				<u-icon name="arrow-right" color="#bbbbbb" size="50"></u-icon>
			</view>
			<u-line class="line" color="#dddddd"></u-line>
			<button style="font-size: 14px; marginTop: 20rpx; width:80%" @click="getUserInfo()" type="primary"
				v-if="!loggedIn">点击登录</button>
			<button style="font-size: 14px; marginTop: 20rpx; width:80%" @click="logout()" type="warn"
				v-if="loggedIn">退出登录</button>

			<button style="font-size: 14px; marginTop: 20rpx; marginBottom: 20rpx; width:80%"
				@click="adminVisible=!adminVisible">{{adminVisible?'关闭后台':'显示后台'}}</button>
			<!-- 3 后台 -->
			<view class="admin-container" v-if="adminVisible">
				<button class="btn" @click="onCms" data-quizType="js">JavaScript 后台</button>
				<button class="btn" @click="onCms" data-quizType="es6">ECMAScript 6 后台</button>
				<button class="btn" @click="onCms" data-quizType="ts">TypeScript 后台</button>
				<button class="btn" @click="onTask">任务</button>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
	import { checkSession } from '../../common/utils';
	import queryString from 'query-string';

	import { ref, onMounted } from 'vue';
	const loggedIn = ref(false);
	const codeRef = ref("");
	const loginInfo = ref({ nickName: "我的昵称", avatarUrl: '' });
	const adminVisible = ref(false);

	onMounted(async () => {
		wx.cloud.init({
			env: "quiz-0gb2aw2vb2850af4"
		});

		const hasSession = await checkSession();
		const token = uni.getStorageSync('token');
		loggedIn.value = hasSession as boolean && !!token;
		console.log('是已登录状态', loggedIn);
	})

	const onCms = (evt : any) => {
		// console.log('onCms evt', evt);
		const { quiztype } = evt.target.dataset;
		const queryStr = queryString.stringify({ quizType: quiztype })
		const url = `/pages/cms/index?${queryStr}`;
		// console.log('onCms', url);
		uni.navigateTo({ url });
	};

	const onTask = () => {
		const url = `/pages/task/index`;
		uni.navigateTo({ url });
	};

	const getUserInfo = async () => {
		uni.showLoading({
			title: '加载中',
		});
		uni.getUserProfile({
			desc: '登录后可同步数据',
			success: async (value) => {
				const { nickName, avatarUrl } = value.userInfo;
				loginInfo.value = { nickName, avatarUrl };
				console.log('loginInfo', loginInfo)
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
	};
	const logout = () => {
		uni.showModal({
			title: '确定要退出登录吗？',
			success: function (res) {
				if (res.confirm) {
					uni.removeStorageSync('token')
					loginInfo.value = { nickName: "", avatarUrl: '' };
					loggedIn.value = false;
				} else if (res.cancel) {
					console.log('用户点击取消');
				}
			}
		});
	}
</script>

<style lang="scss">
	page {
		background-color: #eeeeee;

		.base {
			display: flex;
			flex-direction: column;
			justify-content: flex-start;
			align-items: center;

			.container-up {
				margin-top: 20rpx;
				width: 82%;
				background-color: white;
				display: flex;
				flex-direction: column;
				justify-content: flex-start;
				align-items: center;
				border-radius: 20rpx;
				padding-top: 20rpx;
				padding-bottom: 20rpx;

				.personal-info {
					width: 100%;
					display: flex;
					flex-direction: row;
					justify-content: space-evenly;
					align-items: center;
					margin-bottom: 20rpx;
				}

				.common-items {
					margin-top: 20rpx;
					width: 100%;
					display: flex;
					flex-direction: row;
					justify-content: space-evenly;
					align-items: center;

					.card {
						display: flex;
						flex-direction: column;
						justify-content: flex-start;
						align-items: center;
					}
				}
			}

			.container-down {
				margin-top: 20rpx;
				width: 82%;
				background-color: white;
				display: flex;
				flex-direction: column;
				justify-content: flex-start;
				align-items: center;
				border-radius: 20rpx;
				padding-bottom: 20rpx;

				.bar {
					width: 90%;
					display: flex;
					flex-direction: row;
					justify-content: space-between;
					align-items: center;
					padding-left: 40rpx;
					padding-right: 20rpx;
					padding: 30rpx;

					.left {
						display: flex;
						flex-direction: row;
						justify-content: flex-start;
						align-items: center;

						.label {
							margin-left: 20rpx;
						}
					}
				}

				.admin-container {
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: flex-start;

					.btn {
						margin-bottom: 20rpx;
						width: 100%;
						font-size: 14px;
					}
				}
			}
		}
	}
</style>