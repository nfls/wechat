Page({
    data: {
        username: "",
        password: ""
    },
    login: function () {
        getApp().requestAPI("user/login", this.data, "POST", function(data) {
            if(data.code !== 200) {
                wx.showModal({
                    content: data.data || "用户名或密码错误",
                    showCancel: false
                });
            } else {
                wx.login({
                    success: res => {
                        getApp().requestAPI("user/weChat", {"token": res.code}, "POST", function(data) {
                            if(data.code === 200) {
                                wx.redirectTo({
                                    url: '/pages/index/index'
                                })
                            } else {
                                wx.showModal({
                                    content: "未知错误发生，请重试",
                                    showCancel: false
                                });
                            }
                        })
                    }
                });
            }
        })
    },
    bindUsernameInput: function(e) {
        this.setData({
            username: e.detail.value
        })
    },
    bindPasswordInput: function(e) {
        this.setData({
            password: e.detail.value
        })
    }
})