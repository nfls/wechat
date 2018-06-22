//app.js
App({
    onLaunch: function () {
    },
    globalData: {
        userInfo: null
    },
    requestAPI: function(path, data, method, success) {
        var cookie = ""
        let value = wx.getStorageSync('PHPSESSID')
        if (value) {
            cookie = "PHPSESSID="+value+";"
        } else {
            cookie = ""
        }

        wx.request({
            url: "https://nfls.io/" + path,
            data: data,
            method: method,
            header: {
                "Cookie" : cookie
            },
            success: function (res) {
                if(res.code === 504) {
                    this.requestAPI(path, data, method, success)
                } else {
                    if(res.header["Set-Cookie"]) {
                        var cookie = res.header["Set-Cookie"].split(";")[0].split("=")[1]
                        wx.setStorageSync("PHPSESSID", cookie)
                    }
                    success(res.data)
                }
            }
        })
    }
})