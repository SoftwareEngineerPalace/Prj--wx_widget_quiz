const startLogin = () => {
	return new Promise((resolved) => {
		uni.showLoading({
			title: '加载中',
		});
		uni.getUserProfile({
			desc: '登录后可同步数据',
			success: async (value) => {

				// 第一步 获取到昵称和头像
				const { nickName, avatarUrl } = value.userInfo;
				uni.login({
					provider: 'weixin',
					success: async (rsp : any) => {
						// 第二步 登录微信获取 code
						// console.log('uni.login rsp', rsp);
						const { code } = rsp;
						// console.log("uni.login", { code });
						if (rsp.errMsg !== 'login:ok') return;

						// 第三步 用 code 获取 token 和 user_openid
						const data = { code, nickName, avatarUrl };
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
						const commenter = { id: openid, commenter_name: nickName, avatar_url: avatarUrl };
						await wx.cloud.callFunction({
							name: 'addCommenter',
							data: { ...commenter }
						})
						resolved({ nickName, avatarUrl, openid });
					}
				});
			},
			fail: () => {
				uni.showToast({
					title: '授权已取消',
					icon: 'error',
					mask: true,
				});
			},
			complete: () => {
				// 隐藏loading
				uni.hideLoading();
			},
		});
	})
};

const getProfile = () => {
	uni.getUserProfile({
		desc: '登录后可同步数据',
		success: async (value) => {
			// 第一步 获取到昵称和头像
			const { nickName, avatarUrl } = value.userInfo;
			resolved({ nickName, avatarUrl });
		},
		fail: (value) => {
			console.log('fail', value);
			uni.showToast({
				title: '失败',
				icon: 'error',
				mask: true,
			});
		},
		complete: () => {
			// 隐藏loading
			uni.hideLoading();
		},
	});
}

export { startLogin, getProfile }