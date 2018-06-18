Page({
    data: {
        username: "加载中",
        email: "加载中",
        phone: "加载中"
    },
    onLoad: function() {
        var self = this
        getApp().requestAPI("user/current", null, "GET", function(data) {
            self.setData({
                username: data.data.username,
                email: data.data.email || "未绑定",
                phone: data.data.phone || "未绑定"
            })
        })
    }
})