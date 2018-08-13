Page({
    data: {
        problems: []
    },
    onLoad(e) {
        let data = JSON.parse(decodeURIComponent(e.query))
        getApp().requestWaterAPI("problem/search", data, "POST", (data)=>{
            let result = data["data"]["result"].map((object)=>{
                return {
                    images: this.iterateMasterProblem(object).concat(this.iterateSubProblems(object["subProblems"])),
                    paper: object["paper"]["course"]["name"] + "(" + object["paper"]["course"]["remark"] + ") " + object["paper"]["session"] + "/" + object["paper"]["paper"] + object["paper"]["timezone"]
                }
            })
            this.setData({
                problems: result
            })
            console.log(result)
        })
    },
    zoom(e) {
        let src = e.currentTarget.dataset.url;
        wx.previewImage({
            urls: [src]
        })
    },
    iterateSubProblems(problems) {
        if(problems.length === 0)
            return []
        return [{
            "contentImageUrl": problems[0]["contentImageUrl"],
            "markSchemeImageUrl": problems[0]["markSchemeImageUrl"]
        }].concat(this.iterateSubProblems(problems[0]["subProblems"]))
    },
    iterateMasterProblem(problem) {
        if(problem == null)
            return []

        let result = this.iterateMasterProblem(problem["masterProblem"])
        result.push({
            "contentImageUrl": problem["contentImageUrl"],
            "markSchemeImageUrl": problem["markSchemeImageUrl"]
        })
        return result
    }
})