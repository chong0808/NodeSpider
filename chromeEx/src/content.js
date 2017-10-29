
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
            }
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
  console.log($(this.content.listNum).text())
  console.log(listNum)
  var lists = $(this.content.answerItem);
  console.log(lists.length)
  if(lists.length!=listNum){
    this.init();
    return false;
  }
  this.itemList = this._getItemFromDom(lists);
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

    }catch(e){

    }
    return content;


}





new Extension(null);