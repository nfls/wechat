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
                            wx.hideLoading()
                            wx.switchTab({
                                url: '/pages/school/search'
                            })
                        })
                    }

                })
            }
        })
    }
})
