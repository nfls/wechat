Page({
    data: {
        detail: null,
        options: [],
        id: null,
        password: "",
        code: 0
    },
    onLoad(options) {
        this.load(options.id)
    },
    load(id) {
        this.setData({
            id: id
        })
        getApp().requestAPI("school/vote/detail?id="+id, null, "GET", (data)=>{
            this.setData({
                detail: data["data"]
            })
            let options = []
            while(options.length < data["data"]["options"].length) {
                options.push(NaN);
            }
            this.setData({
                options: options
            })
            this.test()
        })
    },
    radioChange(data){
        let options = this.data.options
        options[parseInt(data.currentTarget["id"])] = parseInt(data.detail["value"])
        this.setData({
            options: options
        })
    },
    bindPasswordInput: function(e) {
        this.setData({
            password: e.detail.value
        })
    },
    test() {
        getApp().requestAPI("school/vote/vote", {
            id: this.data.id
        }, "POST", (res)=>{
            this.setData({
                code: res["code"]
            })
        })
    },
    submit() {
        wx.showLoading({
            title: "加载中",
            mask: true
        });
        let info = wx.getSystemInfoSync()
        getApp().requestAPI("school/vote/vote", {
            id: this.data.id,
            choices: this.data.options,
            password: this.data.password,
            clientId: JSON.stringify(info)
        }, "POST", (res)=>{
            let content = ""
            if(res["code"] !== 200) {
                content = res["data"]
            } else {
                content = "您已投票成功，查询码为：" + res["data"]["code"] + "。该查询码可用于查询自己的投票信息。请注意保护好该查询码，不要告诉他人。"
            }
            this.test()
            wx.hideLoading()

            wx.showModal({
                content: content,
                showCancel: false
            });
        })
    }
})