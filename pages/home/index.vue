<template>
	<view class='base'>
		<view class="main">
			<!-- 1 当前题库 -->
			<view class="container-title" @click="onClickTitle">
				<view class="container-name">
					<view class="title">{{`当前题库: ${quizNameDic.get(curQuizType)}`}}</view>
					<u-icon name="arrow-down-fill" color="#4cd964" size="14"></u-icon>
				</view>
				<view class="sub-title">{{processDesc}}</view>
			</view>
			<!-- 2 继续 -->
			<view class="container-continue">
				<view class="title">继续</view>
				<view class="sub-title">从上次中断的地方继续练习</view>
				<button type="primary" style="font-size: 16px; width: 100%;" @click="continueExercise">继续练习</button>
			</view>

		</view>
		<u-popup :safeAreaInsetTop='false' :safe-area-inset-bottom="false" :customStyle="{display:'flex', flexDirection:'column', alignItems:'center',
	justifyContent:'space-between'}" round='20' :overlay='true' :show="showSelectPopup" mode="top"
			@close="onSelectPopupClose">
			<view>
				<view class="choice" v-for="(item) in quizTypeArray" :data-id="item.value" @click="onSelectQuizType">
					<text :key="item.value">{{item.label}}</text>
				</view>
			</view>
			<u-line class="line" color="#dddddd"></u-line>
			<button size="default" style="margin-top: 10px; margin-bottom: 10px; font-size: 12px;" @click="closeSelectPop">取消</button>
		</u-popup>
	</view>
</template>

<script lang="ts">
	// import { computed, onMounted, Ref, ref } from 'vue';
	declare const wx : any;
	import { checkSession, quizNameDic, quizTypeArray } from '../../common/utils';
	import queryString from 'query-string';
	// import { onShow, onLoad } from '@dcloudio/uni-app';
	export default {
		data() {
			return {
				latestQuizIndex: -1,
				quizCount: 0,
				userOpenId: "",
				curQuizType: 'js',
				showSelectPopup: false,
				quizNameDic: quizNameDic,
				quizTypeArray: quizTypeArray
			}
		},
		onShow() {
			console.log("home index onShow");
			this.updateOnQuizTypeChanged();
			this.updateUI();
		},
		async mounted() {
			const hasSession = await checkSession();
			const token = uni.getStorageSync('token');
			if (!hasSession || !token) {
				uni.switchTab({
					url: '/pages/mine/index'
				})
			}
		},
		computed: {
			adminVisible() { return this.userOpenId === 'oGJqI61rEAICwpBqGgw_hteePEbY' },
			processDesc() {
				if (this.quizCount) {
					return `本题库练习进度 ${this.latestQuizIndex + 1}/${this.quizCount}`;
				} else {
					// return '还没开始练习';
					return `本题库练习进度为 ${this.latestQuizIndex + 1}`;
				}
			}
		},
		methods: {
			updateUI() {
				const token = uni.getStorageSync('token');
				const [user_open_id] = token.split("__");
				this.userOpenId = user_open_id;
			},
			/** 题目类型变化后，更新数据 */
			async updateOnQuizTypeChanged() {
				// 用用户id和题目类型拿进度
				const token = uni.getStorageSync('token');
				const rsp : any = await wx.cloud.callFunction({
					name: 'getProcess',
					data: { token, quiz_type: this.curQuizType }
				});
				// console.log('index updateOnQuizTypeChanged 获得题目进度', rsp.result)
				const { latest_quiz_index, quiz_count } = rsp.result;
				this.latestQuizIndex = latest_quiz_index;
				this.quizCount = quiz_count;
			},
			continueExercise() {
				const quizType = this.curQuizType;
				const queryStr = queryString.stringify({ quizType });
				const url = `/pages/quiz/index?${queryStr}`;
				// console.log('continueExercise', url);
				uni.navigateTo({ url })
			},
			onClickTitle() {
				this.showSelectPopup = true;
			},
			onSelectPopupClose(evt : any) {
				// console.log('onSelectPopupClose')
			},
			closeSelectPop(evt : any) {
				this.showSelectPopup = false;
			},
			onSelectQuizType(evt : any) {
				// console.log("onSelectQuizType", evt);
				this.showSelectPopup = false;
				const quizType = evt.currentTarget.dataset.id;
				this.curQuizType = quizType;
				this.updateOnQuizTypeChanged();
			}
		}
	}
</script>

<style lang="scss" scoped>
	page {
		width: 100vw;
		height: 100vh;
		background-color: #eeeeee;
		
		.sub-title{
			font-size: 14px;
			color: gray;
			margin-top: 10px;
			margin-bottom: 10px;
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

			.btn-task {
				margin-top: 30rpx;
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