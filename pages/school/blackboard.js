const wxParse = require('../../lib/wxParse/wxParse.js');
const moment = require('../../lib/moment-with-locales.min');

Page({
    data: {
        id: null,
        datail: null,
        list: [],
        mdList: []
    },
    onLoad(options) {
        console.log(options)
        this.setData({
            id: options.id
        })
        this.detail()

    },
    detail() {
        getApp().requestWaterAPI("blackboard/detail?id=" + this.data.id, null, "GET", (data) => {
            let detail = data["data"]
            this.setData({
                "detail": detail
            })
            wxParse.wxParse("announcement", "md", this.data.detail.announcement, this, 5)
            wxParse.wxParse("teacher", "html", this.data.detail.teachers[0].htmlUsername, this, 5)
            this.list()
        })
    },
    list() {
        getApp().requestWaterAPI("notice/list?id=" + this.data.id, null, "GET", (data) => {
            let list = data["data"].map((object)=>{
                object.time = moment(object.time).format("lll")
                if(object.deadline)
                    object.deadline = moment(object.deadline).format("lll")
                return object
            })
            this.setData({
                list: list
            })
            list.forEach((object, index)=>{
                wxParse.wxParse("mdList."+index, "md", object.content, this, 5)
            })
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
    }
})