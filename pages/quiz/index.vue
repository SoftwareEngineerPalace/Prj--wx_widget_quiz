<template>
	<view class="quiz-wrapper padding30">

		<!-- 题目 -->
		<view class="quiz__group-title mb20">
			<text :size="`35rpx`" class="index">{{index_str}}</text>
			<text>{{`&nbsp;&nbsp;`}}</text>
			<text :size="`35rpx`" class="title">{{title_str}}</text>
		</view>

		<!-- 4 个选项 -->
		<text class="quiz__option mb20" style="flex: none;" :size="`35rpx`" v-for="(option) in checkboxList"
			:key="option.id" autoHeight v-bind:class="{ option: true, 
			selected: option.selected, 
			isCorrect: curQuiz.submitted && option.isCorrect, 
			isWrong: curQuiz.submitted && option.selected && !option.isCorrect}" :data-id="option.id" @click="onClickOption">
			{{option.value}}
		</text>

		<!-- 控制进度按钮 -->
		<view class="quiz__group-btn mb30" v-if="showGroupBtns">
			<button class="btn-sub mr30" v-text="'上一题'" v-show="quizController.getCurQuizIndex() > 0"
				@click="onPrev"></button>

			<button class="btn-primary" v-text="'提交'" v-show="!curQuiz.submitted && quizController.hasNext()"
				@click="onSubmit"></button>

			<button class="btn-sub" v-text="'下一题'" v-show="curQuiz.submitted && quizController.hasNext() "
				@click="onNext"></button>

			<button class="btn-sub" v-text="'提交'" v-show="!curQuiz.submitted && !quizController.hasNext()"
				@click="onSubmit"></button>

			<button class="btn-primary" v-text="'进入结算页'"
				v-show="curExerciseType === ExerciseType.Common && curQuiz.submitted && !quizController.hasNext() "
				@click="onNext"></button>
			<button class="btn-primary" v-text="'回到首页'"
				v-show="curExerciseType === ExerciseType.ErrCollection && curQuiz.submitted && !quizController.hasNext() "
				@click="onNext"></button>
		</view>
	</view>

</template>

<script lang="ts" setup>
	import { ref, computed } from 'vue';
	import quizController from '../../common/quizController';
	import { ICheckbox, IQuiz, quizNameDic, ExerciseType } from '../../common/utils';
	import queryString from 'query-string';
	import { onLoad, onUnload } from '@dcloudio/uni-app';
