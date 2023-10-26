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

		<!-- 评论区 start -->
		<view class="card">
			<view class="comment-title-row">
				<view class="hbox">
					<view class="text-primary">评论</view>&nbsp;·&nbsp; <view class="text-primary">
						{{_1stDepthCommentCount}}
					</view>
				</view>
				<view class="hbox" style="width: auto;" @click="onComment">
					<view class="text-primary">评论</view>&nbsp;
					<!-- 这里颜色用的是主题色，要抽取出来 TODO -->
					<u-icon name="edit-pen-fill" color="#5ab8b3" size="40"></u-icon>
				</view>
			</view>
			<!-- 不明白为什么这里有 style="width: 100%;" :avatarUrl="c.avatarUrl"
				:commenterName="c.nickName" :time="c.time" :likeCount="c.likeCount" :content="c.content"-->
			<comment v-for="(c) in commentList" style="width: 100%;" :key="c.id" :vo="c">

			</comment>
		</view>

		<u-popup :show="showCommentPopup" mode="bottom" @close="onCommentPopupClose" @open="onCommentPopupOpen">
			<view class="card">
				<view class="hbox">
					<u-textarea v-model="comment_value" :auto-height="true" class="text-primary mr30"
						placeholder="请输入"></u-textarea>
					&nbsp;
					<u-icon name="arrow-upward" color="#5ab8b3" size="40" @click="onConfirmComment"></u-icon>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script lang="ts" setup>
	import comment from "../../components/comment/comment.vue";
	import { ref, computed } from 'vue';
	import quizController from '../../common/quizController';
	import { ICheckbox, IQuiz, quizNameDic, ExerciseType, IComment, generateUUID, ICommenter } from '../../common/utils';
	import queryString from 'query-string';
	import { onLoad, onUnload } from '@dcloudio/uni-app';
	import { getAllQuizs, getErrorCollectonQuiz } from '../../service';

	const quizType = ref("");        // 题目类型
	const curExerciseType = ref("")  // 做题类型
	const showGroupBtns = ref(false);
	const curQuiz = ref({} as IQuiz);// 当前题目的数据
	const checkboxList = ref([]);    // 当前4个选项
	const userAnswer = ref('');      // 用户的答案
	const quizList = ref([]);
	const _1stDepthCommentCount = ref("评论数")

	onLoad(async (evt : { quizType : string, exerciseType : string, latest_quiz_index : string }) => {
		// console.log('quiz onLoad', evt);
		const { latest_quiz_index, exerciseType } = evt;
		curExerciseType.value = exerciseType;
		wx.cloud.init({
			env: "quiz-0gb2aw2vb2850af4"
		});
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

		onNext();
	});

	onUnload(() => {
		quizController.setQuizList([]);
	})

	// 刷新当前题目题干 
	const title_str = computed(() => curQuiz.value.title ?? '');
	const index_str = computed(() => {
		curQuiz.value;
		const sn = quizController.getCurQuizSN();
		const count = quizController.getQuizCount();
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
		await wx.cloud.callFunction({
			name: 'answer',
			data
		});
		// console.log('答题结果', rsp)
	};

	const onPrev = () => {
		curQuiz.value = { ...quizController.goPreview(), submitted: false };
		upadteQuiz(curQuiz.value);
	};

	const onNext = () => {
		const nextQuiz = quizController.goNext();
		// console.dir('nextQuiz', nextQuiz);
		if (!nextQuiz && curExerciseType.value === ExerciseType.Common) {
			// console.log('onNext redirectTo quizType.value', quizType.value);
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
			upadteQuiz(curQuiz.value);

		}
	};

	/** 更新题目选项和和评论区 */
	const upadteQuiz = (quiz : any) => {
		updateOptions(quiz);
		if (!!quiz?.first_comment_id) {
			upadteComment(quiz?.first_comment_id)
		}
	}

	/** 刷新当前题目选项 */
	const updateOptions = (quiz : any) => {
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

	/** 更新评论区 */
	const upadteComment = async (first_comment_id : string) => {
		console.log("upadteComment", first_comment_id)
		const rsp : any = await wx.cloud.callFunction({
			name: 'getComment',
			data: { id: first_comment_id }
		});
		console.log("quiz getComment", rsp)
	}

	// 下面是关于评论的
	const showCommentPopup = ref(false);
	const comment_value = ref('');
	const commentList = ref([]);

	const onComment = () => {
		showCommentPopup.value = true;
	}

	const onCommentPopupClose = () => {
		showCommentPopup.value = false;
	}

	const onCommentPopupOpen = () => {

	}

	const onConfirmComment = async () => {
		const commentValue : string = comment_value.value;
		comment_value.value = '';
		showCommentPopup.value = false;

		const { nickName, avatarUrl, openid } = (getApp().globalData as any).loginInfo as ICommenter;

		// 创建第 1 个评论的数据，评论和评论员数据放一起，就不遵循数据库的第三范式了
		const comment : IComment = {
			id: generateUUID(),
			parent_id: "",
			lTag: 0,
			left_child_id: '',
			rTag: 0,
			right_child_id: '',

			content: commentValue,
			time: new Date().toLocaleDateString(),
			likeCount: 0,

			commenter_id: openid,
			nickName,
			avatarUrl
		}
		// 1 更新
		commentList.value.push(comment);

		// 2 把评论放入数据库
		const data = { ...comment, commenter_id: openid };
		console.log("把评论放入数据库", data);
		await wx.cloud.callFunction({
			name: 'addComment',
			data
		})

		// 3 如果是第 1 个评论，则绑到 quiz 上
		if (!curQuiz.value.first_comment_id) {
			const data = { ...curQuiz.value, first_comment_id: comment.id, dbName: quizType.value };
			console.log('要更新的题目数据', data)
			await wx.cloud.callFunction({
				name: 'updateQuiz',
				data
			})
		}

		// 4 如果数据库里没有这个评论人，则把这个评论人放到数据库里
		const commenter = { id: openid, commenter_name: nickName, avatar_url: avatarUrl };
		await wx.cloud.callFunction({
			name: 'addCommenter',
			data: { ...commenter }
		})
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


	view {
		font-size: 28upx;
	}

	.comment-title-row {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		width: 100%;
	}
</style>