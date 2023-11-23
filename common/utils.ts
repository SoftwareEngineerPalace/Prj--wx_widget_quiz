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

const waiting = () => {
	uni.showToast({
		title: "暂未开放",
		duration: 1000,
		icon: "none",
	})
}

const plsLogin = () => {
	uni.showToast({
		title: "请先登录",
		icon: "none",
		duration: 1000
	})
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
		icon: "none",
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

/** 下面2个方法应该优化下 */
const findCommentById = (comments : IComment[], targetId : string) => {
	for (let i = 0, len = comments.length; i < len; i++) {
		const target = preOrder(comments[i], targetId);
		if (target) {
			return target;
		}
	}
}

/** 这遍历写得不够好 */
const preOrder = (comment : IComment, targetId : string) => {
	// console.log('preOrder comment.id=', comment.id, 'targetId=', targetId);
	if (!comment) {
		return null;
	}
	// console.log('comment.id === targetId', comment.id === targetId)
	if (comment.id === targetId) {
		return comment;
	}
	// console.log('preOrder comment', comment)
	let len = comment.comment_list?.length || 0;
	// console.log('preOrder len', len)
	for (let i = 0; i < len; i++) {
		return preOrder(comment.comment_list[i], targetId);
	}
}

/** 把 name 和 url 赋到 commenter_name 和 commenter_url 上 */
const addCommenterParam = (comments : any[]) => {
	comments.forEach(cmt => {
		traversal(cmt)
	})
}

const traversal = (comment : IComment) => {
	comment.commenter_name = comment.name;
	comment.commenter_url = comment.url;
	if (comment?.comment_list?.length > 0) {
		comment.comment_list.forEach(cmt => {
			traversal(cmt)
		})
	}
}

const underlineToCamel = (underline : unknown) => {
	const list = Object.keys(underline).map((v : string) => {
		const key = v.split('_').map((str : string, index : number) => index === 0 ? str : str.charAt(0).toUpperCase() + str.slice(1)).join('');
		return [key, underline[v]];
	})
	const result = Object.fromEntries(list);
	return result;
}

const camelToUnderline = (camel : unknown) => {
	const list = Object.keys(camel).map((v : string) => {
		const key = v.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`).toLowerCase()
		return [key, camel[v]];
	})
	const result = Object.fromEntries(list);
	return result;
}

export {
	camelToUnderline,
	underlineToCamel,
	convertUnderlineToCamelCase,
	addCommenterParam,
	findCommentById,
	ExerciseType,
	generateUUID,
	showToast,
	checkSession,
	quizTypeArray,
	formatTime,
	waiting,
	plsLogin
}