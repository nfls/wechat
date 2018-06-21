const wxParse = require('../../lib/wxParse/wxParse.js');
const moment = require('../../lib/moment-with-locales.min');

Page({
    data: {
        classes: [],
        clazIndex: 1,
        clazInfo: [],
        datail: [],
        teacher: []
    },
    onLoad: function() {
        this.list()
    },
    list: function () {
        const that = this
        getApp().requestAPI("school/blackboard/list", null, "GET", (data) => {
            that.setData({
                classes: data.data.map((claz) => {
                    return claz["title"]
                }),
                clazInfo: data.data
            })
            this.detail()
        })
    },
    detail: function() {
        const that = this
        getApp().requestAPI("school/blackboard/detail?id=" + this.data.clazInfo[this.data.clazIndex].id, null, "GET", (data) => {
            var d = data.data
            d.notices = d.notices.map( (data) => {
                data.time = moment(data.time).format("LLL")
                if(data.deadline) {
                    data.deadline = moment(data.deadline).format("LLL")
                }
                return data
            })
            that.setData({
                detail: d
            })
            wxParse.wxParse("announcement", "md", that.data.detail.announcement, that, 5)
            wxParse.wxParse("teacher", "html", that.data.detail.teacher.htmlUsername, that, 5)
        })
    },
    preview: function(e) {
        let url = e.currentTarget.dataset.name
        wx.downloadFile({
            url: url,
            success: (result) => {
                wx.openDocument({
                    filePath: result.tempFilePath
                })
            }
        })
    },
    bindClazChange: function(e) {
        this.setData({
            clazIndex: e.detail.value
        })
        this.detail()
    }
})