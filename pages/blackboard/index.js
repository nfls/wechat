const wxParse = require('../../lib/wxParse/wxParse.js');
const moment = require('../../lib/moment-with-locales.min');

Page({
    data: {
        classes: [],
        clazIndex: 0,
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
        getApp().requestAPI("school/blackboard/detail?id=8952c04f-1e2f-45bd-be3a-d3d4b1f1b621"/* + this.data.clazInfo[this.data.clazIndex].id*/, null, "GET", (data) => {
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
    }
})