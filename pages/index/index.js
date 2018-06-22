//index.js
//获取应用实例
const app = getApp()

Page({
    onLoad: function () {
        wx.showLoading({
            title: "加载中",
            mask: true
        });
        wx.login({
            success: res => {
                const self = this
                getApp().requestAPI("user/weChatLogin", {"token": res.code}, "POST", function(data) {
                    wx.hideLoading()
                    if(data.code === 200) {
                        wx.switchTab({
                            url: '/pages/school/blackboard'
                        })
                    } else {
                        wx.redirectTo({
                            url: '/pages/user/login'
                        })
                    }
                })
            }
        })
    }
})
