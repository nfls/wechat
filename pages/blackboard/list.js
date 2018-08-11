Page({
    data: {
        blackboards: []
    },
    onLoad() {
        getApp().requestWaterAPI("blackboard/list", null, "GET", (data)=>{
            this.setData({
                blackboards: data["data"]
            })
        })
    }
})