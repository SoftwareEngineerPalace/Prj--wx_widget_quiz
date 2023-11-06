<template>
	<view class="comment hbox mt20" style="align-items: flex-start;">
		<!-- 0 左头像 -->
		<u-image :show-loading="true" mode="widthFix" shape="circle" :src="vo.commenter_url" width="30px"
			height="30px"></u-image>
		<!-- 1 vbox -->
		<view class="vbox" style="align-items: flex-start; margin-left: 20rpx; flex-grow: 1;">
			<!-- 1.0 名字 -->
			<view class="comment__commenter-name mb10">{{ vo.commenter_name }}</view>
			<!-- 1.1 内容 -->
			<view class="comment__content mb10" @longpress="onSelfLongPress" :data-vo="vo" @click="onReply">
				{{vo.content}}</view>
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

			<comment v-for="(sub_comment) in vo.comment_list" style="width: 100%;" :key="sub_comment.id"
				:vo="sub_comment" :data-vo="sub_comment" @longPressComment="onLongPressEvtBubble"></comment>
		</view>
	</view>
</template>

<script lang="ts" setup>
	import { ref, onMounted, computed } from 'vue';
	import { IComment } from '../../common/common';
	import comment from "./comment.vue";
	const props = defineProps(['vo']);
	const emits = defineEmits(['reply', 'longPressComment']);
	const originalLikeCount = ref(0);
	const state_likeCount = ref(0);
	const comment_id = ref('');

	// TODO 不想用 onMounted
	onMounted(async () => {
		const { vo } = props;
		// console.log('onMounted vo', vo);
		originalLikeCount.value = vo.likeCount;
		state_likeCount.value = vo.likeCount;
		comment_id.value = vo.id;
	})

	const likeIsOrigin = computed(() => state_likeCount.value === originalLikeCount.value);

	const onLike = () => {
		state_likeCount.value = likeIsOrigin.value
			? originalLikeCount.value + 1 : originalLikeCount.value;
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