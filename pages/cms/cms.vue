<template>
	<view class="first-chapter">
		<u-form id="form-wrapper" labelPosition="left" :model="quizList" ref="form">
			<view v-for="(quiz, index) in quizList" :key="quiz.id" :data-id="quiz.id" class="quiz">
				<u-form-item :label="`${index + 1}`" prop="title" label-width="80">
					<u-textarea autoHeight v-model="quiz.title"></u-textarea>
				</u-form-item>
				<u-form-item label="A" prop="option_a" label-width="80">
					<u-textarea autoHeight v-model="quiz.option_a" maxlength="400"></u-textarea>
				</u-form-item>
				<u-form-item label="B" prop="option_b" label-width="80">
					<u-textarea autoHeight v-model="quiz.option_b"></u-textarea>
				</u-form-item>
				<u-form-item label="C" prop="option_c" label-width="80">
					<u-textarea autoHeight v-model="quiz.option_c"></u-textarea>
				</u-form-item>
				<u-form-item label="D" prop="option_d" label-width="80">
					<u-textarea autoHeight v-model="quiz.option_d"></u-textarea>
				</u-form-item>
				<u-form-item label="答案" prop="answer" label-width="80">
					<u-input v-model="quiz.answer" />
				</u-form-item>
				<u-form-item label=" " label-width="80">
					<button type="primary" style="width: 100%;" class="btn" @click="onAddOne" v-if="quiz?.init"
						:data-id="quiz?.id">插入数据库</button>
					<button type="primary" style="width: 100%;" class="btn" @click="onUpdateOne" v-if="!quiz?.init"
						:data-id="quiz?.id">更新</button>
				</u-form-item>
			</view>
		</u-form>

		<view class="uni-btn-new">
			<button type="warn" @click="produceOne">新建一题</button>
		</view>
		<u-toast ref="uToast"></u-toast>
	</view>
</template>

<script lang="ts">
	import { generateUUID, quizNameDic, showToast } from '../../common/utils';
	export default {
		data() {
			return {
				quizList: [],
				dbName: ''
			}
		},
		async onLoad(evt) {
			this.dbName = evt.quizType;
			console.log("onLoad", evt);
			uni.setNavigationBarTitle({ title: `${quizNameDic[evt.quizType]} 后台` });
			wx.cloud.init({
				env: "quiz-0gb2aw2vb2850af4"
			});
			const data = await this.getAllQuiz(evt.quizType);
			this.quizList.push(...data);
		},
		async mounted() {
			console.log("mounted");
		},
		onUnload() {
			uni.setNavigationBarTitle({ title: '' });
		},
		methods: {
			// 获取全部题目
			async getAllQuiz(dbName : string) {
				const rsp : any = await wx.cloud.callFunction({
					name: 'getAllQuiz',
					data: { dbName }
				})
				return rsp.result.data;
			},
			// 更新一条
			async onUpdateOne(evt : any) {
				const id_to_update : string = evt.target.dataset.id;
				const quiz = this.quizList.find(v => v.id === id_to_update);
				const data = { ...quiz, dbName: this.dbName };
				console.log('onUpdateOne', data)
				const rsp : any = await wx.cloud.callFunction({
					name: 'updateQuiz',
					data
				})
				const result = rsp.errMsg === "cloud.callFunction:ok";
				if (result) {
					showToast(this, "更新成功")
				}
			},
			//
			async onAddOne(e : any) {
				const id_to_add : string = e.target.dataset.id;
				const data = this.quizList.find(v => v.id === id_to_add);
				const index = this.quizList.findIndex(v => v.id === id_to_add);
				const rsp : any = await wx.cloud.callFunction({
					name: 'addQuiz',
					data: { ...data, init: false, dbName: this.dbName, index }
				})
				const result = rsp.result?.errMsg === 'collection.add:ok';
				if (result) {
					showToast(this, "新建成功");
					this.quizList.forEach(v => {
						if (v.id === id_to_add) {
							v.init = false;
						}
					});
				}
			},
			// 生产一条
			produceOne() {
				this.quizList.push({
					init: true,
					id: generateUUID(),
					title: '下面关于的描述中，正确的有哪些'
				})
			},
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

				.quiz {
					margin-bottom: 40rpx;

					.title {
						color: red;
					}

					.uni-form-item {
						background-color: yellow;

						.u-form-item__body {
							.u-form-item__body__right {
								.u-form-item__body__right__content {
									.u-form-item__body__right__content__slot {
										background-color: yellow;

										button {
											width: 100%;
										}
									}
								}
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