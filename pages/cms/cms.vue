<template>
	<view class="first-chapter">
		<u-form id="form-wrapper" labelPosition="left" ref="form">
			<view v-for="(quiz, index) in quizList" :key="quiz.id" :data-id="quiz.id" class="quiz">
				<u-form-item :label="`${index + 1}`" prop="title" label-width="80">
					<u-textarea autoHeight v-model="quiz.title"></u-textarea>
				</u-form-item>
				<u-form-item label="A" prop="option_a" label-width="80">
					<u-textarea autoHeight v-model="quiz.option_a" maxlength="1000"></u-textarea>
				</u-form-item>
				<u-form-item label="B" prop="option_b" label-width="80">
					<u-textarea autoHeight v-model="quiz.option_b" maxlength="1000"></u-textarea>
				</u-form-item>
				<u-form-item label="C" prop="option_c" label-width="80">
					<u-textarea autoHeight v-model="quiz.option_c" maxlength="1000"></u-textarea>
				</u-form-item>
				<u-form-item label="D" prop="option_d" label-width="80">
					<u-textarea autoHeight v-model="quiz.option_d" maxlength="1000"></u-textarea>
				</u-form-item>
				<u-form-item label="答案" prop="answer" label-width="80">
					<u-input v-model="quiz.answer" />
				</u-form-item>
				<u-form-item label=" " label-width="80">
					<button type="primary" style="width: 100%;" class="btn" @click="onAddOne" v-show="quiz.init"
						:data-id="quiz.id">插入数据库</button>
					<button type="primary" style="width: 100%;" class="btn" @click="onUpdateOne" v-show="!quiz.init"
						:data-id="quiz.id">更新</button>
				</u-form-item>
			</view>
		</u-form>

		<view class="uni-btn-new">
			<button type="warn" @click="produceOne">新建一题</button>
		</view>
		<u-notify message="更新成功" :show="showNotify"></u-notify>
	</view>
</template>

<script lang="ts" setup>
	import { generateUUID } from '../../common/utils';
	import { quizNameDic, IQuiz } from '../../common/common';
	import { ref, Ref } from 'vue';
	import { onLoad } from '@dcloudio/uni-app';

	const quizList : Ref<Array<IQuiz>> = ref([]);
	const dbName = ref('');
	const showNotify = ref(true);

	onLoad(async (evt : { quizType : string }) => {
		dbName.value = evt.quizType;
		uni.setNavigationBarTitle({ title: `${quizNameDic.get(evt.quizType)} 后台` });
		const data : IQuiz[] = await getAllQuiz(evt.quizType);
		quizList.value.push(...data);
	});

	// 获取全部题目
	const getAllQuiz = async (quiz_type : string) => {
		const rsp : any = await wx.cloud.callFunction({
			name: 'getAllQuiz',
			data: { quiz_type }
		})
		return rsp.result.data;
	};

	// 更新一条
	const onUpdateOne = async (evt : any) => {
		const id_to_update : string = evt.target.dataset.id;
		const quiz = quizList.value.find((v : IQuiz) => v.id === id_to_update);
		const sn = quizList.value.findIndex((v : IQuiz) => v.id === id_to_update);
		const data = { ...quiz, dbName: dbName.value, sn: sn + 1 };
		// console.log('onUpdateOne', data)
		const rsp : any = await wx.cloud.callFunction({
			name: 'updateQuiz',
			data
		})
		// console.log("onUpdateOne", { rsp });
		const result = rsp.errMsg === "cloud.callFunction:ok";
		if (result) {
			uni.showToast({
				title: '更新成功',
				icon: "none",
				duration: 2000
			});
		}
	};
	//
	const onAddOne = async (e : any) => {
		const id_to_add : string = e.target.dataset.id;
		const data = quizList.value.find((v : IQuiz) => v.id === id_to_add);
		const index = quizList.value.findIndex((v : IQuiz) => v.id === id_to_add);
		const rsp : any = await wx.cloud.callFunction({
			name: 'addQuiz',
			data: { ...data, init: false, dbName: dbName.value, index }
		})
		const result = rsp.result?.errMsg === 'collection.add:ok';
		if (result) {
			uni.showToast({
				title: '新建成功',
				icon: "none",
				duration: 2000
			});
			quizList.value.forEach((v : IQuiz) => {
				if (v.id === id_to_add) {
					v.init = false;
				}
			});
		}
	};
	// 生产一条
	const produceOne = () => {
		quizList.value.push({
			init: true,
			id: generateUUID(),
			title: '下面关于的描述中，正确的有哪些'
		})
	};
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