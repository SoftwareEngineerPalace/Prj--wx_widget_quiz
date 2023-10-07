class QuizController {

	_curQuizIndex : number = -1;
	_quizList : any[] = [];
	_quizCount : number;

	public getCurQuizIndex() {
		return this._curQuizIndex;
	}
	
	public getCurQuizSN(){
		return this._quizList[this._curQuizIndex].sn;
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

	setCurQuizIndex = (index : number) => {
		console.log("quizController setCurQuizIndex index", index);
		this._curQuizIndex = index;
	}

	hasNext = () => {
		return this._curQuizIndex < this._quizCount - 1;
	}

	goNext = () => {
		if (this._curQuizIndex < this._quizCount - 1) {
			this._curQuizIndex += 1;
			console.log("quizController goNext this._curQuizIndex", this._curQuizIndex);
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