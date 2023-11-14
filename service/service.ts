import { camelToUnderline, underlineToCamel } from '../common/utils'
const getQuizListByType = async (quiz_type : string) => {
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

const getRankingList = async (quizType : string) => {
	const token = uni.getStorageSync('token');
	const data = {
		name: 'getQuizHistory',
		data: { token, quiz_type: quizType }
	};
	let { result: list } = await wx.cloud.callFunction(data);
	return list;
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
	// console.log("getQuizById rsp", rsp.result?.list?.[0]);
	return rsp.result?.list?.[0];
};

const deleteQuizByTypeAndUserId = async (quizType : string, userOpenId : string) => {
	const data = camelToUnderline({ quizType, userOpenId });
	const rsp : any = await wx.cloud.callFunction({
		name: 'quizDelete',
		data
	});
	console.log("deleteQuizByTypeAndUserId rsp", rsp);
	return rsp;
};

const getOpenId = () => {
	return new Promise((resolved) => {
		uni.showLoading({
			title: '加载中',
		});
		uni.login({
			provider: 'weixin',
			success: async (rsp : any) => {
				// 第 1 步 登录微信获取 code
				// console.log('uni.login rsp', rsp);
				const { code } = rsp;
				// console.log("uni.login", { code });
				if (rsp.errMsg !== 'login:ok') return;

				// 第 2 步 用 code 获取 token 和 user_openid
				const data = { code };
				// console.log("applet call login", data)
				const rsp_login : any = await wx.cloud.callFunction({
					name: 'login',
					data
				});
				// console.log("applet call login callback", rsp_login)
				const { token, openid } = rsp_login.result;
				if (rsp_login.result.status !== 200) return;
				uni.setStorageSync('token', token);

				resolved({ id: openid });
				uni.hideLoading()
			}
		});
	})
};

export { getOpenId, deleteQuizByTypeAndUserId, getRankingList, getQuizById, progressPostOrPut, getQuizListByType, getErrorCollectonQuiz, addOrUpdateCommenter, getFavoriteQuiz, getReceivedLike }