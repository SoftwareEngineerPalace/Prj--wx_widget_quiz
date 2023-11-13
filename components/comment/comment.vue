<template>
	<view class="comment hbox mt20" style="align-items: flex-start;">
		<!-- 0 左头像 -->
		<u-image :show-loading="true" mode="widthFix" shape="circle" :src="vo.commenter_url" width="30px"
			height="30px"></u-image>
		<!-- 1 vbox -->
		<view class="vbox" style="align-items: flex-start; margin-left: 20rpx; flex-grow: 1;">
			<!-- 1.0 名字 -->
			<view class="comment__commenter-name text-sm mb10">{{ vo.commenter_name }}</view>
			<!-- 1.1 内容 -->
			<view class="comment__content mb10" @longpress="onSelfLongPress" :data-vo="vo" @click="onReply">
				{{vo.content}}
			</view>
			<!-- 1.2 时间和赞的 hbox -->
			<view class="hbox text-sm" style="justify-content: space-between;">
				<!-- 1.2.1 时间 -->
				<view class="comment__time">{{vo.time}}</view>
				<!-- 1.2.2 赞 -->
				<view class="hbox" :style="{width: 'auto', pointerEvents: vo.exist?'auto':'none'}" @click="onLike">
					<u-icon name="thumb-up-fill" :color="ihaveLiked?themeColor:'#999'" size="40"></u-icon>
					<view class="comment__like-count text-sm" :style="{color:ihaveLiked?themeColor:'#999'}">
						{{ vo.user_ids_like?.length || '点赞' }}
					</view>
				</view>
			</view>

			<comment v-for="(sub_comment) in vo.comment_list" style="width: 100%;" :key="sub_comment.id"
				:vo="sub_comment" :user_ids_like="sub_comment.user_ids_like" :data-vo="sub_comment"
				@longPressComment="onLongPressEvtBubble" @evt_clickLike='onLikeClicked'></comment>
		</view>
	</view>
</template>

<script lang="ts" setup>
	import { ref, onMounted, computed, toRaw, watch } from 'vue';
	import { IComment } from '../../common/common';
	import comment from "./comment.vue";

	const props = defineProps(['vo']);
	const emits = defineEmits(['reply', 'longPressComment', 'evt_clickLike']);
	const ihaveLiked = ref(false);
	const themeColor = ref(getApp().globalData.themeColor)

	watch(() => props.user_ids_like, (newVal, oldVal) => {
		const open_user_id = getApp().globalData.loginInfo.id;
		ihaveLiked.value = !!props.vo.user_ids_like?.some(vo => vo.given_like_user_id.includes(open_user_id));
	});

	// 以下4个emits都应该换一下，用状态管理来实现
	const onLike = () => {
		// 变更数据
		emits('evt_clickLike', { commentId: props.vo.id, liked: !ihaveLiked.value, commenterId: props.vo.commenter_id })
	}

	const onLikeClicked = (vo) => {
		emits('evt_clickLike', vo)
	}

	const onReply = () => {
		emits('reply', props.vo);
	}

	const onSelfLongPress = (evt) => {
		emits('longPressComment', evt.currentTarget.dataset.vo);
	}

	const onLongPressEvtBubble = (comment : IComment) => {
		emits('longPressComment', comment);
	}
</script>

<style lang="scss" scoped>
	.comment {
		border-top: 1rpx solid #eeeeee;
		padding-top: 20rpx;

		.comment__avatar {
			width: 50rpx;
			height: 50rpx;
		}

		.comment__commenter-name {
			font-weight: bold;
		}

		.comment__content {
			align-self: stretch;
			font-size: $uni-font-size-sm;
		}

		.comment__time {
			white-space: nowrap;
			color: #999;
		}

		.comment__like-count {
			margin-left: 10rpx;
		}
	}
</style>