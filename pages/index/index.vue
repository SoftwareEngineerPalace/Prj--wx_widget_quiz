<template>
	<view class="main">
		<button class="btn" @click="onJavaScript" type="primary">JavaScript 答题</button>
		<button class="btn" @click="onJavaScriptCMS">JavaScript 后台</button>
		<button class="btn" @click="onEcmaScript" type="primary">ECMAScript 6 答题</button>
		<button class="btn" @click="onEcmaScriptCMS">ECMAScript 6 后台</button>
		<button class="btn" @click="onTypeScript" type="primary">TypeScript 答题</button>
		<button class="btn" @click="onTypeScriptCMS">TypeScript 后台</button>
	</view>
</template>

<script setup lang="ts">
	const onJavaScript = () => {
		uni.navigateTo({
			url: '/pages/quiz/quiz?quizType=javascript',
		})
	}
	
	const onJavaScriptCMS = () => {
		uni.navigateTo({
			url: '/pages/cms/cms?quizType=javascript'
		})
	}
	
	const onEcmaScript = () => {
		uni.navigateTo({
			url: '/pages/quiz/quiz?quizType=es6'
		})
	}
	
	const onEcmaScriptCMS = () => {
		uni.navigateTo({
			url: '/pages/cms/cms?quizType=es6'
		})
	}
	
	const onTypeScript = ()=>{
		uni.navigateTo({
			url: '/pages/quiz/quiz?quizType=ts'
		})
	}
	
	const onTypeScriptCMS = ()=>{
		uni.navigateTo({
		url: '/pages/cms/cms?quizType=ts'
		})
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