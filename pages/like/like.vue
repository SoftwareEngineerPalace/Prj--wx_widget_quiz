<template>
	<view class="card">
		<view class="like" v-for="(vo,index) in list" :key="index" :data-vo="vo" @click="gotoQuiz">
			<!-- 左头像 -->
			<u-image :show-loading="true" mode="widthFix" shape="circle" :src="vo.commenter_url" width="80rpx"
				height="80rpx"></u-image>
			<view class="vbox ml30">
				<view class="hbox mb10">
					<view class="user-name mr20">{{vo.commenter_name}}</view>
					<view>{{`赞了你的评论&nbsp;&nbsp;&nbsp;${new Date(vo.like_time).toLocaleDateString()}`}}</view>
				</view>
				<view class="comment-content text-sm-grey">{{vo.content}}</view>
			</view>
		</view>
		<view class="notice-empty" v-if='list.length === 0'>还没收到赞</view>
	</view>
</template>

<script lang="ts" setup>
	import queryString from 'query-string';
	import { ref } from 'vue';
	import { onShow, onLoad, onInit } from '@dcloudio/uni-app';
	import { getReceivedLike } from '../../service';
	import { underlineToCamel } from '../../common/utils';

	const list = ref([]);
	onShow(async () => {
		const token = uni.getStorageSync('token');
		list.value = await getReceivedLike(token);
	})

	const gotoQuiz = (evt) => {
		const { quiz_id, quiz_type } = evt.currentTarget.dataset.vo;
		const data = underlineToCamel({ quiz_id, quiz_type });
		const queryStr = queryString.stringify(data);
		const url = `/pages/likeDetail/likeDetail?${queryStr}`;
		uni.navigateTo({ url })
	}
</script>

<style lang='scss'>
	page {
		width: 100vw;
		height: 100vh;
		overflow-y: hidden;

		.like {
			display: flex;
			justify-content: flex-start;
			align-items: flex-start;
			width: 100%;
			margin-bottom: 40rpx;

			.user-name {
				font-size: $uni-font-size-base;
			}

			.comment-content {
				border-left: 6rpx solid $uni-bg-color-grey;
				width: 100%;
				padding-left: 10rpx;
			}
		}
	}
</style>