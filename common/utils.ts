import { IComment } from "./common";

const generateUUID = () => {
	let d = new Date().getTime();
	const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		const r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
	return uuid;
}

/** 格式化时间 */
const formatTime = (totalMinutes : number) => {
	let hours = Math.floor(totalMinutes / 60);
	if (hours >= 24) {
		hours = hours % 24;
	}
	const houreStr = `${hours > 9 ? hours : "0" + hours}`;
	const minutes = totalMinutes % 60;
	if (minutes === 0) return `${houreStr}:00`;
	if (minutes !== 0)
		return `${houreStr}:${minutes > 9 ? minutes : "0" + minutes}`;
};

const showToast = (toast : any, message : string) => {
	toast.show({
		type: 'success',
		icon: false,
		message,
	});
}


const checkSession = () => {
	return new Promise((resolve : Function) => {
		uni.checkSession({
			success() {
				resolve(true);
			},
			fail() {
				resolve(false);
			}
		})
	});
}

const getOpenId = () => {
	return new Promise((resolved) => {
		uni.showLoading({
			title: '加载中',
		});
		uni.login({
			provider: 'weixin',
			success: async (rsp : any) => {
				// 第二步 登录微信获取 code
				// console.log('uni.login rsp', rsp);
				const { code } = rsp;
				// console.log("uni.login", { code });
				if (rsp.errMsg !== 'login:ok') return;

				// 第三步 用 code 获取 token 和 user_openid
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

				// 第四步 用户数据存入数据库

				resolved({ id: openid });
				uni.hideLoading()
			}
		});
	})
};

const findComment = (comments : IComment[], targetId : string) => {
	for (let i = 0, len = comments.length; i < len; i++) {
		return preOrder(comments[i], targetId);
	}
}

const preOrder = (comment : IComment, targetId : string) => {
	if (!comment) {
		return null;
	}
	console.log('comment.id === targetId', comment.id === targetId)
	if (comment.id === targetId) {
		return comment;
	}
	console.log('preOrder', comment)
	let len = comment.comment_list.length;
	for (let i = 0; i < len; i++) {
		return preOrder(comment.comment_list[i], targetId);
	}
}

export {
	findComment,
	getOpenId,
	ExerciseType,
	generateUUID,
	showToast,
	quizNameDic,
	checkSession,
	quizTypeArray,
	formatTime,
}