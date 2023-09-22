<template>
	<view class="main">
		<view class="container-title" @click="onClickTitle">
			<view>{{`当前题库: ${quizNameDic.get(curQuizType)}`}}</view>
			<view>{{processDesc}}</view>
		</view>
		<view class="container-continue">
			<view>继续</view>
			<view>从上次中断的地方继续练习</view>
			<button type="primary" @click="continueExercise">继续练习</button>
		</view>
		<!-- <button class="btn" @click="onQuiz" data-quizType="js" type="primary">JavaScript 答题</button> -->
		<!-- <button class="btn" @click="onCms" data-quizType="js">JavaScript 后台</button> -->

		<!-- <button class="btn" @click="onQuiz" data-quizType="es6" type="primary">ECMAScript 6 答题</button> -->
		<!-- <button class="btn" @click="onCms" data-quizType="es6">ECMAScript 6 后台</button> -->

		<!-- <button class="btn" @click="onQuiz" data-quizType="ts" type="primary">TypeScript 答题</button> -->
		<!-- <button class="btn" @click="onCms" data-quizType="ts">TypeScript 后台</button> -->
	</view>
	<u-popup :safeAreaInsetTop='false' :customStyle="{display:'flex', flexDirection:'column', alignItems:'center', 
	justifyContent:'space-between'}" round='20' :overlay='true' :show="showSelectPopup" mode="top"
		@close="onSelectPopupClose">
		<view v-for="(item) in quizTypeArray" :data-id="item.value" @click="onSelectQuizType">
			<text :key="item.value">{{item.label}}</text>
		</view>
		<u-line color="#aaaaaa"></u-line>
		<button @click="closeSelectPop">取消</button>
	</u-popup>
</template>

<script setup lang="ts">
	import { computed, onMounted, Ref, ref } from 'vue';
	import { checkSession, quizNameDic, quizTypeArray } from '../../common/utils';
	import queryString from 'query-string';
	import { onShow, onLoad } from '@dcloudio/uni-app';

	const latestQuizIndex : Ref<number> = ref(0);
	const quizCount : Ref<number> = ref(0);
	// 题目类型
	const curQuizType : Ref<string> = ref('js');
	// 题目选择器的 show
	const showSelectPopup : Ref<boolean> = ref(false);

	const processDesc = computed(() => {
		if (quizCount.value) {
			return `本题库已练习 ${latestQuizIndex.value + 1}/${quizCount.value}`;
		} else {
			return '还没开始练习';
		}
	})

	onShow(async () => {
		console.log("index onShow");
		updateOnQuizTypeChanged();
	})

	onLoad(() => {

	})

	/** 题目类型变化后，更新数据 */
	const updateOnQuizTypeChanged = async () => {
		// 用用户id和题目类型拿进度
		const token = uni.getStorageSync('token');
		const rsp : any = await wx.cloud.callFunction({
			name: 'getProcess',
			data: { token, quiz_type: curQuizType.value }
		});
		console.log('index updateOnQuizTypeChanged 获得题目进度', rsp.result)
		const { latest_quiz_index, quiz_count } = rsp.result;
		latestQuizIndex.value = latest_quiz_index;
		quizCount.value = quiz_count;
	}

	onMounted(async () => {
		const hasSession = await checkSession();
		const token = uni.getStorageSync('token');
		// console.log({ hasSession, token })
		if (!hasSession || !token) {
			uni.switchTab({
				url: '/pages/mine/index'
			})
		}
	})

	const continueExercise = () => {
		const quizType = curQuizType.value;
		const queryStr = queryString.stringify({ quizType });
		const url = `/pages/quiz/index?${queryStr}`;
		console.log('continueExercise', url);
		uni.navigateTo({ url })
	}

	const onClickTitle = () => {
		showSelectPopup.value = true;
	}

	const onQuiz = (evt : any) => {
		// console.log('onQuiz evt', evt);
		const { quiztype } = evt.target.dataset;
		const queryStr = queryString.stringify({ quizType: quiztype });
		const url = `/pages/quiz/index?${queryStr}`;
		// console.log('onQuiz', url);
		uni.navigateTo({ url })
	}

	const onCms = (evt : any) => {
		console.log('onCms evt', evt);
		const { quiztype } = evt.target.dataset;
		const queryStr = queryString.stringify({ quizType: quiztype })
		const url = `/pages/cms/index?${queryStr}`;
		// console.log('onCms', url);
		uni.navigateTo({ url });
	}

	const onSelectPopupClose = (evt : any) => {
		// console.log('onSelectPopupClose')
	}

	const closeSelectPop = (evt : any) => {
		showSelectPopup.value = false;
	}

	const onSelectQuizType = (evt : any) => {
		// console.log("onSelectQuizType", evt);
		showSelectPopup.value = false;
		const quizType = evt.currentTarget.dataset.id;
		curQuizType.value = quizType;
		updateOnQuizTypeChanged()
	}
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
			justify-content: flex-start;
			align-items: center;

			.container-title {
				width: 90%;
				background-color: white;
				border-radius: 20rpx;
				display: flex;
				flex-direction: column;
				align-items: center;
			}

			.container-continue {
				margin-top: 30rpx;
				border-radius: 20rpx;
				width: 90%;
				background-color: white;
				display: flex;
				flex-direction: column;
				align-items: flex-start;
			}
		}
	}
</style>