<template>
	<view class="wrapper-share">
		<view class="card">
			<u-image :show-loading="true" shape="circle" :src="qrCode" width="500rpx" height="500rpx"></u-image>

			<button class="btn-primary mt40" v-text="'保存图片到相册'" @click="onSave"></button>

			<button class="btn-sub mt40" open-type="share" v-text="'转发小程序码到聊天窗口'"></button>
		</view>
	</view>
</template>

<script lang='ts' setup>
	import {
		qrCode
	} from '../../common/common';
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

	const onSave = async () => {
		console.log("onSave");
		const {
			tempFilePath: filePath
		} = await uni.downloadFile({
			url: qrCode
		})
		console.log('filePath', filePath);
		const {
			errMsg
		} = await uni.saveImageToPhotosAlbum({
			filePath
		})
		if (errMsg === 'saveImageToPhotosAlbum:ok') {
			uni.showToast({
				title: '保存成功'
			})
		}
	}
</script>

<style lang='scss' scoped>
	.wrapper-share {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
		padding: 30rpx;
		background-color: $uni-bg-color-grey;
		height: 100vh;

		.btns {
			display: flex;
			justify-content: space-between;
			align-items: center;
		}
	}
</style>