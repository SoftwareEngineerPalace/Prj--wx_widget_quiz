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

			<button type="default" class="btn" v-show="!curQuiz.submitted && !quizController.hasNext()"
				@click="onSubmit">提交</button>

			<button type="primary" v-show="curQuiz.submitted && !quizController.hasNext() " class="btn"
				@click="onNext">进入结算页</button>
		</view>
	</view>

</template>

<script lang="ts">
	import quizController from '../../common/quizController';
	import { ICheckbox, quizNameDic } from '../../common/utils';
	import queryString from 'query-string';

	export default {
		data() : any {
			return {
				quizList: [],// 所有题目
				quizType: "",// 题目类型
				showGroupBtns: false,
				curQuiz: {},// 当前题目的数据
				checkboxList: [],// 当前4个选项
				userAnswer: '',// 用户的答案
				quizController: quizController,
			}
		},
		onUnload() {
			uni.setNavigationBarTitle({ title: '' });
			quizController.setQuizList([]);
		},
		async onLoad(evt : { quizType : string }) {
			// console.log('onLoad', evt);
			wx.cloud.init({
				env: "quiz-0gb2aw2vb2850af4"
			});
			this.quizType = evt.quizType;

			// 设置 bar title
			const title : string = quizNameDic.get(evt.quizType) as string;
			// console.log("title", title);
			uni.setNavigationBarTitle({ title });

			// 加载所有题目
			const data = await this.getAllQuizs(evt.quizType);
			this.quizList.push(...data);
			quizController.setQuizList(data);

			// 加载做题进度
			const token = uni.getStorageSync('token');
			const rsp : any = await wx.cloud.callFunction({
				name: 'getProcess',
				data: { token, quiz_type: evt.quizType }
			});
			// console.log('已经做了的题目数', rsp.result.latest_quiz_index + 1);
			quizController.setCurQuizIndex(rsp.result.latest_quiz_index)
			this.onNext();
		},
		computed: {
			title_str() {
				return this.curQuiz.title ?? '';
			},
			index_str() {
				this.curQuiz;
				const index = quizController.getCurQuizIndex();
				const count = quizController.getQuizCount();
				// console.log('index_str index', index);
				return index !== -1 ? `${(index + 1)}/${count}.  ` : "";
			}
		},
		methods: {
			onClickOption(evt : any) {
				// console.log("onClickOption evt", evt);
				const clicked_id = evt.target.dataset.id;
				this.checkboxList.forEach((v : any) => {
					if (v.id === clicked_id) {
						v.selected = !v.selected;
					}
				})
				const _userAnswer = this.checkboxList.filter((v : ICheckbox) => v.selected).map((v : ICheckbox) => v.id).join('');
				// console.log({ _userAnswer });
				this.userAnswer = _userAnswer;
			},
			async getAllQuizs(dbName : string) {
				const rsp : any = await wx.cloud.callFunction({
					name: 'getAllQuiz',
					data: { dbName }
				});
				return rsp.result.data;
			},
			async onSubmit() {
				this.curQuiz.submitted = true;
				const token = uni.getStorageSync('token');
				const isCorrect = this.curQuiz.answer === this.userAnswer;
				const quiz_index = quizController.getCurQuizIndex();
				const quizCount = quizController.getQuizCount();
				const data = {
					quiz_title: this.curQuiz.title, quiz_id: this.curQuiz.id,
					quizType: this.quizType, token, isCorrect, quiz_index, quiz_count: quizCount
				};
				// console.log("onSubmit", data);
				const rsp : any = await wx.cloud.callFunction({
					name: 'answer',
					data
				});
				// console.log('答题结果', rsp)
				return rsp.result.data;
			},
			onPrev() {
				this.curQuiz = { ...quizController.goPreview(), submitted: false };
				this.updateQuiz(this.curQuiz);
			},
			onNext() {
				const nextQuiz = quizController.goNext();
				// console.log('nextQuiz', nextQuiz);
				if (nextQuiz !== null) {
					this.curQuiz = { ...nextQuiz, submitted: false };
					this.updateQuiz(this.curQuiz);
				} else {
					// console.log('onNext quizType.value', quizType.value);
					const queryStr = queryString.stringify({ quizType: this.quizType });
					const url = `/pages/summary/index?${queryStr}`;
					uni.redirectTo({ url })
				}
			},
			updateQuiz(quiz : any) {
				const { option_a, option_b, option_c, option_d, answer } = quiz;
				this.checkboxList = Object.entries({ option_a, option_b, option_c, option_d }).map((v : string[]) => {
					const id = v[0].charAt(v[0].length - 1).toUpperCase();
					const option = {
						id,
						value: `${id}. ${v[1]}`,
						selected: false,
						isCorrect: answer.includes(id),
					};
					return option;
				})
				this.showGroupBtns = true;
			}
		}
	}
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