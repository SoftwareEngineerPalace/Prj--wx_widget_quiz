import { IQuiz } from "./utils";

class QuizController {

	_curQuizIndex : number = -1;
	_quizList : any[] = [];
	_quizCount : number;

	public getCurQuizIndex() {
		return this._curQuizIndex;
	}

	/** sn 是题目编码 从1开始 是固定的*/
	public getCurQuizSN() {
		// console.log("quizController getCurQuizSN this._curQuizIndex=", this._curQuizIndex);
		// console.log("quizController getCurQuizSN this._quizList=", this._quizList.length);
		return this._quizList?.[this._curQuizIndex]?.sn || ''; // 空字符串表示没有取到数据
	}

	public getQuizCount() {
		return this._quizCount;
	}

	private static _instance : QuizController;

	public static getInstance() : QuizController {
		if (!QuizController._instance) {
			QuizController._instance = new QuizController();
		}
		return QuizController._instance;
	}

	constructor(list : any[] = []) {
		this._quizList = list.concat();
		this._quizCount = list.length;
	}

	setQuizList = (list : any[] = []) => {
		this._quizList = list.concat();
		this._quizCount = list.length;
		this._curQuizIndex = -1;
	}

	/** 更新题目的 first_comment_id by sn */
	updateQuizFirstCommentIdByQuizSN = (sn : number, first_comment_id : string) => {
		const quiz : IQuiz = this._quizList.find((quiz : IQuiz) => quiz.sn === sn);
		Object.assign(quiz, { first_comment_id });
		console.log("updateQuizFirstCommentIdByQuizSN 后", this._quizList)
	}

	setCurQuizIndex = (index : number) => {
		// console.log("quizController setCurQuizIndex index", index);
		this._curQuizIndex = index;
	}

	hasNext = () => {
		return this._curQuizIndex < this._quizCount - 1;
	}

	goNext = () => {
		if (this._curQuizIndex < this._quizCount - 1) {
			this._curQuizIndex += 1;
			return this._quizList[this._curQuizIndex];
		} else {
			return null;
		}
	}

	goPreview = () => {
		if (this._curQuizIndex > 0) {
			this._curQuizIndex -= 1;
			return this._quizList[this._curQuizIndex];
		}
	}
}

export default QuizController.getInstance();