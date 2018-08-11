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
            success: function (res) {
                getApp().upload("about/ocr", res.tempFilePaths[0], (data)=>{
                    console.log(data)
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