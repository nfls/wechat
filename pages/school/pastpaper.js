Page({
    temps: [],
    path: [],
    data: {
        displayItems: [],
        path: ""
    },
    onLoad: function() {
        this.getToken()
    },
    getToken: function() {
        const that = this
        getApp().requestAPI("school/pastpaper/token", null, "GET", (data) => {
            that.OSSRequest(data.data.AccessKeyId, data.data.AccessKeySecret, data.data.SecurityToken, "")
        })
    },
    getCurrentPath: function () {
        let reducer = (accumulator, currentValue) => accumulator + "/" + currentValue;
        var uri = this.path.reduce(reducer, "") + "/"
        if (uri.startsWith("/"))
            uri = uri.slice(1)
        this.setData({
            path: uri
        })
        return uri
    },
    click: function(e) {
        let file = e.currentTarget.dataset.file
        console.log(file)
        if(file.size === 0) {
            this.path.push(file.name)
            this.list()
        } else {

        }
    },
    list: function() {
        console.log(this.path)
        let items = wx.getStorageSync('pastpaper_list');
        const self = this
        let displayItems = items.filter((object) => {
            if (object.key.endsWith("/")) {
                return object.key.split("/").length - 1 === self.path.length + 1 && object.key.startsWith(self.getCurrentPath())
            } else {
                return object.key.split("/").length === self.path.length + 1 && object.key.startsWith(self.getCurrentPath())
            }
        }).map((object) => {
            object.name = object.key.replace(self.getCurrentPath(), "").replace("/", "")
            object.readableSize = this.getSize(object.size)
            return object
        })
        this.setData({
            displayItems: displayItems
        })
    },
    OSSRequest: function(accessKeyId, accessKeySecret, securityKeyToken, nextMarker) {
        const time = new Date().toUTCString()
        wx.request({
            url:"https://nfls-papers.oss-cn-shanghai.aliyuncs.com",
            data: {
                "max-keys": 1000,
                "marker": nextMarker
            },
            header: {
                "Authorization": this.getAuthorization(accessKeyId, accessKeySecret, securityKeyToken, time),
                "X-OSS-Security-Token": securityKeyToken,
                "X-OSS-Date": time
            },
            success:res=>{
                let XMLParser = new Parser.DOMParser()
                let response = XMLParser.parseFromString(res.data)
                var nextMarker = ""
                if(response.getElementsByTagName("NextMarker").length > 0) {
                    nextMarker = response.getElementsByTagName("NextMarker")[0].firstChild.data
                } else {
                    nextMarker = null
                }
                let contents = response.getElementsByTagName("Contents")
                for(var i=0; i<contents.length; i++) {
                    let current = contents[i].childNodes
                    let item = {}
                    item.key = current[1].firstChild.data
                    item.lastModified = current[3].firstChild.data
                    item.eTag = current[5].firstChild.data
                    item.size = parseInt(current[9].firstChild.data)
                    this.temps.push(item)
                }
                if(nextMarker && false) {
                    this.OSSRequest(accessKeyId, accessKeySecret, securityKeyToken, nextMarker)
                } else {
                    wx.setStorageSync('pastpaper_list', this.temps);
                    this.temps = []
                    this.list()
                }
            }
        })
    },
    getAuthorization: function(accessKeyId, accessKeySecret, securityToken, time) {
        let message = "GET" + "\n" +
            "\n" +
            "application/json\n" +
            (new Date().toUTCString()) + "\n" +
            "x-oss-date:" + time + "\n" +
            "x-oss-security-token:" + securityToken + "\n" +
            "/nfls-papers/"
        let signature = b64_hmac_sha1(accessKeySecret, message)
        return "OSS " + accessKeyId + ":" + signature
    },
    getSize: function(size) {
        if(size === 0)
            return "文件夹"
        size = size / 1024
        var count = 0
        while(size > 1024) {
            size = size / 1024
            count ++
        }
        var quantity = ""
        switch(count){
            case 0:
                quantity = "KB"
                break
            case 1:
                quantity = "MB"
                break
            case 2:
                quantity = "GB"
                break
            default:
                quantity = "--"
                break
        }
        return size.toFixed(1) + quantity
    }
})

var Parser = require("../../lib/xmldom/dom-parser")
/**
 * https://github.com/pH200/hmacsha1-js/blob/master/index.js
 */
function b64_hmac_sha1(k,d,_p,_z){
    // heavily optimized and compressed version of http://pajhome.org.uk/crypt/md5/sha1.js
    // _p = b64pad, _z = character size; not used here but I left them available just in case
    if(!_p){_p='=';}if(!_z){_z=8;}function _f(t,b,c,d){if(t<20){return(b&c)|((~b)&d);}if(t<40){return b^c^d;}if(t<60){return(b&c)|(b&d)|(c&d);}return b^c^d;}function _k(t){return(t<20)?1518500249:(t<40)?1859775393:(t<60)?-1894007588:-899497514;}function _s(x,y){var l=(x&0xFFFF)+(y&0xFFFF),m=(x>>16)+(y>>16)+(l>>16);return(m<<16)|(l&0xFFFF);}function _r(n,c){return(n<<c)|(n>>>(32-c));}function _c(x,l){x[l>>5]|=0x80<<(24-l%32);x[((l+64>>9)<<4)+15]=l;var w=[80],a=1732584193,b=-271733879,c=-1732584194,d=271733878,e=-1009589776;for(var i=0;i<x.length;i+=16){var o=a,p=b,q=c,r=d,s=e;for(var j=0;j<80;j++){if(j<16){w[j]=x[i+j];}else{w[j]=_r(w[j-3]^w[j-8]^w[j-14]^w[j-16],1);}var t=_s(_s(_r(a,5),_f(j,b,c,d)),_s(_s(e,w[j]),_k(j)));e=d;d=c;c=_r(b,30);b=a;a=t;}a=_s(a,o);b=_s(b,p);c=_s(c,q);d=_s(d,r);e=_s(e,s);}return[a,b,c,d,e];}function _b(s){var b=[],m=(1<<_z)-1;for(var i=0;i<s.length*_z;i+=_z){b[i>>5]|=(s.charCodeAt(i/8)&m)<<(32-_z-i%32);}return b;}function _h(k,d){var b=_b(k);if(b.length>16){b=_c(b,k.length*_z);}var p=[16],o=[16];for(var i=0;i<16;i++){p[i]=b[i]^0x36363636;o[i]=b[i]^0x5C5C5C5C;}var h=_c(p.concat(_b(d)),512+d.length*_z);return _c(o.concat(h),512+160);}function _n(b){var t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",s='';for(var i=0;i<b.length*4;i+=3){var r=(((b[i>>2]>>8*(3-i%4))&0xFF)<<16)|(((b[i+1>>2]>>8*(3-(i+1)%4))&0xFF)<<8)|((b[i+2>>2]>>8*(3-(i+2)%4))&0xFF);for(var j=0;j<4;j++){if(i*8+j*6>b.length*32){s+=_p;}else{s+=t.charAt((r>>6*(3-j))&0x3F);}}}return s;}function _x(k,d){return _n(_h(k,d));}return _x(k,d);
}