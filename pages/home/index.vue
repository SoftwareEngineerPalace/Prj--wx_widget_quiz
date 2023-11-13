<template>
	<view class='home-wrapper'>
		<!-- 1 当前题库 -->
		<view class="card mb40 padding40" @click="onClickTitle">
			<view class="hbox">
				<u-image :show-loading="true" shape="circle" :src="logoUrl" width="140rpx" height="140rpx"></u-image>
				<view class="vbox" style="width: 100%;">
					<view class="hbox mb20" style="justify-content: center;">
						<view class="text-primary" style="margin-right: 20rpx;">
							{{`当前题库: ${quizNameDic.get(curQuizType)}`}}
						</view>
						<u-icon name="arrow-down-fill" :color="themeColor" size="25"></u-icon>
					</view>
					<view class="text-sm-grey">{{`练习进度 ${finishedQuizCount} / ${quizCount}`}}</view>
				</view>
			</view>
		</view>

		<!-- 2 继续 -->
		<view class="card padding40 mb40">
			<view class="text-primary mb20" style="align-self: flex-start;">顺序练习</view>
			<view class="text-sm-grey mb20" style="align-self: flex-start;">可选择从哪道题开始 有进度记录</view>
			<view class="hbox mb20" style="justify-content: space-between;">
				<view class="text-sm">选择题目</view>
				<view class="hbox text-sm" style="justify-content: flex-end;" @click='handler_showQuizSelectPopup'>
					<view class="text-sm" style="margin-right: 15rpx;">{{`第 ${latestQuizSn + 1} 题`}}</view>
					<u-icon name="arrow-right" :color="'#000'" size="35"></u-icon>
				</view>
			</view>
			<button class="btn-primary" @click="onBtnContinue">开始</button>
		</view>

		<!-- 3 回顾练习 -->
		<view class="card mb40 padding40">
			<view class="text-primary mb20" style="align-self: flex-start;">回顾练习</view>
			<view class="text-sm-grey mb20" style="align-self: flex-start;">练习错题本 / 收藏夹中的题目</view>
			<button class="btn-primary mb20" @click="startErrCollection">错题</button>
			<button class="btn-primary" @click="startFavQuiz">收藏夹</button>
		</view>

		<view class="card padding40">
			<button class="btn-sub" v-text="'我的成绩'" @click="gotoSummary"></button>
		</view>
	</view>

	<u-popup :safeAreaInsetTop='false' :safe-area-inset-bottom="false" round='20' :overlay='true' :customStyle="{display:'flex', flexDirection:'column', alignItems:'center',
	justifyContent:'space-between', paddingLeft:'60rpx', paddingRight:'60rpx'}" :show="showSelectQuizTypePopup" mode="top"
		:close-on-click-overlay='true' @close="onSelectQuizTypePopupClose">
		<view class="list-wrapper">
			<view class="choice" v-for="(item) in quizTypeArray" :data-id="item.value" @click="onSelectQuizType"
				:key="item.value">
				<text :key="item.value">{{item.label}}</text>
			</view>
		</view>
		<button class="btn-sub mb30" style="width: 100%;" @click="closeSelectQuizTypePopup">取消</button>
	</u-popup>

	<u-popup :safeAreaInsetBottom='false' :show="showQuizSelectPopup" round="20" :custom-style="{ padding: '20px', backgroundColor: '#ffffff', maxHeight: '650rpx', display:'flex', flexDirection: 'column', 
	justifyContent:'flex-start', alignItems:'center' }" mode="bottom" @close="onQuizSelectPopupClose"
		@open="onQuizSelectPopupOpen" :close-on-click-overlay="true">
		<view class="grid-quiz-sn">
			<view class="quiz-sn" v-for="(item, index) in new Array(quizCount)" :data-sn="index + 1" :key="index"
				@click="selectQuizSn">{{index + 1 }}</view>
		</view>
	</u-popup>

</template>

