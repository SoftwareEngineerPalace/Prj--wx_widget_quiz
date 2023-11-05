<template>
	<view class='home-wrapper'>
		<!-- 1 当前题库 -->
		<view class="card mb30" @click="onClickTitle">
			<view class="hbox mb20" style="justify-content: center;">
				<view class="text-primary" style="margin-right: 20rpx;">{{`当前题库: ${quizNameDic.get(curQuizType)}`}}
				</view>
				<u-icon class="icon" name="arrow-down-fill" color="#5ab8b3" size="25"></u-icon>
			</view>
			<view class="text-sub">{{processDesc}}</view>
		</view>

		<!-- 2 继续 -->
		<view class="card mb30">
			<view class="text-primary mb20" style="align-self: flex-start;">继续</view>
			<view class="text-sub mb20" style="align-self: flex-start;">从上次中断的地方继续练习</view>
			<button class="btn-primary" @click="onBtnContinue">继续练习</button>
		</view>

		<!-- 3 回顾练习 -->
		<view class="card mb30">
			<view class="text-primary mb20" style="align-self: flex-start;">回顾练习</view>
			<view class="text-sub mb20" style="align-self: flex-start;">练习错题本 / 收藏夹中的题目</view>
			<button class="btn-primary mb20" @click="startErrCollection">错题练习</button>
			<button class="btn-primary" @click="startFavQuiz">收藏夹练习</button>
		</view>

		<!-- <view class="card">
			<video :src="videoUrl"></video>
		</view> -->
	</view>
	<u-popup :safeAreaInsetTop='false' :safe-area-inset-bottom="false" :customStyle="{display:'flex', flexDirection:'column', alignItems:'center',
	justifyContent:'space-between', paddingLeft:'60rpx', paddingRight:'60rpx'}" round='20' :overlay='true'
		:show="showSelectPopup" mode="top" :close-on-click-overlay='true'>
		<view>
			<view class="choice" v-for="(item) in quizTypeArray" :data-id="item.value" @click="onSelectQuizType"
				:key="item.value">
				<text :key="item.value">{{item.label}}</text>
			</view>
		</view>
		<button class="btn-sub" style="margin-top: 10px; margin-bottom: 10px; width: 100%;"
			@click="closeSelectPop">取消</button>
	</u-popup>
</template>

<script lang="ts" setup>
	import { throttle } from 'lodash';
	import { ExerciseType, quizNameDic, quizTypeArray } from '../../common/common';
	import { computed, onMounted, ref } from 'vue';

	import { checkSession } from '../../common/utils';
	import queryString from 'query-string';
	import { onShow, onLoad, onInit } from '@dcloudio/uni-app';
	import { getAllQuiz, getErrorCollectonQuiz, getFavoriteQuiz } from '../../service';

	const latestQuizIndex = ref(0);
	const quizCount = ref(0);
	const userOpenId = ref('');
	const curQuizType = ref('js');
	const showSelectPopup = ref(false);
	const quizList = ref();

	// 只更新一次
	onLoad(async () => {
		const hasSession = await checkSession();
		const token = uni.getStorageSync('token');
		// console.log('home onLoad', { hasSession, token })
		if (!hasSession || !token) {
			uni.switchTab({
				url: '/pages/mine/index'
			})
			uni.hideTabBar();
		} else {
			// 如果已登录，就去数据库取用户数据
			const id = token.split("__")[0];
			const rsp = await wx.cloud.callFunction({
				name: 'getCommenter',
				data: { id }
			});
			if (rsp.result.data.length === 0) return;
			(getApp().globalData as any).loginInfo = rsp.result.data[0];// 存到这里有什么用
		}
	})

	// 每次展示都会调用
	onShow(() => {
		// console.log("home onShow")
		initData()
	})

	const initData = () => {
		// 1 进度
		updateProcess();
		// 2 全部题
		getAllQuizList();
		// 2 错题本
		getErrorQuizList();
		// 3 收藏
		getFavoriteQuizList();
	}

	/** 题库发生变化 */
	const onSelectQuizType = async (evt : any) => {
		// console.log("onSelectQuizType", evt);
		showSelectPopup.value = false;
		const quizType = evt.currentTarget.dataset.id;
		curQuizType.value = quizType;
		initData();
	};

	const getAllQuizList = async () => {
		const list = await getAllQuiz(curQuizType.value);
		(getApp().globalData as any).quizList = list;
		quizCount.value = list.length;
	}

	const getErrorQuizList = async () => {
		const list = await getErrorCollectonQuiz(curQuizType.value);
		(getApp().globalData as any).errList = list;
	}

	const getFavoriteQuizList = async () => {
		const list = await getFavoriteQuiz(curQuizType.value);
		(getApp().globalData as any).favList = list;
	}

	const processDesc = computed(() => {
		if (quizCount.value) {
			return `练习进度 ${latestQuizIndex.value}/${quizCount.value}`;
		} else {
			return `练习进度 ${latestQuizIndex.value}`;
		}
	})

	/** 更新进度 */
	const updateProcess = async () => {
		// 用用户 id 和题目类型拿进度
		const token = uni.getStorageSync('token');
		const rsp : any = await wx.cloud.callFunction({
			name: 'getProcess',
			data: { token, quiz_type: curQuizType.value }
		});
		const { latest_quiz_sn } = rsp.result;
		latestQuizIndex.value = latest_quiz_sn;
	}

	const onClickTitle = () => {
		showSelectPopup.value = true;
	};

	const closeSelectPop = (evt : any) => {
		showSelectPopup.value = false;
	};

	/** 继续练习 */
	const onBtnContinue = async () => {
		// 1 题目类型
		const queryStr = queryString.stringify({ quizType: curQuizType.value, exerciseType: ExerciseType.Common, latest_quiz_index: latestQuizIndex.value - 1 });
		console.time('navigateTo')
		const url = `/pages/quiz/index?${queryStr}`;
		uni.navigateTo({ url })
	};

	/** 错题本 */
	const startErrCollection = async () => {
		console.time('navigateTo')
		// 1 题目类型
		const quizType = curQuizType.value;

		const list = getApp().globalData.errList;
		if (list.length === 0) {
			uni.showToast({
				title: "还没有错题",
				duration: 1000
			})
			return;
		}
		// 传给下一页的数据
		const queryStr = queryString.stringify({ quizType, exerciseType: ExerciseType.ErrCollection, latest_quiz_index: -1 });
		const url = `/pages/quiz/index?${queryStr}`;
		uni.navigateTo({ url })
	}

	/** 收藏夹做题 */
	const startFavQuiz = async () => {
		console.time('navigateTo')
		// 1 题目类型
		const quizType = curQuizType.value;

		const list = getApp().globalData.favList;
		// console.log('startErrCollection', { list });
		if (list.length === 0) {
			uni.showToast({
				title: "还没有收藏",
				duration: 1000
			})
			return;
		}

		// 传给下一页的数据
		const queryStr = queryString.stringify({ quizType, exerciseType: ExerciseType.Favorite, latest_quiz_index: -1 });
		const url = `/pages/quiz/index?${queryStr}`;
		uni.navigateTo({ url })
	}
</script>

<style lang="scss" scoped>
	page {
		width: 100vw;
		height: 100vh;

		.home-wrapper {
			width: 100vw;
			display: flex;
			flex-direction: column;
			padding: 30rpx;
			height: 100vh;
			background-color: $uni-bg-color-grey;
			align-items: center;
		}
	}

	.choice {
		font-size: $uni-font-size-lg;
		color: #333333;
		margin-top: 30rpx;
	}
</style>