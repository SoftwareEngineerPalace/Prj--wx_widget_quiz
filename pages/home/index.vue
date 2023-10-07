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
			<button class="btn-primary" @click="continueExercise">继续练习</button>
		</view>

		<!-- 3 回顾练习 -->
		<view class="card">
			<view class="text-primary mb20" style="align-self: flex-start;">回顾练习</view>
			<view class="text-sub mb20" style="align-self: flex-start;">练习错题本 / 收藏夹中的题目</view>
			<button class="btn-primary mb20" @click="startErrCollection">错题练习</button>
			<button class="btn-primary" @click="startFavQuiz" :disabled="true">收藏夹练习</button>
		</view>

	</view>
	<u-popup :safeAreaInsetTop='false' :safe-area-inset-bottom="false" :customStyle="{display:'flex', flexDirection:'column', alignItems:'center',
	justifyContent:'space-between', paddingLeft:'60rpx', paddingRight:'60rpx'}" round='20' :overlay='true'
		:show="showSelectPopup" mode="top" :close-on-click-overlay='true'>
		<view>
			<view class="choice" v-for="(item) in quizTypeArray" :data-id="item.value" @click="onSelectQuizType">
				<text :key="item.value">{{item.label}}</text>
			</view>
		</view>
		<button class="btn-sub" style="margin-top: 10px; margin-bottom: 10px; width: 100%;"
			@click="closeSelectPop">取消</button>
	</u-popup>
</template>

<script lang="ts" setup>
	declare const wx : any;
	import { computed, onMounted, Ref, ref } from 'vue';

	import { checkSession, quizNameDic, quizTypeArray, IQuiz } from '../../common/utils';
	import queryString from 'query-string';
	import { onShow, onLoad } from '@dcloudio/uni-app';

	const latestQuizIndex = ref(-1);
	const quizCount : Ref<number> = ref(0);
	const userOpenId = ref('');
	const curQuizType = ref('js');
	const showSelectPopup = ref(false);

	onShow(() => {
		console.log("home index onShow");
		updateOnQuizTypeChanged();
		updateUI();
	})

	onMounted(async () => {
		const hasSession = await checkSession();
		const token = uni.getStorageSync('token');
		if (!hasSession || !token) {
			uni.switchTab({
				url: '/pages/mine/index'
			})
		}
	})

	const processDesc = computed(() => {
		if (quizCount.value) {
			return `练习进度 ${latestQuizIndex.value}/${quizCount.value}`;
		} else {
			return `练习进度 ${latestQuizIndex.value}`;
		}
	})

	const updateUI = () => {
		const token = uni.getStorageSync('token');
		const [user_open_id] = token.split("__");
		userOpenId.value = user_open_id;
	};

	/** 题目类型变化后，更新数据 */
	const updateOnQuizTypeChanged = async () => {
		// 用用户id和题目类型拿进度
		const token = uni.getStorageSync('token');
		const rsp : any = await wx.cloud.callFunction({
			name: 'getProcess',
			data: { token, quiz_type: curQuizType.value }
		});
		console.log('index updateOnQuizTypeChanged 获得题目进度', rsp.result)
		const { latest_quiz_sn, quiz_count } = rsp.result;
		latestQuizIndex.value = latest_quiz_sn;
		quizCount.value = quiz_count;
	};

	const onClickTitle = () => {
		showSelectPopup.value = true;
	};

	const closeSelectPop = (evt : any) => {
		showSelectPopup.value = false;
	};

	const onSelectQuizType = (evt : any) => {
		// console.log("onSelectQuizType", evt);
		showSelectPopup.value = false;
		const quizType = evt.currentTarget.dataset.id;
		curQuizType.value = quizType;
		updateOnQuizTypeChanged();
	};

	const getAllQuizs = async (dbName : string) => {
		const rsp : any = await wx.cloud.callFunction({
			name: 'getAllQuiz',
			data: { dbName }
		});
		return rsp.result.data;
	};

	/** 继续练习 */
	const continueExercise = async () => {
		// 1 题目类型
		const quizType = curQuizType.value;

		// 2 题目数据
		const data : IQuiz[] = await getAllQuizs(quizType);

		// 3 最后一个题目序号
		const token = uni.getStorageSync('token');
		const rsp : any = await wx.cloud.callFunction({
			name: 'getProcess',
			data: { token, quiz_type: quizType }
		});
		const latest_quiz_index = rsp.result.latest_quiz_sn - 1;

		// 传给下一页的数据
		console.log('continueExercise', { quizType, quizList: data, latest_quiz_index })
		const queryStr = queryString.stringify({ quizType, quizList: JSON.stringify(data), latest_quiz_index });

		const url = `/pages/quiz/index?${queryStr}`;
		uni.navigateTo({ url })
	};

	/** 错题本 */
	const startErrCollection = () => {
		// 根据 quizType userId latest_anwer 获取题目

	}

	/** 收藏夹做题 */
	const startFavQuiz = () => {

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