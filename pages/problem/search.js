Page({
    data: {
        types: ["所有课程", "IGCSE","A-Level","IBDP"],
        courses: [],
        lists: [],
        type: 0,
        course: null,
        multipleChoice: true,
        shortResponse: true,
        precise: false,
        text: ""
    },
    onLoad() {
        this.list()
    },
    search() {
        let isMultipleChoice = null;
        if (this.data.multipleChoice && !this.data.shortResponse)
            isMultipleChoice = true;
        else if (!this.data.multipleChoice && this.data.shortResponse)
            isMultipleChoice = false;
        else if (!this.data.multipleChoice && !this.data.shortResponse) {
            this.setData({
                multipleChoice: true,
                shortResponse: true
            })
        }
        let type = parseInt(this.data["type"])
        let course = null
        if (type !== 0) {
            course = this.lists.filter((object)=>{
                return object.type === parseInt(this.data.type)
            })[parseInt(this.data["course"])]["id"]
        }
        let data = {
            "course": course,
            "text": this.data.text,
            "precise": this.data.precise,
            "isMultipleChoice": isMultipleChoice,
            "page": 1,
            "size": 10
        }
        wx.navigateTo({
            url: '/pages/problem/detail?query=' + encodeURIComponent(JSON.stringify(data))
        })
    },

    bindChange(e) {
        let data = {}
        data[e.currentTarget.id] = e.detail.value
        this.setData(data)
        if(e.currentTarget.id === "type") {
            this.filter()
        }
        console.log(this.data)
    },
    filter() {
        this.setData({
            courses: this.lists.filter((object) => {
                return object.type === parseInt(this.data.type)
            }).map((object)=>{
                return object.name + "(" + object.remark + ")"
            })
        })
    },
    image() {


        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: (res) => {
                wx.navigateTo({url: "/pages/image/index?src="+encodeURIComponent(res.tempFilePaths[0])})
                /*
                wx.showLoading({
                    title: '加载中',
                })
               */
            }
        })

    },
    list() {
        getApp().requestWaterAPI("course/all", null, "GET", (data)=>{
            this.lists = data["data"]
        })
    },
    onShow() {
        if (typeof getApp().params === "string") {
            this.setData({
                text: getApp().params
            })
            getApp().params = null
        }
    }
})