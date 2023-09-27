<template>
	<view class="main">
		<view class="row-view">
			{{`一共有 ${quizCount} 道题`}}
		</view>
		<view class="row-view">
			{{`你一共作答 ${answerTimes} 道次，答对了 ${correctTimes} 道次`}}
		</view>
		<view class="row-view">
			{{`正确率 ${ correctRate}`}}
		</view>
		<button class='btn-restart' type="primary" @click="restart">重做</button>
	</view>

</template>

<script lang="ts" setup>
	import { Ref, ref, computed } from 'vue';
	import { onLoad } from '@dcloudio/uni-app';
	import { IQuizHistory } from '../../common/utils';

	const quizType = ref("js");
	const quizCount = ref(0);
	const answerTimes = ref(0);
	const correctTimes = ref(0);

	onLoad((evt : { quizType : string }) => {
		console.log('summary onLoad', evt);
		if (evt.hasOwnProperty('quizType')) {
			quizType.value = evt.quizType;
			getHistory(evt.quizType)
		}
	})

	const correctRate = computed(() => {
		const rate = Math.floor((correctTimes.value / answerTimes.value) * 100);
		return `${rate}%`;
	})

	const getHistory = async (quiz_type : string) => {
		// 加载做题历史记录
		const token = uni.getStorageSync('token');
		const data = {
			name: 'getQuizHistory',
			data: { token, quiz_type }
		};
		console.log('getHistory data', data);
		const rsp : { result : IQuizHistory } = await wx.cloud.callFunction(data);
		console.log("summary getHistory getQuizHistory 加载做题历史记录", rsp);
		const { quiz_count, answer_times, correct_times } = rsp.result;
		console.log({ quiz_count, answer_times, correct_times });
		quizCount.value = quiz_count;
		answerTimes.value = answer_times;
		correctTimes.value = correct_times;
	};

	const restart = async () => {
		// const queryStr = queryString.stringify({ quizType: quizType.value });
		const token = uni.getStorageSync('token');
		const data = {
			name: 'resetProcess',
			data: { token, quiz_type: quizType.value }
		};
		await wx.cloud.callFunction(data);
		uni.navigateBack();
	}
</script>

<style lang='scss'>
	.main {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
		padding-top: 40rpx;

		.row-view {
			margin-bottom: 40rpx;
		}
	}
</style>