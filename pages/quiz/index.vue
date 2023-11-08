<template>
	<view class="quiz-wrapper padding30">

		<!-- 题目 -->
		<view class="quiz__group-title mb20">
			<text class="index">{{index_str}}</text>
			<text>{{`&nbsp;&nbsp;`}}</text>
			<text class="title">{{title_str}}</text>
		</view>

		<!-- 4 个选项 -->
		<text class="quiz__option mb20" style="flex: none;" v-for="(option) in checkboxList" :key="option.id" autoHeight
			v-bind:class="{ option: true, 
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
				v-show="curExerciseType !== ExerciseType.Common && curQuiz.submitted && !quizController.hasNext() "
				@click="onNext"></button>
		</view>

		<!-- 评论区 start -->
		<view class="card" v-show="curQuiz.submitted">
			<view class="comment-title-row">
				<view class="hbox">
					<view class="text-sm">评论</view>&nbsp;·&nbsp; <view class="text-sm">
						{{_1stDepthCommentCount}}
					</view>
				</view>
				<view class="hbox" style="width: auto;" @click="onComment">
					<view class="text-sm">评论</view>&nbsp;
					<!-- 这里颜色用的是主题色，要抽取出来 TODO -->
					<u-icon name="edit-pen-fill" color="#5ab8b3" size="40"></u-icon>
				</view>
			</view>
			<!-- 不明白为什么这里有 style="width: 100%;" -->
			<comment v-for="(c) in commentListModel" style="width: 100%;" :key="c.id" :vo="c"
				:user_ids_like="c.user_ids_like" @reply="onReplyComment" @longPressComment="onCommentLongPress"
				@evt_clickLike='onLikeClicked'>
			</comment>
		</view>
	</view>
	<view class="group-bottom">
		<view class="group-fav" @click="toggleFavorite">
			<u-icon :name="curQuiz.favorite?'star-fill':'star'" color="#5ab8b3" size="40"></u-icon>
			<view class="text-sm favorite">{{ curQuiz.favorite ? '取消收藏':'收藏'}}</view>
		</view>
	</view>
	<!-- 以后抽取出一个组件 -->
	<u-popup :show="showCommentPopup" :custom-style="{ paddingBottom: commentPopupBottom}" mode="bottom"
		@close="onCommentPopupClose" @open="onCommentPopupOpen" :close-on-click-overlay="true">
		<view class="card">
			<view class="hbox">
				<u-textarea :show-confirm-bar="false" :focus="inputFocus" confirm-type="发送" :adjust-position="false"
					v-model="comment_value" :auto-height="true" class="text-primary mr30"
					:placeholder="`${!commentToReply?.commenter_name?'发表评论...':'回复给:' + commentToReply?.commenter_name}`"></u-textarea>
				&nbsp;
				<u-icon name="arrow-upward" color="#5ab8b3" size="40" @click="onConfirmComment"></u-icon>
			</view>
		</view>
	</u-popup>
	<!-- 以后抽取出一个组件 -->
	<u-popup :show="showDeletePopup" mode="bottom" @close="onDeletePopupClose" @open="onDeletePopupOpen"
		:close-on-click-overlay="true">
		<view class="card" @click="onDeleteComment">
			删除
		</view>
	</u-popup>
</template>

