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
                    if(data["code"] === 200) {
                        getApp().requestWaterAPI("user/login", null, "GET", (data)=>{
                            if(data["data"] === "/#/login?reason=permission") {
                                wx.hideLoading()
                                wx.showModal({
                                    content: "您的账户没有绑定邮箱或手机，或尚未完成实名认证，“资源”及“黑板”功能将不可用，请尽快前往网页版完成。",
                                    showCancel: false,
                                    success: (res) => {
                                        wx.switchTab({
                                            url: '/pages/user/info'
                                        })
                                    }
                                });
                            } else {
                                wx.hideLoading()
                                wx.switchTab({
                                    url: '/pages/blackboard/list'
                                })
                            }
                        })
                    } else {
                        wx.hideLoading()
                        wx.redirectTo({
                            url: '/pages/user/login'
                        })
                    }

                })
            }
        })
    }
})
