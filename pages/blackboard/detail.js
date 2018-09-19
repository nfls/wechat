const wxParse = require('../../lib/wxParse/wxParse.js');
const moment = require('../../lib/moment-with-locales.min');

Page({
    data: {
        id: null,
        detail: null,
        list: [],
        mdList: []
    },
    onLoad(options) {
        //console.log(options)
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
                object.time = moment(object.time).format("MM-DD HH:mm")
                if(object.deadline)
                    object.deadline = moment(object.deadline).format("MM-DD HH:mm")
                return object
            })
            this.setData({
                list: list
            })
        })
    },
    preview(e) {
        let noticeId = e.currentTarget.dataset.noticeid
        let fileId = e.currentTarget.dataset.fileid
        getApp().download("notice/download?id="+this.data.id+"&noticeId="+noticeId+"&fileId="+fileId, (res)=>{
            wx.openDocument({
                filePath: res.tempFilePath
            })
        })
    }
})