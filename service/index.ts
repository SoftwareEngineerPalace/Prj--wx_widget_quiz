const getAllQuizs = async (dbName : string) => {
	const rsp : any = await wx.cloud.callFunction({
		name: 'getAllQuiz',
		data: { dbName }
	});
	return rsp.result.data;
};

const getErrorCollectonQuiz = async (quiz_type : string) => {
	const token = uni.getStorageSync('token');
	const data = { quiz_type, token };
	console.log("getErrorCollectonQuiz", { data });
	const rsp : any = await wx.cloud.callFunction({
		name: 'getErrorCollectonQuiz',
		data
	});
	return rsp.result.data;
}

export { getAllQuizs, getErrorCollectonQuiz }