<template>
	<view>
		{{`一共有${quizCount}道题，你答对了${correctCount},正确率${ correctRate}`}}
	</view>
</template>

<script lang="ts" setup>
	import { Ref, ref, computed } from 'vue';
	const quizCount : Ref<number> = ref(0);
	const correctCount : Ref<number> = ref(0);
	const correctRate = computed(() => {
		const rate = Math.floor((correctCount.value / quizCount.value) * 100);
		return `${rate}%`;
	})
</script>

<style>

</style>