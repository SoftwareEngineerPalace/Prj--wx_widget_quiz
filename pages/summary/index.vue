<template>
	<view class="summary-wrapper">
		<!-- <view class="text-primary mb20">我的成绩</view> -->
		<view class="card mb20">
			<view class="summary__row-view">
				{{`你一共做了 ${quizCount} 道题`}}
			</view>
			<view class="summary__row-view">
				{{`作答 ${answerTimes} 道次，答对了 ${correctTimes} 道次`}}
			</view>
			<view class="summary__row-view">
				{{`正确率 ${ correctRate} %`}}
			</view>
			<button class='btn-primary' @click="restart">重做</button>
		</view>
		<view class="text-primary mb20">排行榜</view>
		<view class="card" style="flex-grow: 1; overflow-y: auto;">
			<uni-table stripe emptyText="正在计算...">
				<!-- 表头行 -->
				<uni-tr>
					<uni-th width="60rpx" align="center">排名</uni-th>
					<uni-th width="120rpx" align="center">用户</uni-th>
					<uni-th align="center"></uni-th>
					<uni-th width="90rpx" sortable align="center">做题数</uni-th>
					<uni-th width="90rpx" sortable align="center">做题次数</uni-th>
					<uni-th width="90rpx" sortable align="center">正确次数</uni-th>
					<uni-th width="90rpx" sortable align="center">正确率</uni-th>
				</uni-tr>
				<uni-tr style="width: 100%;" align="center" v-for="(r, index) in rankList" :key="index">

					<uni-td align="center">
						<view class="grid-center">{{ index + 1 }}</view>
					</uni-td>

					<uni-td align="center">
						<view class="grid-center">{{ r.user_name }}</view>
					</uni-td>

					<uni-td align="center">
						<view class="grid-center">
							<u-image shape="circle" :src="r.user_url" width="50rpx" height="50rpx"></u-image>
						</view>
					</uni-td>

					<uni-td align="center">
						<view class="grid-center">
							{{ r.quiz_count }}
						</view>
					</uni-td>

					<uni-td align="center">
						<view class="grid-center">
							{{ r.answer_times }}
						</view>
					</uni-td>

					<uni-td align="center">
						<view class="grid-center">
							{{ r.correct_times }}
						</view>
					</uni-td>

					<uni-td align="center">
						<view class="grid-center">
							{{ `${r.rate} %` }}
						</view>
					</uni-td>
				</uni-tr>
			</uni-table>
		</view>
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
	const rankList = ref(0);

	onLoad((evt : { quizType : string }) => {
		// console.log('summary onLoad', evt);
		if (evt.hasOwnProperty('quizType')) {
			quizType.value = evt.quizType;
			getHistory(evt.quizType)
		}
	})

	const correctRate = ref(0);

	const getHistory = async (quiz_type : string) => {
		// 加载做题历史记录
		const token = uni.getStorageSync('token');
		const data = {
			name: 'getQuizHistory',
			data: { token, quiz_type }
		};
		const { result: list } = await wx.cloud.callFunction(data);
		console.log('summary getHistory', { list });
		let raw = [...list, ...list];
		const sorted_list = raw.sort((a, b) => a.rate - b.rate);// rate 从大到小
		rankList.value = sorted_list;
		const { quiz_count, answer_times, correct_times, rate } = list.find(r => r.isMe);
		correctRate.value = rate;
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
	.summary-wrapper {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
		padding: 20rpx 30rpx 30rpx 30rpx;
		height: 100vh;
		background-color: $uni-bg-color-grey;

		.summary__row-view {
			margin-bottom: 30rpx;
		}
	}

	.uni-table {
		min-width: 100% !important;
	}

	.uni-table-td {
		padding: 14rpx !important;
		vertical-align: middle;
	}
</style>