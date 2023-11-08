<template>
	<view class='home-wrapper'>
		<!-- 1 当前题库 -->
		<view class="card mb30" @click="onClickTitle">
			<view class="hbox mb20" style="justify-content: center;">
				<view class="text-primary" style="margin-right: 20rpx;">{{`当前题库: ${quizNameDic.get(curQuizType)}`}}
				</view>
				<u-icon class="icon" name="arrow-down-fill" color="#5ab8b3" size="25"></u-icon>
			</view>
			<view class="text-sm-grey">{{processDesc}}</view>
		</view>

		<!-- 2 继续 -->
		<view class="card mb30">
			<view class="text-primary mb20" style="align-self: flex-start;">顺序练习</view>
			<view class="text-sm-grey mb20" style="align-self: flex-start;">可选择从哪道题开始 有进度记录</view>
			<view class="hbox mb20" style="justify-content: space-between;">
				<view class="text-sm">选择题目</view>
				<view class="hbox text-sm" style="justify-content: flex-end;" @click='handler_showQuizSelectPopup'>
					{{`第 ${latestQuizSn + 1} 题`}}
					<u-icon name="arrow-right" :color="'#000'" size="35"></u-icon>
				</view>
			</view>
			<button class="btn-primary" @click="onBtnContinue">顺序练习</button>
		</view>

		<!-- 3 回顾练习 -->
		<view class="card mb30">
			<view class="text-primary mb20" style="align-self: flex-start;">回顾练习</view>
			<view class="text-sm-grey mb20" style="align-self: flex-start;">练习错题本 / 收藏夹中的题目</view>
			<button class="btn-primary mb20" @click="startErrCollection">错题练习</button>
			<button class="btn-primary" @click="startFavQuiz">收藏夹练习</button>
		</view>
	</view>
	<u-popup :safeAreaInsetTop='false' :round="10" :safe-area-inset-bottom="false" round='20' :overlay='true'
		:customStyle="{display:'flex', flexDirection:'column', alignItems:'center',
	justifyContent:'space-between', paddingLeft:'60rpx', paddingRight:'60rpx'}" :show="showSelectQuizTypePopup" mode="top"
		:close-on-click-overlay='true' @close="onSelectQuizTypePopupClose" @open="onSelectQuizTypePopupOpen">
		<view>
			<view class="choice" v-for="(item) in quizTypeArray" :data-id="item.value" @click="onSelectQuizType"
				:key="item.value">
				<text :key="item.value">{{item.label}}</text>
			</view>
		</view>
		<button class="btn-sub" style="margin-top: 10px; margin-bottom: 10px; width: 100%; font-size: 30rpx;"
			@click="closeSelectQuizTypePopup">取消</button>
	</u-popup>
	<u-popup :show="showQuizSelectPopup" :round="10" :custom-style="{ paddingBottom: '0px'}" mode="bottom"
		@close="onQuizSelectPopupClose" @open="onQuizSelectPopupOpen" :close-on-click-overlay="true">
		<view class="card">
			<view class="container-quiz-sn">
				<view class="quiz-sn" v-for="(item, index) in new Array(quizCount)" :key="index">{{index + 1 }}</view>
			</view>
			<button class="btn-sub mt20" v-text="'取消'" @click="closeSelectQuizPopup"></button>
		</view>
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

	/** 上一个题目的序号 从 1 开始*/
	const latestQuizSn = ref(0);
	const finishedQuizCount = ref(0);
	const quizCount = ref(0);
	const userOpenId = ref('');
	const curQuizType = ref('js');
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

	// 1 头部
	const onClickTitle = () => {
		showSelectQuizTypePopup.value = true;
	};

	const closeSelectQuizTypePopup = () => {
		showSelectQuizTypePopup.value = false;
	}

	const onSelectQuizTypePopupClose = (evt : any) => {
		showSelectQuizTypePopup.value = false;
	};

	const showSelectQuizTypePopup = ref(false);
	/** 题库发生变化 */
	const onSelectQuizType = async (evt : any) => {
		showSelectQuizTypePopup.value = false;
		curQuizType.value = evt.currentTarget.dataset.id;
		initData();
	};

	/** 2 顺序练习 */
	const onBtnContinue = async () => {
		// 1 题目类型
		const queryStr = queryString.stringify({ quizType: curQuizType.value, exerciseType: ExerciseType.Common, latest_quiz_index: latestQuizSn.value - 1 });
		const url = `/pages/quiz/index?${queryStr}`;
		uni.navigateTo({ url })
	};

	// 关于显示题目选择
	const showQuizSelectPopup = ref(false);
	const handler_showQuizSelectPopup = () => {
		showQuizSelectPopup.value = true;
	}
	const onQuizSelectPopupClose = () => {
		showQuizSelectPopup.value = false;
	}
	const onQuizSelectPopupOpen = () => {
		console.log('onQuizSelectPopupOpen')
	}
	const closeSelectQuizPopup = () => {
		showQuizSelectPopup.value = false;
	}

	/** 3 错题本 */
	const startErrCollection = async () => {
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

	/** 4 收藏夹做题 */
	const startFavQuiz = async () => {
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

	/** 更新进度 */
	const updateProcess = async () => {
		// 用用户 id 和题目类型拿进度
		const token = uni.getStorageSync('token');
		const rsp : any = await wx.cloud.callFunction({
			name: 'getProcess',
			data: { token, quiz_type: curQuizType.value }
		});
		const { latest_quiz_sn, finished_quiz_count } = rsp.result;
		latestQuizSn.value = latest_quiz_sn;
		finishedQuizCount.value = finished_quiz_count;
	}

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
			return `练习进度 ${finishedQuizCount.value}/${quizCount.value}`;
		} else {
			return `练习进度 ${finishedQuizCount.value}`;
		}
	})
</script>

<style lang="scss" scoped>
	page {
		width: 100vw;
		height: 100vh;
		overflow-y: hidden;

		.home-wrapper {
			width: 100vw;
			display: flex;
			flex-direction: column;
			padding: 30rpx;
			height: 100vh;
			background-color: $uni-bg-color-grey;
			align-items: center;
		}

		.container-quiz-sn {
			overflow-y: scroll;
			width: 100%;
			height: 100%;
			display: flex;
			justify-content: space-around;
			flex-wrap: wrap;

			.quiz-sn {
				width: 80rpx;
				height: 80rpx;
				background-color: gainsboro;
				display: flex;
				justify-content: center;
				align-items: center;
				border-radius: 40rpx;
				margin-right: 10rpx;
				margin-bottom: 10rpx;
			}
		}
	}

	.choice {
		font-size: $uni-font-size-base;
		color: #333333;
		margin-top: 30rpx;
	}
</style>