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

export { generateUUID, showToast }