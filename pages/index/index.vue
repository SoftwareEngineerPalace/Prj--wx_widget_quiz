<template>
	<view class="main">
		<button class="btn" @click="onQuiz" data-quizType="js" type="primary">JavaScript 答题</button>
		<!-- <button class="btn" @click="onCms" data-quizType="js">JavaScript 后台</button> -->

		<button class="btn" @click="onQuiz" data-quizType="es6" type="primary">ECMAScript 6 答题</button>
		<!-- <button class="btn" @click="onCms" data-quizType="es6">ECMAScript 6 后台</button> -->

		<button class="btn" @click="onQuiz" data-quizType="ts" type="primary">TypeScript 答题</button>
		<!-- <button class="btn" @click="onCms" data-quizType="ts">TypeScript 后台</button> -->
	</view>
</template>

<script setup lang="ts">
	import { onMounted } from 'vue';
	import { checkSession } from '../../common/utils';
	import queryString from 'query-string'

	onMounted(async () => {
		wx.cloud.init({
			env: "quiz-0gb2aw2vb2850af4"
		});

		const hasSession = await checkSession();
		const token = uni.getStorageSync('token');
		console.log({ hasSession, token })
		if (!hasSession || !token) {
			uni.switchTab({
				url: '/pages/mine/mine'
			})
		}
	})

	const onQuiz = (evt : any) => {
		// console.log('onQuiz evt', evt);
		const { quiztype } = evt.target.dataset;
		const queryStr = queryString.stringify({ quizType: quiztype });
		const url = `/pages/quiz/quiz?${queryStr}`;
		// console.log('onQuiz', url);
		uni.navigateTo({ url })
	}

	const onCms = (evt : any) => {
		console.log('onCms evt', evt);
		const { quiztype } = evt.target.dataset;
		const queryStr = queryString.stringify({ quizType: quiztype })
		const url = `/pages/cms/cms?${queryStr}`;
		// console.log('onCms', url);
		uni.navigateTo({ url });
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

			.btn {
				width: 60%;
				margin-bottom: 30rpx;
				border: none;

				&::after {
					border: none;
				}
			}
		}
	}
</style>