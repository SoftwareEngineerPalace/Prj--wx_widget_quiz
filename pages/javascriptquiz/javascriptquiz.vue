<template>
	<view>

	</view>
</template>

<script lang="ts" setup>
	import {
		onMounted,
		ref
	} from 'vue';
	const quizList = ref([]);
	const getAllQuizs = async () => {
		const rsp : any = await wx.cloud.callFunction({
			name: 'getAllQuiz',
		});
		return rsp.result.data;
	}
	onMounted(async () => {
		wx.cloud.init({
			env: "quiz-0gb2aw2vb2850af4"
		});
		const data = await getAllQuizs();
		quizList.value.push(...data);
		console.log("quizList", quizList.value);
	})
</script>

<style>

</style>