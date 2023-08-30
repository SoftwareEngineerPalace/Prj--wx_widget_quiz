class QuizController {

	_curQuizIndex : number = -1;
	_quizList : any[] = [];
	_quizCount : number;

	public getCurQuizIndex() {
		return this._curQuizIndex;
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
		console.log('setQuizList', list.length);
	}

	goNext = () => {
		if (this._curQuizIndex < this._quizCount - 1) {
			this._curQuizIndex += 1;
			// console.log('goNext', this._quizList[this._curQuizIndex])
			return this._quizList[this._curQuizIndex];
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