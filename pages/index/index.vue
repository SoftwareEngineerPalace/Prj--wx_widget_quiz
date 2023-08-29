<template>
	<view class="main">
		<button class="btn" @click="onJavaScript" type="primary">JavaScript</button>
		<button class="btn" @click="onEcmaScript" type="primary">EcmaScript 6</button>
		<button class="btn" @click="onJavaScriptCMS">JavaScript 后台</button>
		<button class="btn" @click="onEcmaScriptCMS">EcmaScript 6 后台</button>
	</view>
</template>

<script setup lang="ts">
	const onJavaScript = () => {

	}
	const onEcmaScript = () => {

	}
	const onJavaScriptCMS = () => {
		uni.navigateTo({
			url: '/pages/javascript/javascript'
		})
	}
	const onEcmaScriptCMS = () => {

	}
</script>

<style lang="scss" scoped>
	.main {
		display: flex;
		flex-direction: column;

		.btn {
			width: 60%;
			margin-bottom: 30rpx;
		}
	}
</style>