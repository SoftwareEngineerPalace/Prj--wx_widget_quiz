<template>
	<view class="summary-wrapper">
		<!-- <view class="text-primary mb20">我的成绩</view> -->
		<view class="card mb40">
			<view class="summary__row-view">
				{{`我一共做了 ${quizCount} 道题`}}
			</view>
			<view class="summary__row-view">
				{{`作答 ${answerTimes} 道次，答对了 ${correctTimes} 道次`}}
			</view>
			<view class="summary__row-view">
				{{`正确率 ${ correctRate} %`}}
			</view>
			<button class='btn-primary' @click="restart">重做</button>
		</view>
		<view class="text-sm-grey mb10 mr30" style="align-self: flex-end;">( 点击列头可排序 )</view>
		<view class="card" style="padding-top: 25rpx;">
			<uni-table stripe emptyText="正在计算...">
				<uni-tr>
					<uni-th width="50rpx" align="center">排名</uni-th>
					<uni-th width="130rpx" align="center">用户</uni-th>
					<uni-th align="center"></uni-th>
					<uni-th width="60rpx" sortable align="center">
						<view @click="onSort('quiz_count')">做题数</view>
					</uni-th>
					<uni-th width="90rpx" sortable align="center">
						<view @click="onSort('answer_times')">做题道次</view>
					</uni-th>
					<uni-th width="90rpx" sortable align="center">
						<view @click="onSort('correct_times')">正确道次</view>
					</uni-th>
					<uni-th width="110rpx" sortable align="center">
						<view @click="onSort('rate')">正确率</view>
					</uni-th>
					<uni-th width="50rpx" sortable align="center">
						<view @click="onSort('received_like_count')">评论获赞</view>
					</uni-th>
				</uni-tr>
				<uni-tr style="width: 100%;" align="center" v-for="(user, index) in rankList" :key="user.user_id">

					<uni-td align="center">
						<view class="grid-center">{{ index + 1 }}</view>
					</uni-td>

					<uni-td align="center">
						<view class="grid-center grid-ellipse">{{ user.user_name }}</view>
					</uni-td>

					<uni-td align="center">
						<view class="grid-center">
							<u-image shape="circle" :src="user.user_url" width="50rpx" height="50rpx"></u-image>
						</view>
					</uni-td>

					<uni-td align="center">
						<view class="grid-center">
							{{ user.quiz_count }}
						</view>
					</uni-td>

					<uni-td align="center">
						<view class="grid-center">
							{{ user.answer_times }}
						</view>
					</uni-td>

					<uni-td align="center">
						<view class="grid-center">
							{{ user.correct_times }}
						</view>
					</uni-td>

					<uni-td align="center">
						<view class="grid-center">
							{{ `${user.rate} %` }}
						</view>
					</uni-td>
					<uni-td align="center">
						<view class="grid-center grid-like">
							{{ `${user?.received_like_count ?? 0}` }}
						</view>
					</uni-td>
				</uni-tr>
			</uni-table>
		</view>
	</view>

</template>

<script lang="ts" setup>
	import { Ref, ref, computed, toRaw } from 'vue';
	import { IQuizHistory } from '../../common/utils';
	import { quizNameDic, qrCode } from '../../common/common';
	import {
		onShareAppMessage,
		onShareTimeline,
		onLoad, onShow, onInit
	} from '@dcloudio/uni-app';

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

	const quizType = ref("js");
	const quizCount = ref(0);
	const answerTimes = ref(0);
	const correctTimes = ref(0);
	const rankList = ref([]);
	const correctRate = ref(0);

	onLoad((evt : { quizType : string }) => {
		if (!evt?.quizType) {
			uni.navigateBack();
			return;
		}

		// 1 列表数据
		rankList.value = (getApp().globalData as any).rankingList;

		// 2 个人数据
		const { quiz_count, answer_times, correct_times, rate } = rankList.value.find(r => r.isMe);
		correctRate.value = rate;
		quizCount.value = quiz_count;
		answerTimes.value = answer_times;
		correctTimes.value = correct_times;

		// 3 bar title
		const title : string = quizNameDic.get(evt.quizType) as string;
		uni.setNavigationBarTitle({ title });

		// 4
		quizType.value = evt.quizType;
	})

	const restart = async () => {
		const token = uni.getStorageSync('token');
		const data = {
			name: 'resetProcess',
			data: { token, quiz_type: quizType.value }
		};
		await wx.cloud.callFunction(data);
		uni.navigateBack();
	}

	// 关于排序
	const isDescendingMap : Map<string, boolean> = new Map([
		['quiz_count', false],
		['answer_times', false],
		['correct_times', false],
		['rate', true],
		['received_like_count', true],
	]);
	const onSort = (key : string) => {
		let isDescending : boolean = !(isDescendingMap.get(key));
		isDescendingMap.set(key, isDescending);
		rankList.value = rankList.value.sort((a, b) => isDescending ? b[key] - a[key] : (a[key] - b[key]))
	}
</script>

<style lang='scss'>
	.summary-wrapper {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
		padding: 20rpx 30rpx 40rpx 30rpx;
		height: 100vh;
		background-color: $uni-bg-color-grey;
		overflow-y: auto;

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

	.uni-table-th {
		padding: 0rpx 10rpx 8rpx 10rpx !important;
		vertical-align: middle;
	}

	.grid-name {
		max-width: 130rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		text-align: center;
		justify-content: flex-start;
	}

	.grid-like {
		max-width: 100rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		text-align: center;
		justify-content: flex-start;
	}
</style>