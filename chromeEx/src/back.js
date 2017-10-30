



function ZhiHu(){
    this.content = {};
    this.onMessage()
}

ZhiHu.prototype.onMessage = function(){
    var _this = this;
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
        var type = null,id=null,data=null;
        try{
            type = request.type||null;
            data= request.data||null;
            id = sender.tab.id;
        }catch(e){
            console.err('request data is not a invild')
        };
        var random = String(Math.random()).replace('.','_');
        // 缓存数据
        _this.content[random]={
            id:id,
            random:random,
            data :data,
            type:type,
            isCall:false
        };
        //  执行
        _this.down_link(random,data)
    });
}

// 下载图片
ZhiHu.prototype.down_link = function(random,data){
    console.log(this.content)
}

var back = new ZhiHu();