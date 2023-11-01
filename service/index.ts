const getAllQuizs = async (dbName : string) => {
	const token = uni.getStorageSync('token');
	const data = { dbName, token }
	// console.log("getAllQuizs 入参", data);
	const rsp : any = await wx.cloud.callFunction({
		name: 'getAllQuiz',
		data
	});
	// console.log("getAllQuizs 返回", rsp);
	return rsp.result;
};

const getErrorCollectonQuiz = async (quiz_type : string) => {
	const token = uni.getStorageSync('token');
	const data = { quiz_type, token };
	// console.log("getErrorCollectonQuiz 入参", data);
	const rsp : any = await wx.cloud.callFunction({
		name: 'getErrorCollectonQuiz',
		data
	});
	// console.log("getErrorCollectonQuiz 返回", rsp);
	return rsp.result;
}

const getFavoriteQuiz = async (quiz_type : string) => {
	const token = uni.getStorageSync('token');
	const data = { quiz_type, token };
	// console.log("getFavoriteQuiz", { data });
	const rsp : any = await wx.cloud.callFunction({
		name: 'getFavoriteQuiz',
		data
	});
	return rsp.result;
}

const addOrUpdateCommenter = async (data : any) => {
	console.log('addOrUpdateCommenter', data);
	// 存入内存
	(getApp().globalData as any).loginInfo = data;
	// 存入数据库
	await wx.cloud.callFunction({
		name: 'addOrUpdateCommenter',
		data
	})
}

export { getAllQuizs, getErrorCollectonQuiz, addOrUpdateCommenter, getFavoriteQuiz }