<script lang="ts" setup>
	import { throttle } from 'lodash';
	import { ExerciseType, quizNameDic, quizTypeArray, logoImgUrlDeep, qrCode } from '../../common/common';
	import { computed, onMounted, ref } from 'vue';

	import { checkSession } from '../../common/utils';
	import queryString from 'query-string';
	import { onShow, onLoad, onInit, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
	import { getAllQuiz, getErrorCollectonQuiz, getFavoriteQuiz, progressPostOrPut, getRankingList } from '../../service';

	/** 上一个题目的序号 从 1 开始*/
	const latestQuizSn = ref(0);
	const finishedQuizCount = ref(0);
	const quizCount = ref(0);
	const userOpenId = ref('');
	const curQuizType = ref('js');
	const quizList = ref();
	const logoUrl = ref(logoImgUrlDeep);
	const themeColor = ref(getApp().globalData.themeColor)

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

	// 只更新一次
	onLoad(async () => {
		const hasSession = await checkSession();
		const token = uni.getStorageSync('token');
		console.log('home onLoad', { hasSession, token })
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
			// console.log("getCommenter", rsp);
			if (rsp.result.data.length === 0) return;
			const [first] = rsp.result.data;
			delete first._id;
			(getApp().globalData as any).loginInfo = first;// 存到这里有什么用
			// console.log("(getApp().globalData as any).loginInfo", (getApp().globalData as any).loginInfo);
		}
	})

	// 每次展示都会调用
	onShow(() => {
		initData()
	})

	const initData = async () => {
		// 1 错题本
		getErrorQuizList();
		// 2 收藏
		getFavoriteQuizList();
		// 3 全部题
		await getAllQuizList();
		// 4 进度
		updateProgress();
		// 5 排名
		getRanking();
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

	const selectQuizSn = (evt) => {
		// 关闭 popup
		showQuizSelectPopup.value = false;
		// latestQuizSn 内存更新 
		const nextQuizSn = evt.currentTarget.dataset.sn;
		console.log('evt', nextQuizSn);
		latestQuizSn.value = nextQuizSn - 1;
		// latestQuizSn db 更新
		progressPostOrPut(curQuizType.value, latestQuizSn.value);
		// 显示该题
		// onBtnContinue();
	}

	/** 3 错题本 */
	const startErrCollection = async () => {
		// 1 题目类型
		const quizType = curQuizType.value;

		const list = getApp().globalData.errList;
		if (list.length === 0) {
			uni.showToast({
				title: "还没有错题",
				icon: "none",
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
				icon: "none",
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
	const updateProgress = async () => {
		// 用用户 id 和题目类型拿进度
		const token = uni.getStorageSync('token');
		const rsp : any = await wx.cloud.callFunction({
			name: 'getProcess',
			data: { token, quiz_type: curQuizType.value }
		});
		// 下面几行代码 真别扭
		const { latest_quiz_sn, finished_quiz_count } = rsp.result;
		// console.log({ latest_quiz_sn, quizCount: quizCount.value });
		latestQuizSn.value = latest_quiz_sn !== quizCount.value ? latest_quiz_sn : 0;
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

	const getRanking = async () => {
		const list = await getRankingList(curQuizType.value);
		// console.log("getRanking", list);
		(getApp().globalData as any).rankingList = list;
	}

	const gotoSummary = () => {
		const list = getApp().globalData.rankingList;
		if (list.length === 0) {
			uni.showToast({
				title: "数据还没加载完",
				icon: "none",
				duration: 500
			})
			return;
		}
		const quizType = curQuizType.value;
		uni.navigateTo({
			url: `/pages/summary/index?quizType=${quizType}`
		})
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
			overflow-y: scroll;
		}

		.grid-quiz-sn {
			overflow-y: auto;
			width: 100%;
			height: 100%;
			background-color: white;
			display: grid;
			grid-template-columns: repeat(5, 1fr);
			grid-row-gap: 30rpx;
			justify-items: center;

			.quiz-sn {
				width: 90rpx;
				height: 90rpx;
				background-color: #eeeeee;
				display: flex;
				justify-content: center;
				align-items: center;
				border-radius: 45rpx;
			}
		}
	}

	.choice {
		font-size: $uni-font-size-base;
		color: #333333;
		padding: 10px;
		display: flex;
		justify-content: center;
		border-bottom: 1px solid $uni-border-color-lighter;

		// border: red 1px solid;
		&:last-child {
			border-bottom: none;
		}
	}
</style>