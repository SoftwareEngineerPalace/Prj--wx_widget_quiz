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

export { getOpenId }