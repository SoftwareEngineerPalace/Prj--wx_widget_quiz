const logoImgUrl = 'https://7175-quiz-0gb2aw2vb2850af4-1320288220.tcb.qcloud.la/%E8%BD%AF%E5%B7%A5%E9%A2%98%E5%BA%93.png?sign=28d38d42a40f6a756593ca3b93842e47&t=1699611121';
const qrCode = "https://7175-quiz-0gb2aw2vb2850af4-1320288220.tcb.qcloud.la/qrCode.png?sign=12652364954f6a1849a609e965b46329&t=1699699634";
const logoImgUrlDeep = 'https://7175-quiz-0gb2aw2vb2850af4-1320288220.tcb.qcloud.la/%E8%BD%AF%E5%B7%A5%E9%A2%98%E5%BA%93_%E6%B7%B1%E8%89%B2%E8%83%8C%E6%99%AF.png?sign=c7a3aacb13cefcb65ac04c9133d16bcb&t=1699855924';
const loginInfo_default = {
	name: "未登录",
	url: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
	id: ''
};

interface IQuiz {
	id : string;
	title : string;
	init : boolean;
	option_a ?: string;
	option_b ?: string;
	option_c ?: string;
	option_d ?: string;
	answer ?: string;
	submitted ?: boolean;
	/** 题目的编号 从 1 开始 是固定的 */
	sn ?: number;
	favorite ?: boolean;
}

interface IData {
	quizList : IQuiz[];
	dbName : string;
}

interface ICheckbox {
	id : string;
	selected : boolean;
	value : string;
	isCorrect : boolean;
}

interface IQuizHistory {
	quiz_count : number;
	answer_times : number;
	correct_times : number;
}

interface ITask {
	id : string;
	deadline : string;
	name : string;
	priority : number;
	duration : number;
}

interface IData {
	list : ITask[];
	[prop : string] : unknown;
}

enum ExerciseType {
	Common = 'Common',
	ErrCollection = 'ErrCollection',
	Favorite = 'Favorite',
}

interface IComment {
	id : string;

	quiz_id ?: string;

	commenter_id : string;
	commenter_name : string;
	commenter_url : string;

	content : string;
	exist : boolean;

	time : string;
	/** 只用于 UI 对应的数据上 */
	comment_list : IComment[];
}

interface ISettings {
	label : string;
	icon : string;
	id : string;
}

interface ICommenter {
	name : string;
	url : string;
	id : string;
}

// 下面两对象应该合并
const quizNameDic : Map<string, string> = new Map([
	['js', "阮一峰 JavaScript"],
	['es6', "阮一峰 ECMAScript"],
	['ts', "阮一峰 TypeScript"],
	['effective_ts', "Effective TypeScript"]]
)

const quizTypeArray = [
	{ value: 'js', label: "阮一峰 JavaScript" },
	{ value: 'es6', label: "阮一峰 ECMAScript 6" },
	{ value: 'ts', label: "阮一峰 TypeScript" },
	{ value: 'effective_ts', label: "Effective TypeScript" }
]

export {
	loginInfo_default,
	ICommenter,
	ISettings,
	IComment,
	ExerciseType,
	ITask,
	IQuizHistory,
	quizNameDic,
	quizTypeArray,
	IQuiz,
	IData,
	ICheckbox,
	logoImgUrl,
	qrCode,
	logoImgUrlDeep
}