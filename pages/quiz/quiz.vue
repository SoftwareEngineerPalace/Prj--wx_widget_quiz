<template>
	<view class="quiz-wrapper padding30" style="padding-top: 10rpx;" @touchstart="onTouchStart" @touchmove="onTouchMove"
		@touchend="onTouchEnd">
		<view class="quiz-wrapper__group-up">
			<view class="quiz-main vbox mb40">
				<!-- 题目 -->
				<view class="quiz__group-title mb20">
					<text class="index">{{index_str}}</text>
					<text>{{`&nbsp;&nbsp;`}}</text>
					<text class="title">{{title_str}}</text>
				</view>

				<!-- 4 个选项 :class="{'quiz__option':true,'mb20':true, 'scale-small': option.scaleSmall}"-->
				<text style="flex: none;" v-for="(option) in checkboxList" :key="option.id" autoHeight v-bind:class="{ 'option': true, 
					'selected': option.selected, 
					'isCorrect': curQuiz.submitted && option.isCorrect, 
					'isWrong': curQuiz.submitted && option.selected && !option.isCorrect,
					'quiz__option': true,
					'mb20': true,
					'scale-small': option.scaleSmall
					}" :data-id="option.id" @click="onClickOption">
					{{option.value}}
				</text>
			</view>
			<!-- 控制进度按钮 下面三个按钮 重复代码太多了 需要重构  -->
			<view class="quiz__group-btn mb30" v-if="!curQuiz.submitted || !quizController.hasNext()">
				<button :class="{'btn-primary':true,
				 'fade-in':!curQuiz.submitted,
				 'fade-out': curQuiz.submitted
				 }" v-text="'提交'" v-show="!curQuiz.submitted" @click="onSubmit"></button>

				<button v-text="'进入结算页'" :class="{'btn-primary':true,
					 'fade-in':curExerciseType === ExerciseType.Common && curQuiz.submitted && !quizController.hasNext(),
					 'fade-out':!(curExerciseType === ExerciseType.Common && curQuiz.submitted && !quizController.hasNext())
					 }" v-show="curExerciseType === ExerciseType.Common && curQuiz.submitted && !quizController.hasNext() "
					@click="gotoSummary"></button>

				<button v-text="'回到首页'" :class="{'btn-primary':true,
					 'fade-in':curExerciseType !== ExerciseType.Common && curQuiz.submitted && !quizController.hasNext(),
					 'fade-out':!(curExerciseType !== ExerciseType.Common && curQuiz.submitted && !quizController.hasNext())
					 }" v-show="curExerciseType !== ExerciseType.Common && curQuiz.submitted && !quizController.hasNext() "
					@click="gotoHome"></button>
			</view>

			<view class="card mb40" :class="{'bottom-tween-popup':curQuiz.submitted}" v-show="curQuiz.submitted"
				style="padding-top: 15rpx;">
				<view class="text-base text-title-sub mb20">做题统计</view>
				<view class="hbox mb10 text-sm">
					<view>{{`本题你做过 ${myAnswerTimes} 次, 错了 `}}</view>
					<view style="color: red;">{{` &nbsp;${myWrongTimes}&nbsp; `}}</view>
					<view> 次</view>
				</view>
				<view class="hbox text-sm mb10">
					<view>{{`所有人正确率 ${allUserCorrectRate} %`}}</view>
				</view>
				<view class="hbox text-sm">
					<view class="mr20">正确率你战胜了</view>
					<progress :style="{'flex-grow': 1, 'color': themeColor }" :percent="100 - correctRateProportion"
						active :activeColor="themeColor" stroke-width="3" show-info="true" font-size="26rpx"></progress>
					<view>&nbsp;的答友</view>
				</view>
			</view>

			<!-- 评论区 start -->
			<view class="card" :class="{'bottom-tween-popup':curQuiz.submitted}" v-show="curQuiz.submitted">
				<view class="comment-title-row">
					<view class="hbox">
						<view class="text-sm">评论</view>&nbsp;·&nbsp; <view class="text-sm">
							{{_1stDepthCommentCount}}
						</view>
					</view>
					<view class="hbox" style="width: auto;" @click="showCommentPopup">
						<view class="text-sm primary-color">评论</view>&nbsp;
						<!-- 这里颜色用的是主题色，要抽取出来, 作为变量 TODO -->
						<u-icon name="edit-pen-fill" :color="themeColor" size="40"></u-icon>
					</view>
				</view>
				<!-- 不明白为什么这里有 style="width: 100%;" -->
				<comment v-for="(c) in commentListModel" style="width: 100%;" :key="c.id" :vo="c"
					:user_ids_like="c.user_ids_like" @reply="onReplyComment" @longPressComment="onCommentLongPress"
					@evt_clickLike='onLikeClicked'>
				</comment>
			</view>
		</view>

		<view class="quiz-wrapper__group-bottom">
			<!-- 1 上一题 -->
			<button class="btn-sub w200" v-text="'上一题'"
				:style="{visibility:quizController.getCurQuizIndex() > 0?'visible':'hidden'}"
				@click="initPrevQuiz"></button>
			<!-- 2 收藏 -->
			<view class="group-fav" @click="toggleFavorite">
				<u-icon :name="curQuiz.favorite?'star-fill':'star'" :color="curQuiz.favorite?themeColor:'0xbbbbbb'"
					size="40"></u-icon>
				<view :style="{color:curQuiz.favorite?themeColor:'0xbbbbbb'}" class="text-sm ml10">{{'收藏'}}</view>
			</view>
			<!-- 3 反馈 -->
			<button plain class="hbox btn-mini" open-type="feedback">
				<u-icon name="chat-fill" color="0xbbbbbb" size="40"></u-icon>
				<view class='text-sm ml10'>反馈</view>
			</button>
			<!-- 3 下一题 -->
			<button class="btn-sub w200" v-text="'下一题'"
				:style="{visibility:quizController.hasNext()?'visible':'hidden'}" @click="initNextQuiz"></button>
		</view>
	</view>

	<!-- 以后抽取出一个组件 -->
	<u-popup :show="commentPopupVisible" :custom-style="{ paddingBottom: commentPopupBottom}" mode="bottom"
		@close="onCommentPopupClose" @open="onCommentPopupOpen" :close-on-click-overlay="true">
		<view class="card">
			<view class="hbox">
				<u-textarea :show-confirm-bar="false" :focus="inputFocus" confirm-type="发送" :adjust-position="false"
					v-model="comment_value" :auto-height="true" class="text-primary mr30"
					:placeholder="`${!commentToReply?.commenter_name?'发表评论...':'回复给:' + commentToReply?.commenter_name}`"></u-textarea>
				&nbsp;
				<u-icon name="arrow-upward" :color="themeColor" size="40" @click="onConfirmComment"></u-icon>
			</view>
		</view>
	</u-popup>

	<!-- 以后和上面组件合并 -->
	<u-popup :show="editCommentPopupVisible" :custom-style="{ paddingBottom: commentPopupBottom}" mode="bottom"
		@close="onEditCommentPopupClose" @open="onEditCommentPopupOpen" :close-on-click-overlay="true">
		<view class="card">
			<view class="hbox">
				<u-textarea :show-confirm-bar="false" :focus="inputFocus" confirm-type="发送" :adjust-position="false"
					v-model="edit_comment_value" :auto-height="true" class="text-primary mr30"
					placeholder="编辑评论..."></u-textarea>
				&nbsp;
				<u-icon name="arrow-upward" :color="themeColor" size="40" @click="onConfirmEditComment"></u-icon>
			</view>
		</view>
	</u-popup>

	<!-- 以后抽取出一个组件 -->
	<u-popup :show="operationPopupVisible" mode="bottom" @close="onOperationPopupClose" @open="onOperationPopupOpen"
		:close-on-click-overlay="true">
		<view class="card">
			<button class="btn-sub mb30" style="width: 100%;" @click="toEditComment">编辑</button>
			<button class="btn-sub" style="width: 100%;" @click="toDeleteComment">删除</button>
		</view>
	</u-popup>
