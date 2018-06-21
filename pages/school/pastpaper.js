Page({
    onLoad: function() {
        this.getToken()
    },
    getToken: function() {
        getApp().requestAPI("school/pastpaper/token", null, "GET", (data) => {
            console.log(data.data)
        })
    }
})