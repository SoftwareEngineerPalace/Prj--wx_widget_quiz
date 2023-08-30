<template>
	<view class="main">
		<button class="btn" @click="onJavaScript" type="primary">JavaScript 答题</button>
		<button class="btn" @click="onEcmaScript" type="primary">EcmaScript 6 答题</button>
		<button class="btn" @click="onJavaScriptCMS">JavaScript 后台</button>
		<button class="btn" @click="onEcmaScriptCMS">EcmaScript 6 后台</button>
	</view>
</template>

<script setup lang="ts">
	const onJavaScript = () => {
		uni.navigateTo({
			url: '/pages/javascriptquiz/javascriptquiz'
		})
	}
	const onEcmaScript = () => {
		uni.navigateTo({
			url: '/pages/es6quiz/es6quiz'
		})
	}
	const onJavaScriptCMS = () => {
		uni.navigateTo({
			url: '/pages/javascriptcms/javascriptcms'
		})
	}
	const onEcmaScriptCMS = () => {
		uni.navigateTo({
			url: '/pages/es6cms/es6cms'
		})
	}
</script>

<style lang="scss" scoped>
	.main {
		display: flex;
		flex-direction: column;
		padding-top: 30rpx;;

		.btn {
			width: 60%;
			margin-bottom: 30rpx;
		}
	}
</style>