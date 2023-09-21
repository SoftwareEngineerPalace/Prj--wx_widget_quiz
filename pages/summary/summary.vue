<template>
	<view>
		{{`一共有${quizCount}道题，你答对了${correctCount},正确率${ correctRate}`}}
	</view>
</template>

<script lang="ts" setup>
	import { Ref, ref, computed } from 'vue';
	import { onLoad } from '@dcloudio/uni-app';
	const quizCount : Ref<number> = ref(0);
	const correctCount : Ref<number> = ref(0);
	const correctRate = computed(() => {
		const rate = Math.floor((correctCount.value / quizCount.value) * 100);
		return `${rate}%`;
	});
	onLoad(async (evt : { quizType : string }) => {
		console.log("summary onLoad", evt);
		if (evt.hasOwnProperty('quizType')) {
			getHistory(evt.quizType)
		}
	})
	const getHistory = async (quiz_type : string) => {
		// 加载做题历史记录
		const token = uni.getStorageSync('token');
		const rsp : unknown = await wx.cloud.callFunction({
			name: 'getProcess',
			data: { token, quiz_type }
		});
		console.log("加载做题历史记录", rsp);
	}
</script>

<style>

</style>