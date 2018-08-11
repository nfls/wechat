Page({
    data: {
        types: ["All", "IGCSE","A-Level","IBDP"],
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
        let data = {
            "text": this.data.text,
            "precise": this.data.precise,
            "isMultipleChoice": isMultipleChoice,
            "course": null,
            "page": 1,
            "size": 10
        }
        getApp().requestWaterAPI("problem/search", data, "POST", (data)=>{
            console.log(data)
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
                wx.showLoading({
                    title: '加载中',
                })
                getApp().upload("about/ocr", res.tempFilePaths[0], (data)=>{
                    this.setData({
                        text: JSON.parse(data)["data"]
                    })
                    wx.hideLoading()
                })
            }
        })
    },
    list() {
        getApp().requestWaterAPI("course/all", null, "GET", (data)=>{
            this.lists = data["data"]
        })
    }
})