import { getAllQuizs, getErrorCollectonQuiz } from '../../service';

	const quizType = ref("")// 题目类型
	const curExerciseType = ref("") // 做题类型
	const showGroupBtns = ref(false);
	const curQuiz = ref({} as IQuiz);// 当前题目的数据
	const checkboxList = ref([]);// 当前4个选项
	const userAnswer = ref('');// 用户的答案
	const quizList = ref([]);

	onLoad(async (evt : { quizType : string, exerciseType : string, latest_quiz_index : string }) => {
		console.log('quiz onLoad', evt);
		const { latest_quiz_index, exerciseType } = evt;
		curExerciseType.value = exerciseType;
		// console.log('0')
		wx.cloud.init({
			env: "quiz-0gb2aw2vb2850af4"
		});
		// console.log('1')
		// 1 设置类型
		quizType.value = evt.quizType;

		// 2 设置 bar title
		const title : string = quizNameDic.get(evt.quizType) as string;
		uni.setNavigationBarTitle({ title });

		// 3 加载所有题目
		let list : IQuiz[] = [];
		if (exerciseType === ExerciseType.Common) {
			list = await getAllQuizs(evt.quizType);
		} else if (exerciseType === ExerciseType.ErrCollection) {
			list = await getErrorCollectonQuiz(evt.quizType);
		}
		console.log("quiz onLoad 加载到的题目的数目", list.length);
		if (list.length === 0) {
			uni.showToast({
				title: "没有题目",
				duration: 1000
			})
			setTimeout(() => {
				uni.navigateBack();
			}, 1000)
			return;
		}
		quizList.value.push(...list);
		quizController.setQuizList(list);

		// 加载做题进度
		quizController.setCurQuizIndex(parseInt(latest_quiz_index));

		// onNext();
	});

	onUnload(() => {
		quizController.setQuizList([]);
	})

	const title_str = computed(() => curQuiz.value.title ?? '');

	const index_str = computed(() => {
		curQuiz.value;
		const sn = quizController.getCurQuizSN();
		const count = quizController.getQuizCount();
		console.log('quiz index_str', { sn, count, curExerciseType: curExerciseType.value });
		if (sn < 1 || count < 1) {
			return '';
		}
		if (curExerciseType.value === ExerciseType.Common) {
			return sn !== 0 ? `${sn}/${count}.  ` : "";
		} else if (curExerciseType.value === ExerciseType.ErrCollection) {
			return sn !== 0 ? `${sn}. ` : "";
		}
	})

	const onClickOption = (evt : any) => {
		// console.log("onClickOption evt", evt);
		const clicked_id = evt.target.dataset.id;
		checkboxList.value.forEach((v : any) => {
			if (v.id === clicked_id) {
				v.selected = !v.selected;
			}
		})
		const _userAnswer = checkboxList.value.filter((v : ICheckbox) => v.selected).map((v : ICheckbox) => v.id).join('');
		// console.log({ _userAnswer });
		userAnswer.value = _userAnswer;
	};

	const onSubmit = async () => {
		curQuiz.value.submitted = true;
		const token = uni.getStorageSync('token');
		const isCorrect = curQuiz.value.answer === userAnswer.value;
		const quiz_sn = quizController.getCurQuizSN();
		const quizCount = quizController.getQuizCount();
		const data = {
			quiz_title: curQuiz.value.title,
			quiz_id: curQuiz.value.id,
			quizType: quizType.value,
			token, isCorrect,
			quiz_sn,
			quiz_count: quizCount,
			exerciseType: curExerciseType.value
		};
		// console.log("onSubmit", data);
		const rsp : any = await wx.cloud.callFunction({
			name: 'answer',
			data
		});
		console.log('答题结果', rsp)
	};

	const onPrev = () => {
		curQuiz.value = { ...quizController.goPreview(), submitted: false };
		updateQuiz(curQuiz);
	};

	const onNext = () => {
		const nextQuiz = quizController.goNext();
		console.log('nextQuiz', nextQuiz);
		if (!nextQuiz && curExerciseType.value === ExerciseType.Common) {
			console.log('onNext redirectTo quizType.value', quizType.value);
			const queryStr = queryString.stringify({ quizType: quizType.value });
			const url = `/pages/summary/index?${queryStr}`;
			uni.redirectTo({ url })
			return;
		}

		if (!nextQuiz && curExerciseType.value === ExerciseType.ErrCollection) {
			uni.navigateBack();
			return;
		}

		if (nextQuiz !== null) {
			curQuiz.value = { ...nextQuiz, submitted: false };
			updateQuiz(curQuiz.value);
		}
	};

	const updateQuiz = (quiz : any) => {
		const { option_a, option_b, option_c, option_d, answer } = quiz;
		checkboxList.value = Object.entries({ option_a, option_b, option_c, option_d }).map((v : string[]) => {
			const id = v[0].charAt(v[0].length - 1).toUpperCase();
			const option = {
				id,
				value: `${id}. ${v[1]}`,
				selected: false,
				isCorrect: answer.includes(id),
			};
			return option;
		})
		showGroupBtns.value = true;
	}
</script>

<style lang="scss" scoped>
	page {
		width: 100vw;
		height: 100vh;
		background-color: #eeeeee;

		.quiz-wrapper {
			width: 100vw;
			height: 100vh;
			display: flex;
			flex-direction: column;
			justify-content: flex-start;
			background-color: $uni-bg-color-grey;

			.quiz__group-title {
				font-size: 35rpx;
				display: flex;
				justify-content: flex-start;

				.index {
					// color: $uni-color-success;
					font-weight: 500;
				}

				.title {}
			}

			.quiz__option {
				font-size: 35rpx;
				background-color: white;
				border-radius: 20rpx;
				padding: 20rpx;
				color: black;

				&.selected {
					background-color: gray;
					color: white;
				}

				&.isCorrect {
					background-color: $uni-theme-primary;
					color: white;
				}

				&.isWrong {
					background-color: $uni-color-error;
					color: white;
				}
			}

			.quiz__group-btn {
				display: flex;
				// position: fixed;
				// bottom: 0;
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