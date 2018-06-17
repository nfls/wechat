//index.js
//获取应用实例
const app = getApp()

Page({
    data: {
    },
    onLoad: function () {
        wx.login({
            success: res => {
                const self = this
                this.requestAPI("user/weChatLogin", {"token": res.code}, "POST", function(data) {
                    if(data.code === 200) {
                        self.requestAPI("user/current", null, "GET", function(data) {
                            console.log(data)
                        })
                    } else {
                        wx.navigateTo({
                            url: '/page/index/login'
                        })
                    }
                    console.log(data)

                })

            }
        })

    }

})
