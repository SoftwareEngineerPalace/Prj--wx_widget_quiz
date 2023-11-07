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
	console.log('addOrUpdateCommenter', data);
	// 存入内存
	(getApp().globalData as any).loginInfo = data;
	// 存入数据库
	await wx.cloud.callFunction({
		name: 'addOrUpdateCommenter',
		data
	})
}

export { getAllQuiz, getErrorCollectonQuiz, addOrUpdateCommenter, getFavoriteQuiz }