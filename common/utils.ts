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

const showToast = (self : any, message : string) => {
	(self.$refs.uToast as any).show({
		type: 'success',
		icon: false,
		message,
	});
}

const quizNameDic : Map<string, string> = new Map([
	['js', "JavaScript"],
	['es6', "ECMAScript 6"],
	['ts', "TypeScript"]]
)

const quizTypeArray = [{ value: 'js', label: "JavaScript" },
{ value: 'es6', label: "ECMAScript 6" },
{ value: 'ts', label: "TypeScript" }]

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

export { generateUUID, showToast, quizNameDic, checkSession, quizTypeArray, formatTime}