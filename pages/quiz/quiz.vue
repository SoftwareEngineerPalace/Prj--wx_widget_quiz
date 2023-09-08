<template>
	<view class="quiz">

		<!-- 题目 -->
		<view class="group-title">
			<text :size="`35rpx`" class="index">{{index_str}}</text>
			<text>{{`&nbsp;&nbsp;`}}</text>
			<text :size="`35rpx`" class="title">{{title_str}}</text>
		</view>

		<!-- 4 个选项 -->
		<text class="option" style="flex: none;" :size="`35rpx`" v-for="(option) in checkboxList" :key="option.id"
			autoHeight v-bind:class="{ option: true, 
			selected: option.selected, 
			isCorrect: curQuiz.submitted && option.isCorrect, 
			isWrong: curQuiz.submitted && option.selected && !option.isCorrect}" :data-id="option.id" @click="onClickOption">
			{{option.value}}
		</text>

		<!-- 控制进度按钮 -->
		<view class="group-btn" v-if="showGroupBtns">
			<button type="default" class="btn" v-show="quizController.getCurQuizIndex() > 0"
				@click="onPrev">上一题</button>
			<button type="primary" v-show="!curQuiz.submitted && quizController.hasNext()" class="btn"
				@click="onSubmit">提交</button>
			<button type="primary" v-show="curQuiz.submitted && quizController.hasNext() " class="btn"
				@click="onNext">下一题</button>
			<button type="default" class="btn" v-show="!quizController.hasNext()" @click="onSubmit">完成</button>
		</view>
	</view>

</template>

<script lang="ts" setup>
	import {
		onMounted,
		reactive,
		ref,
		computed,
		Ref,
	} from 'vue';
	import quizController from '../../common/quizController';
	import { onLoad, onUnload } from '@dcloudio/uni-app';
	import { quizNameDic } from '../../common/utils';

	// 所有题目
	const quizList = ref([]);
	// 题目类型
	const quizType : Ref<string> = ref('');

	const showGroupBtns = ref(false);
	// 当前题目总数据
	let curQuiz : any = ref({});
	// 当前4个选项
	let checkboxList = reactive([]);
	// 用户的答案
	const userAnswer : Ref<string> = ref('')

	const onClickOption = (evt : any) => {
		// console.log("onClickOption evt", evt);
		const clicked_id = evt.target.dataset.id;
		checkboxList.forEach((v : any) => {
			if (v.id === clicked_id) {
				v.selected = !v.selected;
			}
		})
		const _userAnswer = checkboxList.filter(v => v.selected).map(v => v.id).join('');
		// console.log({ _userAnswer });
		userAnswer.value = _userAnswer;
	}

	const index_str = computed(() => {
		curQuiz.value
		const index = quizController.getCurQuizIndex();
		const count = quizController.getQuizCount();
		// console.log('index_str index', index);
		return index !== -1 ? `${(index + 1)}/${count}.  ` : "";
	})

	const title_str = computed(() => {
		return curQuiz.value.title ?? '';
	})

	const getAllQuizs = async (dbName : string) => {
		const rsp : any = await wx.cloud.callFunction({
			name: 'getAllQuiz',
			data: { dbName }
		});
		return rsp.result.data;
	}

	const onSubmit = async () => {
		curQuiz.value.submitted = true;
		const token = uni.getStorageSync('token');
		const isCorrect = curQuiz.value.answer === userAnswer.value;
		const quiz_index = quizController.getCurQuizIndex();
		const data = {
			quiz_title: curQuiz.value.title, quiz_id: curQuiz.value.id,
			quizType: quizType.value, token, isCorrect, quiz_index
		};
		const rsp : any = await wx.cloud.callFunction({
			name: 'answer',
			data
		});
		console.log('答题结果', rsp)
		return rsp.result.data;
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
				value: `${id}. ${v[1]}`,
				selected: false,
				isCorrect: answer.includes(id),
			};
			return reactive(option);
		})
		showGroupBtns.value = true;
	}

	onLoad(async (evt) => {
		// console.log('onLoad', evt);
		wx.cloud.init({
			env: "quiz-0gb2aw2vb2850af4"
		});
		quizType.value = evt.quizType;

		uni.setNavigationBarTitle({ title: quizNameDic[evt.quizType] });

		// 加载所有题目
		const data = await getAllQuizs(evt.quizType);
		quizList.value.push(...data);
		quizController.setQuizList(data);

		// 加载做题进度
		const token = uni.getStorageSync('token');
		const rsp : any = await wx.cloud.callFunction({
			name: 'getProcess',
			data: { token, quiz_type: evt.quizType }
		});
		console.log('拿到的进度', rsp.result.latest_quiz_index);
		quizController.setCurQuizIndex(rsp.result.latest_quiz_index)
		onNext();
	})

	onUnload(() => {
		uni.setNavigationBarTitle({ title: '' });
		quizController.setQuizList([]);
	})

	onMounted(async () => {
		// console.log("onMounted")
	})
</script>

<style lang="scss">
	page {
		width: 100vw;
		height: 100vh;
		background-color: #eeeeee;

		.quiz {
			width: 100%;
			display: flex;
			flex-direction: column;
			justify-content: flex-start;

			.group-title {
				font-size: 35rpx;
				margin: 0 30rpx 30rpx 30rpx;
				display: flex;
				justify-content: flex-start;

				.index {
					// color: $uni-color-success;
					font-weight: 500;
				}

				.title {}
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