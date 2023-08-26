<template>
	<view class="first-chapter">
		<u-form id="form-wrapper" labelPosition="left" :model="quizList" ref="form">
			<view v-for="(quiz, index) in quizList" :key="quiz.id" :data-id="quiz.id" class="quiz">
				<u-form-item label="题干" prop="title" label-width="80">
					<u-input v-model="quiz.title" />
				</u-form-item>
				<u-form-item label="A" prop="option_a" label-width="80">
					<u-input v-model="quiz.option_a" />
				</u-form-item>
				<u-form-item label="B" prop="option_b" label-width="80">
					<u-input v-model="quiz.option_b" />
				</u-form-item>
				<u-form-item label="C" prop="option_c" label-width="80">
					<u-input v-model="quiz.option_c" />
				</u-form-item>
				<u-form-item label="D" prop="option_d" label-width="80">
					<u-input v-model="quiz.option_d" />
				</u-form-item>
				<button @click="onUpdateOne" :data-id="quiz?.id">更新本题</button>
			</view>

			<view class="uni-btn-submit">
				<button type="warn" @click="onSubmitAll">更新全部</button>
			</view>
		</u-form>

		<view class="uni-btn-new">
			<button type="primary" @click="produceOne">新建一题</button>
		</view>
		<view class="uni-btn-new">
			<button type="primary" @click="onTest">测试</button>
		</view>
		<u-toast ref="uToast"></u-toast>
	</view>
</template>

<script lang="ts">
	import { generateUUID } from '../../common/utils';
	export default {
		data() {
			return {
				quizList: [],
			}
		},
		async mounted() {
			wx.cloud.init({
				env: "quiz-0gb2aw2vb2850af4"
			});
			const data = await this.getAllQuiz();
			this.quizList.push(...data);
		},
		methods: {
			// 获取全部题目
			async getAllQuiz() {
				const rsp : any = await wx.cloud.callFunction({
					name: 'getAllQuiz',
				})
				return rsp.result.data;
			},
			// 更新一条
			onUpdateOne(evt : any) {
				console.log('onUpdateOne id', evt.target.dataset.id);
				console.log("quizList", this.quizList);
			},
			// 提交所有
			async onSubmitAll(e : any) {
				console.log('onSubmitAll quizList', this.quizList)
				const promises = this.quizList.reverse().map((data) => {
					return wx.cloud.callFunction({
						name: 'addQuiz',
						data
					})
				})
				const rsp : any[] = await Promise.all(promises);
				console.log('rsp', rsp);
				const result = rsp.every((v : any) => v.result?.errMsg === 'collection.add:ok');
				if (result) {
					(this.$refs.uToast as any).show({
						type: 'success',
						icon: false,
						message: "提交成功",
					})
				}
			},
			// 生产一条
			produceOne() {
				this.quizList.push({
					id: generateUUID()
				})
			},
			onTest() {
				(this.$refs.uToast as any).show({
					type: 'success',
					icon: false,
					message: "提交成功",
				})
			}
		}
	}
</script>

<style lang="scss">
	page {
		min-height: 100vh;

		.first-chapter {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;

			.u-form {
				width: 600rpx;
				margin-bottom: 60rpx;

				:deep(.u-form-item__body__left) {
					width: 100rpx;
				}

				.quiz {
					margin-bottom: 40rpx;

					.title {
						color: royalblue;
					}

					.uni-form-item {
						.u-form-item__body {
							.u-form-item__body__left__content {
								width: 100rpx !important;
							}
						}
					}
				}

				.uni-form-item {
					display: flex;
					flex-direction: row;
				}
			}
		}
	}
</style>