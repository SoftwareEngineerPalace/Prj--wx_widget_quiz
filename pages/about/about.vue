<template>
	<view class="about-wrapper vbox">
		<view class="vbox mb20">
			<u-image :show-loading="true" shape="circle" :src="logoUrl" width="180rpx" height="180rpx"></u-image>
			<view class="text-primary mb10 mt20">软工题库</view>
			<view class="text-sm-grey mb10">版本：1.01</view>
			<view class="text-sm-grey mb10">开发者：xiao</view>
		</view>
		<view class="text-primary mb20" style="align-self: flex-start; margin-left: 25rpx;">声明</view>
		<view class="card mb40">
			<view>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;本应用除了微信昵称和头像外，没收集您的任何信息，不存在侵权。</view>
			<view>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;题目来源于 <span @click="copy('')"
					class="primary-color">"阮一峰网道教程"</span>，本小程序内容不代表官方，开发者不保证题目和答案的正确性，有想法可以讨论区留言或反馈给开发者。</view>
		</view>
		<view class="text-primary mb20" style="align-self: flex-start;margin-left: 25rpx;">联系方式</view>
		<view class="card">
			<view style="align-self: flex-start;">QQ:&nbsp;&nbsp; <span class="primary-color"
					@click="copy('371783402')">371783402</span></view>
			<view style="align-self: flex-start;"> 邮箱: &nbsp;<span class="primary-color"
					@click="copy('jianjun.xiao@foxmail.com')">jianjun.xiao@foxmail.com</span></view>
		</view>
	</view>
</template>

<script lang='ts' setup>
	import {
		logoImgUrl, qrCode
	} from '../../common/common';
	import {
		ref
	} from 'vue';
	import {
		onShareAppMessage,
		onShareTimeline
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

	const logoUrl = ref(logoImgUrl);

	const copy = (data) => {
		uni.setClipboardData({
			data,
		})
	}
</script>

<style lang="scss" scoped>
	page {
		width: 100vw;
		height: 100vh;

		.about-wrapper {
			height: 100vh;
			background-color: $uni-bg-color-grey;
			padding: 30rpx;
			justify-content: flex-start;
		}
	}
</style>