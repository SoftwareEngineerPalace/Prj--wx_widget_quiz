<template>
	<view class="mine-wrapper padding30">
		<view class="card mb30">
			<view v-if="loggedIn" class="hbox mb30" style="justify-content: center;" @click="login">
				<input type="nickname" class="mine__name weui-input" :placeholder="loginInfo.commenter_name"
					@change="onNameChange" />
				<button class="mine__avatar" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
					<u--image :src="loginInfo.avatar_url" shape="circle" width="80px" height="80px"></u--image>
				</button>
			</view>

			<u-line v-if="loggedIn" class="line" color="#dddddd"></u-line>

			<view class="hbox" style="padding-top: 30rpx; justify-content: space-evenly;">
				<view class="vbox" v-for="(item) in commonUseSettings" :key="item.id">
					<u-icon :name="item.icon" color="#bbbbbb" size="50"></u-icon>
					<view>{{item.label}}</view>
				</view>
			</view>
		</view>

		<view class="card">
			<view class="hbox" style="padding:20rpx; justify-content: space-between; border-bottom: 1px solid #eeeeee;"
				v-for="(item) in notCommonUseSettings" :key="item.id">
				<view class="hbox">
					<u-icon custom-style="margin-right:30rpx" :name="item.icon" color="#bbbbbb" size="50"></u-icon>
					<view class='label'>{{ item.label }}</view>
				</view>
				<u-icon name="arrow-right" color="#bbbbbb" size="40"></u-icon>
			</view>

			<button class="btn-primary mb20 mt20" @click="login" v-if="!loggedIn">点击登录</button>

			<button class="btn-primary mb20 mt20" @click="logout" v-if="loggedIn">退出登录</button>

			<button class="btn-primary mb20" @click="adminVisible=!adminVisible">{{adminVisible?'关闭后台':'显示后台'}}</button>

			<!-- 3 后台 -->
			<view class="mine__admin" v-if="adminVisible">
				<button class="btn-primary mb20" @click="onCms" data-quizType="js">JavaScript 后台</button>
				<button class="btn-primary mb20" @click="onCms" data-quizType="es6">ECMAScript 6 后台</button>
				<button class="btn-primary mb20" @click="onCms" data-quizType="ts">TypeScript 后台</button>
				<button class="btn-primary mb20" @click="onTask">任务</button>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
	// uni.getUserProfile 获取昵称 头像
	// uni.login 获取 weixin 获取 code
	// 调用后台的 login，用 code 获取 token 和 openid

	import { checkSession, ICommenter } from '../../common/utils';
	import { getOpenId, getProfile } from '../../common/loginUtils';
	import { loginInfo_default } from '../../common/common';
	import queryString from 'query-string';

	import { ref, onMounted } from 'vue';
	const loggedIn = ref(false);

	const loginInfo = ref(loginInfo_default);
	const adminVisible = ref(false);

	const commonUseSettings = ref([
		{ id: 'wrongbook', 'label': '错题本', 'icon': 'order' },
		{ id: 'comment', 'label': '评论', 'icon': 'chat-fill' },
		{ id: 'favorite', 'label': '收藏', 'icon': 'star-fill' }])

	const notCommonUseSettings = ref([
		{ id: 'history', 'label': '我的做题记录', 'icon': 'order' },
		{ id: 'like', 'label': '我收到的赞', 'icon': 'thumb-up-fill' },
		{ id: 'share', 'label': '分享', 'icon': 'share-fill' },
		{ id: 'feedback', 'label': '问题反馈', 'icon': 'chat-fill' },
		{ id: 'settings', 'label': '设置', 'icon': 'setting-fill' },
		{ id: 'about', 'label': '关于程序', 'icon': 'error-circle' }])

	onMounted(async () => {
		// 1 登录状态
		const hasSession = await checkSession();
		const token = uni.getStorageSync('token');
		loggedIn.value = hasSession as boolean && !!token;

		// 2 个人信息
		if (loggedIn.value) {
			loginInfo.value = (getApp().globalData as any).loginInfo;
		}
	})

	const onChooseAvatar = async (e) => {
		console.log('onChooseAvatar');
		const { avatarUrl: filePath } = e.detail;
		const cloudPath = `commenter/${loginInfo.value.id}.jpg`;
		const { fileID: avatar_url } = await wx.cloud.uploadFile({ cloudPath, filePath })
		console.log('上传图片到云存储后', avatar_url);
		loginInfo.value = { ...loginInfo.value, avatar_url };
		addOrUpdateCommenter(loginInfo.value);
	}

	const onNameChange = (e) => {
		console.log("onNameChange", e);
		loginInfo.value = { ...loginInfo.value, commenter_name: e.detail.value };
		addOrUpdateCommenter(loginInfo.value);
	}

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

	const addOrUpdateCommenter = async (data : any) => {
		await wx.cloud.callFunction({
			name: 'addOrUpdateCommenter',
			data
		})
	}

	const login = async () => {
		if (loggedIn.value) return;
		const rsp = await getOpenId();
		console.log('login', rsp);
		loginInfo.value = { ...loginInfo.value, ...rsp }
		loggedIn.value = true;
		(getApp().globalData as any).loginInfo = rsp;
		uni.showTabBar();
		addOrUpdateCommenter(loginInfo.value)
	}

	const logout = () => {
		uni.showModal({
			title: '确定要退出登录吗？',
			success: function (res) {
				if (res.confirm) {
					uni.removeStorageSync('token');
					loginInfo.value = loginInfo_default;
					loggedIn.value = false;
					uni.hideTabBar();
					(getApp().globalData as any).loginInfo = loginInfo.value;
				} else if (res.cancel) {
					// console.log('用户点击取消');
				}
			}
		});
	}
</script>

<style lang="scss" scoped>
	page {
		width: 100vw;
		height: 100vh;

		.mine-wrapper {
			display: flex;
			flex-direction: column;
			justify-content: flex-start;
			align-items: center;
			background-color: $uni-bg-color-grey;

			.mine__name {
				width: 190rpx;
			}

			.mine__avatar {
				border: none;
				background: white;
				padding: 0;
				margin: 0;

				&::after {
					border: none;
				}
			}

			.mine__admin {
				width: 100%;
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
</style>