<script lang="ts" setup>
	import { ref, computed, toRaw } from 'vue';
	import { generateUUID, findCommentById, addCommenterParam } from '../../common/utils';
	import { ICheckbox, IQuiz, quizNameDic, ExerciseType, IComment, ICommenter } from '../../common/common';
	import { words_deleted } from '../../common/langConfig';
	import queryString from 'query-string';
	import { onLoad, onUnload } from '@dcloudio/uni-app';

	import quizController from '../../common/quizController';
	import comment from "../../components/comment/comment.vue";

	const quizType = ref("");        // 题目类型
	const curExerciseType = ref("")  // 做题类型
	const showGroupBtns = ref(false);
	const curQuiz = ref({} as IQuiz);// 当前题目的数据
	const checkboxList = ref([]);    // 当前4个选项
	const userAnswer = ref('');      // 用户的答案
	const quizList = ref([]);
	const commentPopupBottom = ref('');
	const _1stDepthCommentCount = computed(() => commentListModel.value.length)
	const inputFocus = ref();
	// 关于删除弹窗
	const showDeletePopup = ref(false);

	onLoad(async (evt : { quizType : string, exerciseType : string, latest_quiz_index : number }) => {
		const { exerciseType, latest_quiz_index } = evt;
		// 1 设置类型
		curExerciseType.value = exerciseType;
		quizType.value = evt.quizType;

		// 2 设置 bar title
		const title : string = quizNameDic.get(evt.quizType) as string;
		uni.setNavigationBarTitle({ title });

		// 3 加载所有题目
		let list : IQuiz[] = [];
		if (exerciseType === ExerciseType.Common) {
			list = (getApp().globalData as any).quizList;
		} else if (exerciseType === ExerciseType.ErrCollection) {
			list = (getApp().globalData as any).errList;
		} else if (exerciseType === ExerciseType.Favorite) {
			list = (getApp().globalData as any).favList;
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

		uni.onKeyboardHeightChange(onKeyboardHeightChange);
	});

	const onKeyboardHeightChange = (value) => {
		console.log('onKeyboardHeightChange', value);
		commentPopupBottom.value = `${value.height}px`;
	}

	onUnload(() => {
		uni.offKeyboardHeightChange(onKeyboardHeightChange);
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
		} else {
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
		// data 里的 quiz_count 可能没用，待删
		await wx.cloud.callFunction({
			name: 'answer',
			data
		});
	};

	const onPrev = () => {
		curQuiz.value = { ...quizController.goPreview(), submitted: false };
		// console.log('onPrev', curQuiz.value);
		updateQuiz(curQuiz.value);
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

		if (!nextQuiz && curExerciseType.value !== ExerciseType.Common) {
			uni.navigateBack();
			return;
		}

		if (nextQuiz !== null) {
			curQuiz.value = { ...nextQuiz, submitted: false };
			updateQuiz(curQuiz.value);
		}
	};

	/** 初始化时，更新题目选项和评论区 */
	const updateQuiz = (quiz : any) => {
		updateOptions(quiz);

		commentListModel.value = [];

		updateComment(quiz?.id)
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

	/** 初始化时 更新评论区 */
	const updateComment = async (quiz_id : string) => {
		// 1 取出数据库数据
		const rsp : any = await wx.cloud.callFunction({
			name: 'getComments',
			data: { quiz_id }
		});
		if (rsp.result.length === 0) return;
		const list = rsp.result;
		// 2 把 name 和 url 赋到 commenter_name 和 commenter_url 上
		addCommenterParam(list);
		// 3 数据 model
		commentListModel.value = list;
	}

	// 下面是关于评论的
	const showCommentPopup = ref(false);
	const comment_value = ref('');
	const commentListModel = ref([]);

	const onComment = () => {
		commentToReply.value = null;
		showCommentPopup.value = true;
	}

	const onCommentPopupClose = () => {
		showCommentPopup.value = false;
		inputFocus.value = false;
	}

	const onCommentPopupOpen = () => {
		inputFocus.value = true;
	}

	/** 要回复的评论 vo */
	const commentToReply = ref(null);
	const onReplyComment = async (comment : IComment) => {
		if (!comment.exist) return;
		commentToReply.value = comment;
		showCommentPopup.value = true;
	}

	const onConfirmComment = async (e) => {
		// 1 清空 popup
		const commentValue : string = comment_value.value;
		comment_value.value = '';
		showCommentPopup.value = false;

		// 2 评论人信息
		const { name: commenter_name, url: commenter_url, id: commenter_id } = (getApp().globalData as any).loginInfo as ICommenter;

		// 3 更新 UI
		const parent_id = commentToReply.value?.id;
		const comment : IComment = {
			id: generateUUID(),

			at_first_level: !parent_id,
			quiz_id: parent_id ? null : curQuiz.value.id,
			parent_id,

			content: commentValue,
			time: new Date().toLocaleDateString(),
			exist: true,

			commenter_id,
			commenter_name,
			commenter_url,
			comment_list: [],
			user_ids_like: []
		}

		// 4 新的评论 UI 数据'
		if (!parent_id) {
			// 放到第一层
			commentListModel.value.push(comment);
		} else {
			// 放进树里
			let list = toRaw(commentListModel.value);
			const parent : IComment = findCommentById(list, parent_id);
			if (!parent?.comment_list) {
				parent.comment_list = [];// 这三行得优化
			};
			console.log('parent', parent);
			parent.comment_list.push(comment);
			list = toRaw(commentListModel.value);
		}

		// 5 放进数据库里
		const rsp_addComment = await wx.cloud.callFunction({
			name: 'addComment',
			data: comment
		})
	}

	// 下面关于收藏
	const toggleFavorite = async () => {
		// 1 更新当前按钮
		curQuiz.value.favorite = !curQuiz.value.favorite;
		// 2 存入数据库
		const token = uni.getStorageSync('token');
		const { result: favorite } = await wx.cloud.callFunction({
			name: 'toggleFavorite',
			data: { token, quiz_id: curQuiz.value.id }
		});
		// 3 存入内存
		quizController.updateFavorite(curQuiz.value.id, favorite);
	}

	// ---- 下面关于评论的删除 ------
	const onDeletePopupClose = () => {
		showDeletePopup.value = false;
	}

	const onDeletePopupOpen = () => {
		showDeletePopup.value = true;
	}

	// 要删除的评论 id
	const commentIdToBeDeleted = ref(null);
	const onCommentLongPress = async (comment : IComment) => {
		const { commenter_id, exist } = comment;
		const open_user_id = getApp().globalData.loginInfo.id;
		if (!(comment.commenter_id === open_user_id && exist)) return; // 自己的且存在的才可以被删
		commentIdToBeDeleted.value = comment.id;
		showDeletePopup.value = true;
	}

	const onDeleteComment = async () => {
		showDeletePopup.value = false;
		// 1 删除内存数据
		let list = toRaw(commentListModel.value);
		const comment : IComment = findCommentById(list, commentIdToBeDeleted.value);
		// console.log('quiz onDeleteComment comment.content', comment.content);
		// console.log('quiz onDeleteComment comment', comment); // 这有系统 bug
		comment.content = words_deleted;
		comment.time = new Date().toLocaleDateString();
		comment.exist = false;
		// 2 删除数据库数据
		const rsp = await wx.cloud.callFunction({
			name: 'commentUpdate',
			data: { comment }
		});
	}

	const onLikeClicked = async (vo) => {
		// 为什么必须要有下两行代码
		showDeletePopup.value = true;
		showDeletePopup.value = false;
		const { commentId, liked } = vo;
		const myUserId = getApp().globalData.loginInfo.id;
		// 1 存到内存里
		let list = toRaw(commentListModel.value);
		const comment : IComment = findCommentById(list, vo.commentId);
		// 更新点赞人列表
		comment.user_ids_like = comment.user_ids_like || [];
		comment.user_ids_like = liked ? comment.user_ids_like.concat(myUserId) : comment.user_ids_like.filter(userId => userId !== myUserId);
		// 2 存到数据库里
		const rsp = await wx.cloud.callFunction({
			name: 'commentUpdate',
			data: { comment }
		});
	}
</script>

<style lang="scss" scoped>
	page {
		width: 100vw;
		height: 100vh;
		background-color: #eeeeee;
		display: flex;
		flex-direction: column;

		.quiz-wrapper {
			width: 100vw;
			height: 100vh;
			// border: 1px solid red;
			overflow-y: auto;
			flex-grow: 1;
			padding-bottom: 130rpx;
			display: flex;
			flex-direction: column;
			justify-content: flex-start;
			background-color: $uni-bg-color-grey;
			// border: 1px solid red;

			.quiz__group-title {
				font-size: 38rpx;
				font-weight: bold;
				display: flex;
				justify-content: flex-start;

				.index {
					// color: $uni-color-success;
					font-weight: 500;
				}

				.title {}
			}

			.quiz__option {
				font-size: 33rpx;
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
					font-size: $uni-font-size-base;
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


	// view {
	// 	font-size: 28upx;
	// }

	.comment-title-row {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		width: 100%;
	}

	// 包含收藏按钮的 group
	.group-bottom {
		width: 100vw;
		height: 100rpx;
		position: fixed;
		background-color: white;
		bottom: 0;
		display: flex;
		flex-direction: row;
		justify-content: flex-end;
		align-items: flex-start;
		padding: 10rpx;

		.group-fav {
			display: flex;
			flex-direction: row;
			justify-content: flex-start;
			height: 50rpx;
			align-items: center;
			margin-right: 20rpx;
			width: 120rpx;
			margin-right: 70rpx;

			// background-color: red;
			.favorite {
				margin-left: 10rpx;
				// padding-top: 2rpx;
			}
		}
	}
</style>