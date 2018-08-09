//app.js
App({
    onLaunch: function () {
    },
    globalData: {
        userInfo: null
    },
    requestAPI: function(path, data, method, success) {
        let cookie = ""
        let value = wx.getStorageSync('PHPSESSID_MAIN')
        if (value) { cookie = "PHPSESSID="+value+";" }

        wx.request({
            url: "https://nfls.io/" + path,
            data: data,
            method: method,
            header: {
                "Cookie" : cookie,
                "Client" : "weChat"
            },
            success (res) {
                if(res.code === 504) {
                    this.requestAPI(path, data, method, success)
                } else {
                    if(res.header["Set-Cookie"]) {
                        let cookie = res.header["Set-Cookie"].split(";")[0].split("=")[1]
                        wx.setStorageSync("PHPSESSID_MAIN", cookie)
                    }
                    if(res.data["code"] === 307 && res.data["data"].startsWith("https")) {
                        getApp().handleRedirect(res.data["data"], success)
                    } else {
                        success(res.data)
                    }
                }
            }
        })
    },
    requestWaterAPI(path, data, method, success) {
        let cookie = ""
        let value = wx.getStorageSync('PHPSESSID_WATER')
        if (value) {
            cookie = "PHPSESSID="+value+";"
        }

        wx.request({
            url: "https://water.nfls.io/" + path,
            data: data,
            method: method,
            header: {
                "Cookie" : cookie,
                "Client" : "weChat"
            },
            success(res) {
                if(res.code === 504) {
                    this.requestAPI(path, data, method, success)
                } else {
                    if(res.header["Set-Cookie"]) {
                        let cookie = res.header["Set-Cookie"].split(";")[0].split("=")[1]
                        wx.setStorageSync("PHPSESSID_WATER", cookie)
                    }
                    if(res.data["code"] === 307 && res.data["data"].startsWith("https")) {
                        getApp().handleRedirect(res.data["data"], success)
                    } else {
                        success(res.data)
                    }
                }
            }
        })
    },
    handleRedirect(url, success) {
        if(url.startsWith("https://nfls.io")) {
            getApp().requestAPI(url.replace("https://nfls.io/", ""), null, "GET", success)
        } else if (url.startsWith("https://water.nfls.io")) {
            getApp().requestWaterAPI(url.replace("https://water.nfls.io/", ""), null, "GET", success)
        }
    }
})