</template>

<script lang="ts" setup>
	import { ref, computed, toRaw } from 'vue';
	import { generateUUID, findCommentById, addCommenterParam } from '../../common/utils';
	import { ICheckbox, IQuiz, quizNameDic, ExerciseType, IComment, ICommenter, qrCode } from '../../common/common';
	import { words_deleted } from '../../common/langConfig';
	import queryString from 'query-string';
	import { onLoad, onUnload } from '@dcloudio/uni-app';

	import quizController from '../../common/quizController';
	import comment from "../../components/comment/comment.vue";
	import {
		onShareAppMessage,
		onShareTimeline
	} from '@dcloudio/uni-app';

	const themeColor = ref(getApp().globalData.themeColor)
	const myAnswerTimes = ref(0);
	const myCorrectTimes = ref(0);
	const myWrongTimes = ref(0);
	const allUserCorrectRate = ref(0);
	const correctRateProportion = ref(100);
	const quizType = ref("");        // 题目类型
	const curExerciseType = ref("")  // 做题类型
	const curQuiz = ref({} as IQuiz);// 当前题目的数据
	const checkboxList = ref([]);    // 当前4个选项
	const userAnswer = ref('');      // 用户的答案
	const commentPopupBottom = ref('');
	const _1stDepthCommentCount = computed(() => commentListModel.value.length)
	const inputFocus = ref();
	// 关于删除弹窗
	const operationPopupVisible = ref(false);

	// 1 左右滑动切题
	const startX = ref(0);
	const startY = ref(0);
	const readyToNext = ref(false);
	const readyToPrev = ref(false);

	const onTouchStart = (evt) => {
		readyToNext.value = readyToPrev.value = false;
		startX.value = evt.touches[0].pageX;
		startY.value = evt.touches[0].pageY;
	}

	const onTouchMove = (evt) => {
		const curX = evt.touches[0].pageX;
		const curY = evt.touches[0].pageY;
		if (curX - startX.value > 60 && Math.abs(curY - startY.value) < 150) {
			readyToPrev.value = true; 		// 可以上一题
		}
		if (startX.value - curX > 60 && Math.abs(curY - startY.value) < 150) {
			readyToNext.value = true;	// 可以下一题
		}
	}

	const onTouchEnd = () => {
		if (readyToNext.value) {
			initNextQuiz()
		}
		if (readyToPrev.value) {
			initPrevQuiz()
		}
		readyToNext.value = readyToPrev.value = false;
	}

	// 2 分享
	onShareAppMessage(() => {
		return {
			title: '软工题库',
			path: 'pages/home/index',
			imageUrl: qrCode,
		};
	});

	onShareTimeline(() => {
		return {
			title: '软工题库',
			path: 'pages/home/index',
			imageUrl: qrCode,
		};
	})

	// 3 刷新当前题目题干
	const title_str = computed(() => curQuiz.value.title ?? '');
	const index_str = computed(() => {
		curQuiz.value;
		const sn = quizController.getCurQuizSN();
		const count = quizController.getQuizCount();
		// console.log({ sn, count })
		if (sn < 1 || count < 1) {
			return '';
		}
		if (curExerciseType.value === ExerciseType.Common) {
			return sn !== 0 ? `${sn}/${count}.  ` : "";
		} else {
			return sn !== 0 ? `${sn}. ` : "";
		}
	})

	// 4 初始化
	onLoad(async (evt : { quizType : string, exerciseType : string, latest_quiz_index : number }) => {
		// console.log('quiz onLoad');
		const { exerciseType, latest_quiz_index } = evt;
		// 1 设置类型
		curExerciseType.value = exerciseType;
		quizType.value = evt.quizType;

		// 2 设置 bar title
		const title : string = quizNameDic.get(evt.quizType) as string;
		uni.setNavigationBarTitle({ title });

		// 3 设置键盘
		uni.onKeyboardHeightChange(onKeyboardHeightChange);

		// 4 把 list 和 index 设置进 quizController
		initQuizListAndIndex(exerciseType, parseInt(latest_quiz_index));

		// 5 渲染下一题
		initNextQuiz();
	});

	const initQuizListAndIndex = (exerciseType : string, latest_quiz_index : number) => {
		let list : IQuiz[];
		// 下面这个得优化
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
				icon: "none",
				duration: 1000
			})
			setTimeout(() => {
				uni.navigateBack();
			}, 1000)
			return;
		}
		// list
		quizController.setQuizList(list);

		// index
		quizController.setCurQuizIndex(latest_quiz_index);
	}

	const onKeyboardHeightChange = (value) => {
		// console.log('onKeyboardHeightChange', value);
		commentPopupBottom.value = `${value.height}px`;
	}

	/** 初始化时，更新题目选项和评论区 */
	const updateQuiz = (quiz : any) => {
		updateOptions(quiz);

		commentListModel.value = [];

		updateComment(quiz?.id);
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
	}

	/** 初始化时 更新评论区 */
	const updateComment = async (quiz_id : string) => {
		const quiz_type = quizType.value;
		// 1 取出数据库数据
		const rsp : any = await wx.cloud.callFunction({
			name: 'getComments',
			data: { quiz_id, quiz_type }
		});
		if (rsp.result.length === 0) return;
		const list = rsp.result;
		addCommenterParam(list);
		// 3 数据 model
		commentListModel.value = list;
	}

	onUnload(() => {
		uni.offKeyboardHeightChange(onKeyboardHeightChange);
		quizController.setQuizList([]);
	})

	// 5 做题
	const onClickOption = (evt : any) => {
		const clicked_id = evt.target.dataset.id;
		checkboxList.value.forEach((v : any) => {
			if (v.id === clicked_id) {
				if (!v.selected) v.scaleSmall = true;
				v.selected = !v.selected;
			}
		})
		const _userAnswer = checkboxList.value.filter((v : ICheckbox) => v.selected).map((v : ICheckbox) => v.id).join('');
		userAnswer.value = _userAnswer;
	};

	const onSubmit = async () => {
		// console.log("onSubmit");
		curQuiz.value.submitted = true;
		const token = uni.getStorageSync('token');
		const isCorrect = curQuiz.value.answer === userAnswer.value;
		const quiz_sn = quizController.getCurQuizSN();
		const quizCount = quizController.getQuizCount();
		const data = {
			quiz_title: curQuiz.value.title,
			quiz_id: curQuiz.value.id,
			quizType: quizType.value,
			token,
			isCorrect,
			quiz_sn,
			quiz_count: quizCount,
			exerciseType: curExerciseType.value
		};
		const { result } = await wx.cloud.callFunction({
			name: 'answer',
			data
		});
		// console.log("answer", result);
		const { answer_times, correct_times, all_user_rate, all_user_answer_times, all_user_correct_times, correct_rate_proportion } = result;
		myAnswerTimes.value = answer_times;
		myWrongTimes.value = answer_times - correct_times;
		allUserCorrectRate.value = all_user_rate;
		correctRateProportion.value = correct_rate_proportion;
	};

	const resetCurQuizStat = () => {
		myAnswerTimes.value = 0;
		myWrongTimes.value = 0;
		allUserCorrectRate.value = 0;
		correctRateProportion.value = 100;
	}

	const initPrevQuiz = () => {
		const preQuiz = quizController.goPreview();
		if (!preQuiz) {
			uni.showToast({
				title: "已是第一题"
			})
			return;
		}
		resetCurQuizStat();

		curQuiz.value = { ...preQuiz, submitted: false };
		updateQuiz(curQuiz.value);
	};

	const initNextQuiz = () => {
		const nextQuiz = quizController.goNext();
		if (!nextQuiz) {
			uni.showToast({
				title: "已是最后一题"
			})
			return;
		}
		resetCurQuizStat();

		curQuiz.value = { ...nextQuiz, submitted: false };
		updateQuiz(curQuiz.value);
	};

	// 7 换页面
	const gotoSummary = () => {
		const queryStr = queryString.stringify({ quizType: quizType.value });
		const url = `/pages/summary/summary?${queryStr}`;
		uni.redirectTo({ url })
	}

	const gotoHome = () => {
		uni.navigateBack();
	}

	// 8 下面是关于评论的

	// 8.1 长按显示操作窗
	const pendingOperateCommentId = ref(null);
	const onCommentLongPress = async (comment : IComment) => {
		const { commenter_id, exist } = comment;
		const open_user_id = getApp().globalData.loginInfo.id;
		if (!(comment.commenter_id === open_user_id && exist)) return; // 自己的且存在的才可以操作
		pendingOperateCommentId.value = comment.id;
		operationPopupVisible.value = true;
	}
	const commentPopupVisible = ref(false);
	const comment_value = ref('');
	// TODO 最好用 class 来定义，对于可变的数据记录，最好用 class 类定义
	const commentListModel = ref([]);

	const onOperationPopupClose = () => {
		operationPopupVisible.value = false;
	}

	const onOperationPopupOpen = () => {
		operationPopupVisible.value = true;
	}

	// 8.2 删除
	const toDeleteComment = async () => {
		operationPopupVisible.value = false;
		// 1 删除内存数据
		let list = toRaw(commentListModel.value);

		// 这里应该封装一个 set 函数
		const comment : IComment = findCommentById(list, pendingOperateCommentId.value);
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

	// 8.3 编辑
	const toEditComment = async () => {
		operationPopupVisible.value = false;
		editCommentPopupVisible.value = true;
		let list = toRaw(commentListModel.value);
		const comment : IComment = findCommentById(list, pendingOperateCommentId.value);
		edit_comment_value.value = comment.content;
	}

	// 8.4 打开评论输入窗
	const showCommentPopup = () => {
		commentToReply.value = null;
		commentPopupVisible.value = true;
	}

	const onCommentPopupClose = () => {
		commentPopupVisible.value = false;
		inputFocus.value = false;
	}

	const onCommentPopupOpen = () => {
		inputFocus.value = true;
	}

	/** 要回复的评论 vo，作用是新评论加上 parent_id */
	const commentToReply = ref(null);
	// 8.5 点击回复，从子组件中发出的
	const onReplyComment = async (comment : IComment) => {
		if (!comment.exist) return; // 已被删除，则跳过
		commentToReply.value = comment;
		commentPopupVisible.value = true;
	}

	const editCommentPopupVisible = ref(false);
	const edit_comment_value = ref('');

	const onEditCommentPopupOpen = () => {

	}
	const onEditCommentPopupClose = () => {
		editCommentPopupVisible.value = false;
	}
	const onConfirmEditComment = async () => {
		editCommentPopupVisible.value = false;

		// 1 更新内存
		let list = toRaw(commentListModel.value);
		const comment : IComment = findCommentById(list, pendingOperateCommentId.value);
		// console.log('quiz onConfirmEditComment comment.content', comment.content);
		// console.log('quiz onConfirmEditComment comment', comment); // 这有系统 bug
		comment.content = edit_comment_value.value;
		comment.time = new Date().toLocaleDateString();

		// 2 更新数据库数据
		const rsp = await wx.cloud.callFunction({
			name: 'commentUpdate',
			data: { comment }
		});
	}

	// 8.6 新评论确认
	const onConfirmComment = async (e) => {
		// 1 清空 popup
		const commentValue : string = comment_value.value;
		comment_value.value = '';
		commentPopupVisible.value = false;

		if (!commentValue) {
			uni.showToast({
				title: '没有输入',
				icon: "none"
			})
			return
		}; // 没数据则跳过

		// 2 评论人信息
		const { name: commenter_name, url: commenter_url, id: commenter_id } = (getApp().globalData as any).loginInfo as ICommenter;

		// 3 更新 UI
		const parent_id = commentToReply.value?.id;
		const comment : IComment = {
			id: generateUUID(),

			at_first_level: !parent_id,
			quiz_id: curQuiz.value.id,
			quiz_type: quizType.value,
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

		// 4 新的评论 UI 数据
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
			// console.log('parent', parent);
			parent.comment_list.push(comment);
			list = toRaw(commentListModel.value);
		}

		// 5 放进数据库里
		const rsp_addComment = await wx.cloud.callFunction({
			name: 'addComment',
			data: comment
		})
	}

	// 9 下面关于收藏
	const toggleFavorite = async () => {
		// console.log('题目当前 favorite 是', curQuiz.value.favorite);
		// 1 更新当前按钮
		curQuiz.value.favorite = !curQuiz.value.favorite;
		// 2 存入数据库
		const token = uni.getStorageSync('token');
		const { result } = await wx.cloud.callFunction({
			name: 'toggleFavorite',
			data: { token, quiz_id: curQuiz.value.id }
		});
		const { favorite } = result;
		// console.log('数据库更新后，favorite 变成', favorite);

		// 3 存入内存
		quizController.updateFavorite(curQuiz.value.id, favorite);
	}

	// 关于点赞
	const onLikeClicked = async (vo) => {
		// 为什么必须要有下两行代码
		operationPopupVisible.value = true;
		operationPopupVisible.value = false;
		const { commentId, commenterId, liked } = vo;
		const myUserId = getApp().globalData.loginInfo.id;
		// 自己不可以给自己点赞
		if (commenterId === myUserId) {
			uni.showToast({
				title: "只能点赞别人的评论",
				icon: "none",
				duration: 1000
			})
			return;
		}
		// 1 存到内存里
		let list = toRaw(commentListModel.value);
		const comment : IComment = findCommentById(list, vo.commentId);
		// 2 更新点赞人列表
		comment.user_ids_like = comment.user_ids_like || [];
		comment.user_ids_like = liked ? comment.user_ids_like.concat({ given_like_user_id: myUserId, like_time: new Date().getTime() })
			: comment.user_ids_like.filter(vo => vo.given_like_user_id !== myUserId);
		// 3 存到数据库里
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
			flex-grow: 1;
			// padding-bottom: 130rpx;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			background-color: $uni-bg-color-grey;
			padding-bottom: env(safe-area-inset-bottom);

			.quiz-wrapper__group-up {
				display: flex;
				flex-grow: 1;
				flex-direction: column;
				justify-content: flex-start;
				align-items: stretch;
				overflow-y: auto;
				padding-bottom: 20rpx;

				.quiz-main {
					align-items: stretch;

					.quiz__group-title {
						font-size: 38rpx;
						font-weight: 400;
						display: flex;
						justify-content: flex-start;
					}

					.quiz__option {
						font-size: 33rpx;
						background-color: white;
						border-radius: 20rpx;
						padding: 20rpx;
						color: black;
						border: 2rpx solid #00000000;

						&:last-child {
							margin-bottom: 0;
						}

						&:active {
							animation: fadeInMovie 0.3s ease forwards;
						}

						&.selected {
							background-color: gray;
							color: white;
						}

						&.isCorrect {
							// background-color: $uni-color-success;
							// color: white;
							background-color: white;
							border: 2rpx solid $uni-color-success;
							color: $uni-color-success;
						}

						&.isWrong {
							// background-color: $uni-color-error;
							// color: white;
							background-color: white;
							border: 2rpx solid $uni-color-error;
							color: $uni-color-error;
						}
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

				.comment-title-row {
					display: flex;
					flex-direction: row;
					justify-content: space-between;
					align-items: center;
					width: 100%;
					font-weight: bolder;
				}
			}

			// 包含收藏按钮的 group
			.quiz-wrapper__group-bottom {
				width: 100%;
				background-color: $uni-bg-color-grey;
				bottom: 0;
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				align-items: center;
				padding: 20rpx 20rpx 0 20rpx;

				.group-fav {
					display: flex;
					flex-direction: row;
					justify-content: center;
					height: 50rpx;
					align-items: center;
					width: 200rpx;
					// margin-left: 50rpx;
					// margin-right: 50rpx;

					.favorite-word {
						margin-left: 10rpx;
					}
				}

				.btn-mini {
					border: none;
					height: 50rpx;
					width: 200rpx;
					font-size: $uni-font-size-sm;
				}
			}
		}
	}
</style>