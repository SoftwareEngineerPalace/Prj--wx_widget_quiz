const generateUUID = () => {
	let d = new Date().getTime();
	const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		const r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
	return uuid;
}

const showToast = (self : any, message : string) => {
	(self.$refs.uToast as any).show({
		type: 'success',
		icon: false,
		message,
	});
}

const quizNameDic = {
	'js': "JavaScript",
	'es6': "ECMAScript 6",
	'ts': "TypeScript"
}

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

export { generateUUID, showToast, quizNameDic, checkSession, quizTypeArray }