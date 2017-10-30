
function Extension(content){
    var content = content || {};
    var _content = {
            timer:null, // 定时器容器,
            answerItem:'.List-item',
            moreBtn:'.QuestionMainAction',
            answerBtn:'.QuestionAnswers-answerButton', 
            listNum:'.List-headerText',
            itemDom:{
                userLink:'.UserLink-link',
                noscriptTag:'noscript'
            },
            colAnswer:'.CollapsedAnswers-bar'
        };
    this.content = Object.assign(_content,content);
    this.init();
}

// 启动
Extension.prototype.init = function(){
    this.content.timer = setInterval(()=>{
        this.loadMore()
    },2000);
}

// 点击加载更多答案
Extension.prototype.loadMore = function(){
    var answerBtn = $(this.content.answerBtn).length;
    if($(this.content.moreBtn).length>0 && answerBtn==0){
        $(this.content.moreBtn)[0].click();
    }else{
        clearInterval(this.content.timer);
        this.getAnswerList();
    }
}

// 获取连接
Extension.prototype.getAnswerList = function(){
  var listNum = parseInt($(this.content.listNum).text());
  var colNum = parseInt($(this.content.colAnswer).text());
  var lists = $(this.content.answerItem).length+colNum;
  if(lists<=listNum  ){
    this.init();
    return false;
  }
  var itemList = this._getItemFromDom($(this.content.answerItem));
  console.log(this.itemList)
  this.sendMsg('down_link',itemList,function(err){
      console.log(err)
  })
}

// 获取dom 筛选出链接
// 返回数组
Extension.prototype._getItemFromDom = function (lists){
    var contents = [];
    if(lists && Object.keys(lists).length>0){
        for(let i=0;i<lists.length;i++){
            contents.push(this._getLink(lists[i]));
        }
    }
    return contents;
}

// 分析dom 获取内容
// 返回对象
Extension.prototype._getLink = function(item){
    var content  = {
        user_name :null,
        user_link:null,
        user_img_srcs:[]
    };
    try{
        content.user_name = $(item).find(this.content.itemDom.userLink).text();
        content.user_link = $(item).find(this.content.itemDom.userLink).attr('href');
        var imgLists = $(item).find(this.content.itemDom.noscriptTag);
        content.user_img_srcs = this._getImg(imgLists);
    }catch(e){
        console.error('分析dom 获取内容 出错！！！')
    }
    return content;


}

Extension.prototype._getImg =function(lists){
    var contents=[];
    if(lists && Object.keys(lists).length>0){
        for(let i=0;i<lists.length;i++){
            contents.push($(lists[i].innerText).attr('src'));
        }
    }
    return contents;
}

Extension.prototype.sendMsg = function(type,data,callback){
    chrome.runtime.sendMessage({type: type,data:data}, callback);
}


new Extension(null);