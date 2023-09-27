<template>
	<view class='base'>
		<view class="main">
			<!-- 1 当前题库 -->
			<view class="container-title" @click="onClickTitle">
				<view class="container-name">
					<view class="title">{{`当前题库: ${quizNameDic.get(curQuizType)}`}}</view>
					<u-icon class="icon" name="arrow-down-fill" color="#007aff" size="20"></u-icon>
				</view>
				<view class="sub-title">{{processDesc}}</view>
			</view>
			<!-- 2 继续 -->
			<view class="container-continue">
				<view class="title">继续</view>
				<view class="sub-title">从上次中断的地方继续练习</view>
				<button class="btn" @click="continueExercise">继续练习</button>
			</view>
		</view>
		<u-popup :safeAreaInsetTop='false' :safe-area-inset-bottom="false" :customStyle="{display:'flex', flexDirection:'column', alignItems:'center',
	justifyContent:'space-between', paddingLeft:'20px', paddingRight:'20px'}" round='20' :overlay='true'
			:show="showSelectPopup" mode="top">
			<view>
				<view class="choice" v-for="(item) in quizTypeArray" :data-id="item.value" @click="onSelectQuizType">
					<text :key="item.value">{{item.label}}</text>
				</view>
			</view>
			<u-line class="line" color="#dddddd"></u-line>
			<button size="default" style="margin-top: 10px; margin-bottom: 10px; font-size: 12px; width: 100%;"
				@click="closeSelectPop">取消</button>
		</u-popup>
	</view>
</template>

<script lang="ts" setup>
	declare const wx : any;
	import { computed, onMounted, Ref, ref } from 'vue';

	import { checkSession, quizNameDic, quizTypeArray } from '../../common/utils';
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
			return `练习进度 ${latestQuizIndex.value + 1}/${quizCount.value}`;
		} else {
			return `练习进度 ${latestQuizIndex.value + 1}`;
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
		const { latest_quiz_index, quiz_count } = rsp.result;
		latestQuizIndex.value = latest_quiz_index;
		quizCount.value = quiz_count;
	};

	const continueExercise = () => {
		const quizType = curQuizType.value;
		const queryStr = queryString.stringify({ quizType });
		const url = `/pages/quiz/index?${queryStr}`;
		uni.navigateTo({ url })
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
</script>

<style lang="scss" scoped>
	page {
		width: 100vw;
		height: 100vh;
		background-color: #eeeeee;

		.sub-title {
			font-size: $uni-font-size-base;
			color: $uni-text-color-grey;
			margin-top: $uni-spacing-row-base;
			margin-bottom: $uni-spacing-row-base;
		}

		.title {
			font-size: $uni-font-size-lg;
		}

		.btn {
			font-size: $uni-font-size-base;
			background-color: $uni-color-primary;
			width: 100%;
			color: $uni-text-color-inverse;
		}

		.main {
			display: flex;
			flex-direction: column;
			padding-top: 30rpx;
			width: 100%;
			height: 100vh;
			background-color: #eeeeee;
			align-items: center;

			.container-title {
				width: 82%;
				background-color: white;
				border-radius: 20rpx;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				align-items: center;
				padding: 30rpx 30rpx 0 30rpx;

				.container-name {
					display: flex;
					flex-direction: row;
					justify-content: space-between;
					align-items: center;

					.title {
						margin-right: 20rpx;
					}
				}
			}

			.container-continue {
				margin-top: 30rpx;
				border-radius: 20rpx;
				justify-content: space-between;
				width: 82%;
				background-color: white;
				display: flex;
				flex-direction: column;
				align-items: flex-start;
				margin-bottom: 30rpx;
				padding: 30rpx 30rpx 30rpx 30rpx;
			}

			.admin-container {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: flex-start;
			}
		}
	}

	.choice {
		font-size: 15px;
		color: #333333;
		margin-top: 30rpx;

		&:hover {
			background-color: #dddddd;
		}

		// &:last-child {
		// 	margin-bottom: 30rpx;
		// }
	}

	.choice:last-child {
		margin-bottom: 30rpx;
	}
</style>