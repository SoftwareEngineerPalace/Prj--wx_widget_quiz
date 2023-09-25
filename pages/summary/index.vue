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

<script lang="ts">
	// import { Ref, ref, computed } from 'vue';
	// import { onLoad } from '@dcloudio/uni-app';
	
	interface IQuizHistory {
		quiz_count : number;
		answer_times : number;
		correct_times : number;
	}
	export default {
		data() {
			return {
				quizType: "js",
				quizCount: 0,
				answerTimes: 0,
				correctTimes: 0,
			}
		},
		onLoad(evt : { quizType : string }) {
			if (evt.hasOwnProperty('quizType')) {
				this.quizType = evt.quizType;
				this.getHistory(evt.quizType)
			}
		},
		computed: {
			correctRate() {
				const rate = Math.floor((this.correctTimes / this.answerTimes) * 100);
				return `${rate}%`;
			}
		},
		methods: {
			async getHistory(quiz_type : string) {
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
				this.quizCount = quiz_count;
				this.answerTimes = answer_times;
				this.correctTimes = correct_times;
			},
			async restart() {
				// const queryStr = queryString.stringify({ quizType: quizType.value });
				const token = uni.getStorageSync('token');
				const data = {
					name: 'resetProcess',
					data: { token, quiz_type: this.quizType }
				};
				await wx.cloud.callFunction(data);
				uni.navigateBack();
			}
		}
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