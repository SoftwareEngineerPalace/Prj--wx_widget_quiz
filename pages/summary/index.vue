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

	const quizType : Ref<string> = ref('js');

	const quizCount : Ref<number> = ref(0);
	const answerTimes : Ref<number> = ref(0);

	const correctTimes : Ref<number> = ref(0);

	const correctRate = computed(() => {
		const rate = Math.floor((correctTimes.value / answerTimes.value) * 100);
		return `${rate}%`;
	});

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

	onLoad(async (evt : { quizType : string }) => {
		// console.log("summary onLoad", evt);
		if (evt.hasOwnProperty('quizType')) {
			quizType.value = evt.quizType;
			getHistory(evt.quizType)
		}
	})

	interface IQuizHistory {
		quiz_count : number;
		answer_times : number;
		correct_times : number;
	}

	const getHistory = async (quiz_type : string) => {
		// 加载做题历史记录
		const token = uni.getStorageSync('token');
		const data = {
			name: 'getQuizHistory',
			data: { token, quiz_type }
		};
		// console.log('getHistory data', data);
		const rsp = await wx.cloud.callFunction(data);
		// console.log("summary getHistory getQuizHistory 加载做题历史记录", rsp);
		const { quiz_count, answer_times, correct_times } = rsp.result as IQuizHistory;
		// console.log({ quiz_count, answer_times, correct_times });
		quizCount.value = quiz_count;
		answerTimes.value = answer_times;
		correctTimes.value = correct_times;
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