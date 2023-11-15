<template>
	<view class="mine-wrapper padding30">
		<view class="card mb40">
			<view class="hbox" style="justify-content: center;">
				<input type="nickname" class="mine__name weui-input text-primary" placeholder="修改名字"
					:value="loginInfo.name" @change="onNameChange" :disabled="!loggedIn" />
				<button class="mine__avatar" :disabled="!loggedIn" open-type="chooseAvatar"
					@chooseavatar="onChooseAvatar">
					<u--image :src="loginInfo.url" shape="circle" width="80px" height="80px"></u--image>
				</button>
			</view>

			<view v-if="loggedIn" class="text-sm-grey mr20 mt30" style="align-self: center;">用户名、头像可点击修改</view>

			<u-line v-if="false" class="line" color="#dddddd"></u-line>

			<view v-if="false" class="hbox" style="padding-top: 30rpx; justify-content: space-evenly;">
				<view class="vbox" v-for="(item) in commonUseSettings" :key="item.id" @click="waiting">
					<u-icon :name="item.icon" color="#bbbbbb" size="70"></u-icon>
					<view class="mt20">{{item.label}}</view>
				</view>
			</view>
		</view>



		<view class="card">
			<button plain class="hbox menu-btn" @click="onClickLike"
				style="padding:20rpx; justify-content: space-between; border-bottom: 1px solid #eeeeee;">
				<view class="hbox">
					<u-icon custom-style="margin-right:30rpx" name="thumb-up-fill" color="#bbbbbb" size="50"></u-icon>
					<view class='label'>我收到的赞</view>
				</view>
				<u-icon name="arrow-right" color="#bbbbbb" size="40"></u-icon>
			</button>

			<button plain class="hbox menu-btn" open-type="feedback"
				style="padding:20rpx; justify-content: space-between; border-bottom: 1px solid #eeeeee;">
				<view class="hbox">
					<u-icon custom-style="margin-right:30rpx" name="chat-fill" color="#bbbbbb" size="50"></u-icon>
					<view class='label'>问题反馈</view>
				</view>
				<u-icon name="arrow-right" color="#bbbbbb" size="40"></u-icon>
			</button>

			<button plain class="hbox menu-btn" @click="onShare"
				style="padding:20rpx; justify-content: space-between; border-bottom: 1px solid #eeeeee;">
				<view class="hbox">
					<u-icon custom-style="margin-right:30rpx" name="share-fill" color="#bbbbbb" size="50"></u-icon>
					<view class='label'>分享</view>
				</view>
				<u-icon name="arrow-right" color="#bbbbbb" size="40"></u-icon>
			</button>

			<button plain class="hbox menu-btn"
				style="padding:20rpx; justify-content: space-between; border-bottom: 1px solid #eeeeee;"
				@click="onAbout">
				<view class="hbox">
					<u-icon custom-style="margin-right:30rpx" name="error-circle" color="#bbbbbb" size="50"></u-icon>
					<view class='label'>关于</view>
				</view>
				<u-icon name="arrow-right" color="#bbbbbb" size="40"></u-icon>
			</button>

			<button class="btn-primary mb20 mt40" @click="login" v-if="!loggedIn">点击登录</button>

			<button class="btn-primary mb20 mt40 btn-warning" @click="logout" v-if="loggedIn">退出登录</button>

			<button v-if="loginInfo.id==='oGJqI61rEAICwpBqGgw_hteePEbY'" class="btn-primary mb20"
				@click="adminVisible=!adminVisible">{{adminVisible?'关闭后台':'显示后台'}}</button>

			<!-- 3 后台 -->
			<view class="mine__admin" v-if="adminVisible">
				<button class="btn-primary mb20" @click="onCms" data-quizType="js">JavaScript 后台</button>
				<button class="btn-primary mb20" @click="onCms" data-quizType="es6">ECMAScript 6 后台</button>
				<button class="btn-primary mb20" @click="onCms" data-quizType="ts">TypeScript 后台</button>

				<input class="mb20" placeholder="输入用户 id" v-model="userIdToDelete"
					style="width: 100%; text-align: center;" />
				<view class="hbox mb20" style="justify-content: space-evenly;">
					<u-radio-group :customStyle="{flew:'none'}" v-model="quizTypeRadioValue" placement="row" size="40"
						class="flex-grow:0">
						<u-radio activeColor="red" :customStyle="{marginBottom: '8px', marginRight:'30rpx'}"
							:labelSize="40" :iconSize="80" v-for="(type) in ['js','es6','ts']" :key="type" :label="type"
							:name="type">
						</u-radio>
					</u-radio-group>
					<button class="btn-primary btn-warning" style="width: auto; margin: 0;"
						@click="deleteQuiz">删除</button>
				</view>

				<button class="btn-primary mb20" @click="onTask">任务</button>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
	// uni.getUserProfile 获取昵称 头像
	// uni.login 获取 weixin 获取 code
	// 调用后台的 login，用 code 获取 token 和 openid

	import { getProfile, checkSession, waiting, plsLogin } from '../../common/utils';
	import { loginInfo_default, ICommenter, qrCode } from '../../common/common';
	import { addOrUpdateCommenter, getOpenId, deleteQuizByTypeAndUserId } from '../../service/service'

	import queryString from 'query-string';

	import { ref, onMounted } from 'vue';
	import {
		onShareAppMessage,
		onShareTimeline
	} from '@dcloudio/uni-app';

	const userIdToDelete = ref('')

	onShareAppMessage(() => {
		return {
			title: '软工题库',
			path: 'pages/home/index',
			imageUrl: qrCode,
		};
	});

	onShareTimeline(() => {
		return {
			title: '软工题库',
			path: 'pages/home/index',
			imageUrl: qrCode,
		};
	})
	const loggedIn = ref(false);

	const loginInfo = ref(loginInfo_default);
	const adminVisible = ref(false);

	const onAbout = () => {
		uni.navigateTo({
			url: "/pages/about/about"
		})
	}

	const commonUseSettings = ref([
		{ id: 'wrongbook', 'label': '错题本', 'icon': 'order' },
		{ id: 'comment', 'label': '评论', 'icon': 'chat-fill' },
		{ id: 'favorite', 'label': '收藏', 'icon': 'star-fill' }])
	// const commonUseSettings = ref([]);

	const notCommonUseSettings = ref([
		// { id: 'history', 'label': '我的做题记录', 'icon': 'order' },
		{ id: 'like', 'label': '我收到的赞', 'icon': 'thumb-up-fill' },
		{ id: 'share', 'label': '分享', 'icon': 'share-fill' },
		{ id: 'feedback', 'label': '问题反馈', 'icon': 'chat-fill' },
		// { id: 'settings', 'label': '设置', 'icon': 'setting-fill' },
		{ id: 'about', 'label': '关于程序', 'icon': 'error-circle' }])

	onMounted(async () => {
		// console.log("mine onMounted");
		// 1 登录状态
		const hasSession = await checkSession();
		const token = uni.getStorageSync('token');
		loggedIn.value = (!!hasSession && !!token);

		// 2 个人信息
		if (loggedIn.value) {
			loginInfo.value = (getApp().globalData as any).loginInfo;
			userIdToDelete.value = loginInfo.value.id;
			console.log("mine onMounted userIdToDelete", userIdToDelete.value);
		}

	})

	const onChooseAvatar = async (e) => {
		const { avatarUrl: filePath } = e.detail;
		// console.log('onChooseAvatar filePath', filePath);
		const cloudPath = `commenter/${loginInfo.value.id}.jpg`;
		const { fileID } = await wx.cloud.uploadFile({ cloudPath, filePath });
		const { fileList } = await wx.cloud.getTempFileURL({ fileList: [{ fileID }] })
		// console.log("getTempFileURL", fileList);
		const [first] = fileList;
		const { tempFileURL } = first;
		loginInfo.value = { ...loginInfo.value, url: `${tempFileURL}?t=${Math.floor(Math.random() * 1000)}` }; // 
		// console.log('loginInfo.value', loginInfo.value);
		addOrUpdateCommenter(loginInfo.value);
	}

	const onClickLike = (evt) => {
		if (!loggedIn.value) {
			plsLogin();
			return;
		}
		uni.navigateTo({
			url: "/pages/like/like"
		})
	}

	const onNameChange = (e) => {
		console.log("onNameChange", e);
		if (!e.detail.value) {
			uni.showToast({
				icon: 'none',
				title: '名字不可以为空'
			})
			loginInfo.value = { ...loginInfo.value, name: '匿名' };
			return;
		}
		loginInfo.value = { ...loginInfo.value, name: e.detail.value };
		addOrUpdateCommenter(loginInfo.value);
	}

	const onCms = (evt : any) => {
		// console.log('onCms evt', evt);
		const { quiztype } = evt.target.dataset;
		const queryStr = queryString.stringify({ quizType: quiztype })
		const url = `/pages/cms/cms?${queryStr}`;
		// console.log('onCms', url);
		uni.navigateTo({ url });
	};

	const onTask = () => {
		const url = `/pages/task/task`;
		uni.navigateTo({ url });
	};

	const login = async () => {
		if (loggedIn.value) return;
		const { id } = await getOpenId();
		const name = `用户${id.slice(-3, id.length)}`
		// console.log('登录后', { id, name });
		loginInfo.value = { ...loginInfo.value, id, name };
		userIdToDelete.value = id;
		console.log('userIdToDelete', userIdToDelete.value);
		// console.log('登录后 loginInfo', loginInfo.value);
		loggedIn.value = true;
		uni.showTabBar();
		uni.showToast({
			title: '登录成功'
		})

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

	// 关于分享
	const onShare = () => {
		uni.navigateTo({
			url: '/pages/share/share'
		})
	}

	const deleteQuiz = async () => {
		const quizType = quizTypeRadioValue.value;
		const userOpenId = userIdToDelete.value;
		console.log({ quizType, userOpenId });
		const { result } = await deleteQuizByTypeAndUserId(quizType, userOpenId);
		if (result.errMsg === "collection.remove:ok") {
			uni.showToast({
				title: '删除成功',
				icon: "none"
			})
		}
	}

	const quizTypeRadioValue = ref('js');
</script>

<style lang="scss" scoped>
	page {
		width: 100vw;
		height: 100vh;

		.mine-wrapper {
			// border: 1px solid green;
			height: 100vh;
			display: flex;
			flex-direction: column;
			justify-content: flex-start;
			align-items: center;
			background-color: $uni-bg-color-grey;
			overflow-y: auto;

			.mine__name {
				width: 200rpx;
				text-align: left;

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

	.menu-btn {
		border: none;
		height: 90rpx;
		font-size: $uni-font-size-sm;
	}

	:deep(.u-radio-group) {
		flex: none !important; // 如果不想加 !important 怎么办
	}

	.u-radio-group--raw {
		flex-flow: row nowrap;
	}
</style>