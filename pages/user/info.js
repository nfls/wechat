Page({
    data: {
        username: "加载中",
        email: "加载中",
        phone: "加载中",
        id: null,
        authorized: false
    },
    totp() {
        let otp = require('../../lib/otplib-browser.js')
        let token = wx.getStorageSync('CARD_TOKEN')
        if(token == null || token === "")
            return
        otp.authenticator.options = {
            step: 15,
            digits: 8
        }
        let barcode = require("../../lib/code/index.js")
        barcode.barcode("canvas", wx.getStorageSync('USER_ID') + " " + String(otp.authenticator.generate(token)), 600, 300)
    },
    onLoad: function() {
        let self = this
        getApp().requestAPI("user/current", null, "GET", (data)=> {
            self.setData({
                username: data.data.username,
                email: data.data.email || "未绑定",
                phone: data.data.phone || "未绑定",
                authorized: data.data.status
            })
            wx.setStorageSync('USER_ID', data["data"]["id"])
            getApp().requestAPI("user/card", null, "GET", (data) => {
                if(data["data"] == null)
                    return
                wx.setStorageSync('CARD_TOKEN', data["data"]["code"])
                this.setData({
                    id: setInterval(() => {this.totp()}, 1000)
                })
            })
        })
    },
    relogin() {
        wx.redirectTo({
            url: '/pages/index/index'
        })
    }
})