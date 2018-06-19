//index.js
//获取应用实例
const app = getApp()

Page({
    data: {
        "info": "加载中，咕咕咕"
    },
    onLoad: function () {
        wx.login({
            success: res => {
                const self = this
                getApp().requestAPI("user/weChatLogin", {"token": res.code}, "POST", function(data) {
                    if(data.code === 200) {
                        wx.redirectTo({
                            url: '/pages/blackboard/index'
                        })
                    } else {
                        wx.redirectTo({
                            url: '/pages/index/login'
                        })
                    }
                    console.log(data)

                })

            }
        })
    }
})
