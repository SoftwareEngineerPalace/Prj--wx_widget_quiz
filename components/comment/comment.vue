<template>
	<view class="comment hbox mt20" style="align-items: flex-start;">
		<!-- 0 左头像 -->
		<u-image :show-loading="true" mode="widthFix" shape="circle" :src="vo.avatar_url" width="30px"
			height="30px"></u-image>
		<!-- 1 vbox -->
		<view class="vbox" style="align-items: flex-start; margin-left: 20rpx; flex-grow: 1;">
			<!-- 1.0 名字 -->
			<view class="comment__commenter-name mb10">{{ vo.commenter_name }}</view>
			<!-- 1.1 内容 -->
			<view class="comment__content mb10">{{vo.content}}</view>
			<!-- 1.2 时间和赞的 hbox -->
			<view class="hbox text-sub" style="justify-content: space-between;">
				<!-- 1.2.1 时间 -->
				<view class="comment__time">{{vo.time}}</view>
				<!-- 1.2.2 赞 -->
				<view class="hbox" style="width: auto;" @click="onLike">
					<u-icon name="thumb-up-fill" :color="likeIsOrigin?'#999':'#5ab8b3'" size="40"></u-icon>
					<view class="comment__like-count" :style="{color:likeIsOrigin?'#999':'#5ab8b3'}">
						{{ state_likeCount || '点赞' }}
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
	import { defineProps, ref, onMounted, computed } from 'vue';
	const props = defineProps(['vo']);
	const originalLikeCount = ref(0);
	const state_likeCount = ref(0);

	// TODO 不想用 onMounted
	onMounted(async () => {
		const { vo } = props;
		// console.log('onMounted vo', vo);
		originalLikeCount.value = vo.likeCount;
		state_likeCount.value = vo.likeCount;
	})

	const likeIsOrigin = computed(() => state_likeCount.value === originalLikeCount.value);

	const onLike = () => {
		state_likeCount.value = likeIsOrigin.value
			? originalLikeCount.value + 1 : originalLikeCount.value;
	}
</script>

<style lang="scss">
	.comment {
		border-top: 1rpx solid #eeeeee;
		padding-top: 20rpx;

		.comment__avatar {
			width: 50rpx;
			height: 50rpx;
		}

		.comment__content {
			align-self: stretch;
		}

		.comment__time {
			white-space: nowrap;
		}

		.comment__like-count {
			margin-left: 10rpx;
		}
	}
</style>