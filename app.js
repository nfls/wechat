//app.js
App({
    onLaunch: function () {
    },
    globalData: {
        userInfo: null
    },
    download(path, success) {
        wx.downloadFile({
            url: "https://water.nfls.io/" + path,
            header: {
                "Cookie": this.getWaterCookie(),
                "Client": "weChat"
            },
            success: res => {
                success(res)
            }
        })
    },
    upload(path, file, success) {
        wx.uploadFile({
            url: "https://water.nfls.io/" + path,
            header: {
                "Cookie": this.getWaterCookie(),
                "Client": "weChat"
            },
            filePath: file,
            name: 'image',
            success: res => {
                console.log(res.data)
                success(res.data)
            }
        })
    },
    requestAPI: function (path, data, method, success) {
        let cookie = ""
        let value = wx.getStorageSync('PHPSESSID_MAIN')
        if (value) {
            cookie = "PHPSESSID=" + value + ";"
        }
        wx.request({
            url: "https://nfls.io/" + path,
            data: data,
            method: method,
            header: {
                "Cookie": cookie,
                "Client": "weChat"
            },
            success:(res)=>{
                if (res.code === 504) {
                    this.requestAPI(path, data, method, success)
                } else {
                    if (res.header["Set-Cookie"]) {
                        let cookie = res.header["Set-Cookie"].split(";")[0].split("=")[1]
                        wx.setStorageSync("PHPSESSID_MAIN", cookie)
                    }
                    if (res.data["code"] === 307 && res.data["data"].startsWith("https")) {
                        getApp().handleRedirect(res.data["data"], success)
                    } else {
                        success(res.data)
                    }
                }
            }
        })
    },
    requestWaterAPI(path, data, method, success) {
        wx.request({
            url: "https://water.nfls.io/" + path,
            data: data,
            method: method,
            header: {
                "Cookie": this.getWaterCookie(),
                "Client": "weChat"
            },
            success: (res)=>{
                if (res.code === 504) {
                    this.requestAPI(path, data, method, success)
                } else {
                    this.setWaterCookie(res)
                    if (res.data["code"] === 307 && res.data["data"].startsWith("https")) {
                        getApp().handleRedirect(res.data["data"], success)
                    } else {
                        success(res.data)
                    }
                }
            }
        })
    },
    handleRedirect(url, success) {
        if (url.startsWith("https://nfls.io")) {
            getApp().requestAPI(url.replace("https://nfls.io/", ""), null, "GET", success)
        } else if (url.startsWith("https://water.nfls.io")) {
            getApp().requestWaterAPI(url.replace("https://water.nfls.io/", ""), null, "GET", success)
        }
    },
    setWaterCookie(res) {
        if (res.header["Set-Cookie"]) {
            let cookie = res.header["Set-Cookie"].split(";")[0].split("=")[1]
            wx.setStorageSync("PHPSESSID_WATER", cookie)
        }
        if (res.data["cookie"] != null && res.data["cookie"]["remember_token"] != null) {
            wx.setStorageSync("TOKEN_WATER", res.data["cookie"]["remember_token"])
        }
    },
    getWaterCookie() {
        let cookie = ""
        let token = wx.getStorageSync('TOKEN_WATER')
        if (token) {
            cookie += "remember_token=" + encodeURIComponent(token) + ";"
        }
        let session = wx.getStorageSync('PHPSESSID_WATER')
        if (session) {
            cookie += "PHPSESSID=" + encodeURIComponent(session) + ";"
        }
        return cookie
    }
})