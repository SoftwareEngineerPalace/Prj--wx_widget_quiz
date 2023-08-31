<template>
	<view class="quiz">
		<view class="title">{{ quiz_title }}</view>
		<view v-bind:class="{ 'option': true, 
			selected: option.selected, 
			isCorrect: curQuiz.submitted && option.isCorrect, 
			isWrong: curQuiz.submitted && option.selected && !option.isCorrect}" :data-id="option.id"
			v-for="(option) in checkboxList" :key="option.id" @click="onClickOption">
			{{ option.id + "、 " + option.value }}
		</view>
		<view class="group-btn" v-if="showGroupBtns">
			<button type="default" class="btn" v-show="quizController.getCurQuizIndex() > 0"
				@click="onPrev">上一题</button>
			<button type="primary" v-show="!curQuiz.submitted" class="btn" @click="onSubmit">提交</button>
			<button type="primary" v-show="curQuiz.submitted && quizController.hasNext() " class="btn"
				@click="onNext">下一题</button>
			<button type="default" class="btn" v-show="!quizController.hasNext()" @click="onPrev">完成</button>
		</view>
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

	const showGroupBtns = ref(false);

	const onClickOption = (evt : any) => {
		const clicked_id = evt.target.dataset.id;
		checkboxList.forEach((v : any) => {
			if (v.id === clicked_id) {
				v.selected = !v.selected;
			}
		})
	}

	const quiz_title = computed(() => {
		const index = quizController.getCurQuizIndex();
		const indexStr : string = `第 ${(index + 1)} 题、`;
		const titleStr : string = curQuiz.value.title;
		let result : string = indexStr + titleStr;
		return index === -1 || !titleStr ? '' : result;
	})

	const getAllQuizs = async () => {
		const rsp : any = await wx.cloud.callFunction({
			name: 'getAllQuiz',
			data: { dbName: 'es6' }
		});
		return rsp.result.data;
	}

	const onSubmit = () => {
		curQuiz.value.submitted = true;
	}

	const onPrev = () => {
		curQuiz.value = { ...quizController.goPreview(), submitted: false };
		updateQuiz(curQuiz.value);
	}

	const onNext = () => {
		curQuiz.value = { ...quizController.goNext(), submitted: false };
		updateQuiz(curQuiz.value);
	}

	const updateQuiz = (quiz : any) => {
		const { option_a, option_b, option_c, option_d, answer } = quiz;
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
		showGroupBtns.value = true;
	}

	onMounted(async () => {
		wx.cloud.init({
			env: "quiz-0gb2aw2vb2850af4"
		});
		const data = await getAllQuizs();
		quizList.value.push(...data);
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
				font-size: 35rpx;
				margin: 0 30rpx 30rpx 30rpx;
				font-weight: 500;
			}

			.option {
				font-size: 35rpx;
				margin: 0 30rpx 30rpx 30rpx;
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

			.group-btn {
				display: flex;
				width: 100%;
				flex-direction: row;

				.btn {
					font-size: 30rpx;
					width: 40%;
					margin-top: 30rpx;
					font-size: 40rpx;
					border-radius: 20rpx;
					border: none;

					&::after {
						border: none;
					}
				}
			}
		}
	}
</style>