Page({
    data: {
        votes: []
    },
    onLoad() {

        if(wx.getSystemInfoSync()["platform"] === "ios") {
            getApp().requestAPI("lock", null, "GET", (data)=>{
                if (data === true) {
                    this.load()
                } else {
                    wx.showModal({
                        content: "iOS请使用App“NFLSIO”进行投票",
                        showCancel: false
                    })
                }

            })
        } else {
            this.load()
        }
    },
    load() {
        getApp().requestAPI("school/vote/list", null, "GET", (data) => {
            this.setData({
                votes: data["data"]
            })
        })
    }

})