import { camelToUnderline, underlineToCamel } from '../common/utils'
const getAllQuiz = async (quiz_type : string) => {
	const token = uni.getStorageSync('token');
	const rsp : any = await wx.cloud.callFunction({
		name: 'getAllQuiz',
		data: { quiz_type, token }
	});
	return rsp.result.list;
};

const getErrorCollectonQuiz = async (quiz_type : string) => {
	const token = uni.getStorageSync('token');
	const data = { quiz_type, token };
	const rsp : any = await wx.cloud.callFunction({
		name: 'getErrorCollectonQuiz',
		data
	});
	return rsp.result;
}

const getFavoriteQuiz = async (quiz_type : string) => {
	const token = uni.getStorageSync('token');
	const data = { quiz_type, token };
	const rsp : any = await wx.cloud.callFunction({
		name: 'getFavoriteQuiz',
		data
	});
	return rsp.result;
}

const addOrUpdateCommenter = async (data : any) => {
	// 存入内存
	(getApp().globalData as any).loginInfo = data;
	// 存入数据库
	await wx.cloud.callFunction({
		name: 'addOrUpdateCommenter',
		data
	})
}

const progressPostOrPut = async (quizType : string, latestQuizSn : number) => {
	const token = uni.getStorageSync('token');
	const raw = { quizType, token, latestQuizSn };
	const data = camelToUnderline(raw);
	// console.log('progressPostOrPut 入参', data);
	const rsp : any = await wx.cloud.callFunction({
		name: 'progressPostOrPut',
		data
	});
	return rsp.result;
}

const getReceivedLike = async (quiz_type : string) => {
	const token = uni.getStorageSync('token');
	const rsp : any = await wx.cloud.callFunction({
		name: 'likeReceivedGet',
		data: { token }
	});
	// console.log("getReceivedLike rsp", rsp);
	return rsp.result;
};

const getQuizById = async (quizType : string, quizId : string) => {
	const token = uni.getStorageSync('token');
	const data = { quizType, quizId, token };
	const rsp : any = await wx.cloud.callFunction({
		name: 'quizGet',
		data
	});
	console.log("getQuizById rsp", rsp.result?.list?.[0]);
	return rsp.result?.list?.[0];
};

export { getQuizById, progressPostOrPut, getAllQuiz, getErrorCollectonQuiz, addOrUpdateCommenter, getFavoriteQuiz, getReceivedLike }