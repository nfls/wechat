Page({
    data: {
        votes: []
    },
    onLoad() {
        console.log(wx.getSystemInfoSync())
        if(wx.getSystemInfoSync()["platform"] === "ios") {
            wx.showModal({
                content: "iOS请使用App“NFLS.IO”进行投票",
                showCancel: false
            })
        } else {
            getApp().requestAPI("school/vote/list", null, "GET", (data) => {
                this.setData({
                    votes: data["data"]
                })
            })
        }

    }

})