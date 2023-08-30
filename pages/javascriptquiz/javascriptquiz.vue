<template>
	<view class="quiz">
		<!-- <u-text class="title" type="primary" :text="curQuiz.title"></u-text> -->
		<view class="title">{{ quiz_title }}</view>
		<view v-bind:class="{ 'option': true, 
			selected: option.selected, 
			isCorrect: curQuiz.submitted && option.isCorrect, 
			isWrong: curQuiz.submitted && option.selected && !option.isCorrect}" :data-id="option.id"
			v-for="(option) in checkboxList" :key="option.id" @click="onClickOption">
			{{ option.id + "、 " + option.value }}
		</view>
		<button type="primary" v-if="!curQuiz.submitted" class="btn-submit" @click="onSubmit">提交</button>
		<button type="primary" v-if="curQuiz.submitted" class="btn-next" @click="onNext">下一题</button>
	</view>
</template>

<script lang="ts" setup>
	import {
		onMounted,
		reactive,
		ref,
		computed
	} from 'vue';
	import quizController from '../../common/quizController';

	const quizList = ref([]);

	let curQuiz : any = ref({});

	let checkboxList = reactive([]);

	const onClickOption = (evt : any) => {
		console.log("onClickOption", evt.target.dataset.id);
		const clicked_id = evt.target.dataset.id;
		checkboxList.forEach((v : any) => {
			if (v.id === clicked_id) {
				v.selected = !v.selected;
			}
		})
		console.log('checkboxList', checkboxList);
	}

	const quiz_title = computed(() => {
		const index = quizController.getCurQuizIndex();
		const indexStr : string = `第 ${(index + 1)} 题、`;
		const titleStr : string = curQuiz.value.title;
		let result : string = indexStr + titleStr;
		return index === -1 ? '' : result;
	})

	const getAllQuizs = async () => {
		const rsp : any = await wx.cloud.callFunction({
			name: 'getAllQuiz',
		});
		return rsp.result.data;
	}

	const onSubmit = () => {
		curQuiz.value.submitted = true;
	}

	const onNext = () => {
		curQuiz.value = { ...quizController.goNext(), submitted: false };
		const { option_a, option_b, option_c, option_d, answer } = curQuiz.value;
		checkboxList = Object.entries({ option_a, option_b, option_c, option_d }).map(v => {
			const id = v[0].charAt(v[0].length - 1).toUpperCase();
			const option = {
				id,
				value: v[1],
				selected: false,
				isCorrect: answer.includes(id),
			};
			return reactive(option);
		})
	}

	onMounted(async () => {
		wx.cloud.init({
			env: "quiz-0gb2aw2vb2850af4"
		});
		const data = await getAllQuizs();
		quizList.value.push(...data);
		// console.log("quizList", quizList.value);

		quizController.setQuizList(data);

		onNext();
	})
</script>

<style lang="scss">
	page {
		width: 100vw;
		height: 100vh;
		background-color: #eeeeee;

		.quiz {
			width: 100%;
			height: 100%;
			display: flex;
			flex-direction: column;

			.title {
				font-size: 40rpx;
				margin: 0rpx 20rpx 30rpx 20rpx;
				font-weight: 500;
			}

			.option {
				font-size: 35rpx;
				margin: 0 20rpx 20rpx 20rpx;
				background-color: white;
				border-radius: 20rpx;
				padding: 20rpx;
				color: black;

				&.selected {
					background-color: gray;
					color: white;
				}

				&.isCorrect {
					background-color: #1aad19;
					color: white;
				}

				&.isWrong {
					background-color: $uni-color-error;
					color: white;
				}
			}

			.btn-submit {
				width: 50%;
				margin-top: 30rpx;
				font-size: 40rpx;
				border-radius: 20rpx;
			}

			.btn-next {
				width: 50%;
				margin-top: 30rpx;
				font-size: 40rpx;
				border-radius: 20rpx;
			}
		}
	}
</style>