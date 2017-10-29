
// dom 结构
// div.home__timeline__list 
//  -div.home__timeline__item
//   -h3>a 
//   -home__timeline__item__ft>timestamps
var GB2312UnicodeConverter = {
            ToUnicode: function (str) {
                return escape(str).toLocaleLowerCase().replace(/%u/gi, '\\u');
            }
            , ToGB2312: function (str) {
                return unescape(str.replace(/\\u/gi, '%u'));
            }
        };
console.log('<<------content_scripts------>>')
var current = 'acceptLinks_tt';
var len = $('div.home__timeline__list').children().length;
action();
function action() {
	// body...
	var timer = setInterval(function () {
		var pages = $('div.home__timeline__list').children();
		var len = pages.length;
		if(len>0){
			clearInterval(timer);
			updataPage();
		}
	},1000);
}
var newTime = new Date().getTime();
function updataPage() {
	$('a.home__timeline__more')[0].click();
	setTimeout(function () {
		var pages = $('div.home__timeline__list').children();
		var len = pages.length;
		var lastDom = pages[len-1];
		var timestamp = $(lastDom).find('.timestamp').text()
		var lastDomDate = new Date().getFullYear()+'-'+timestamp.substr(0,5)+' '+'00:00';;
		var timestamps = new Date(lastDomDate).getTime();

		if((timestamps-newTimeStamp())<0){
			var links = catchPage($('div.home__timeline__list'));
			sendMeaasge(current,links,function (data) {
				if(data.type=='acceptLinks_tt'){
					links = [];
					clickHs()
				}else if(data.type == 'acceptLinks_hs'){
					closeTab();
				}
			})
		}else{
			updataPage();
		}
	},1000)
}
// 抓取有用信息
function catchPage(dom){
	var links = [];
	var pagesLists = $(dom).children('div.home__timeline__item');
	pagesLists.each(function (i,el) {
		links.push(analyzeDom(el));
	})
	return links;
}

// 分析dom
function analyzeDom(elem) {
	var link = $(elem).children('h3').find('a').attr('href');
	var timestamp = $(elem).find('.home__timeline__item__ft').find('.timestamp').text();
	return {
		link:link,
		timestamp:timestamp
	}
}
// timestamp 
function timestampNow() {
	var date = new Date();
	var month = (date.getMonth()+1)<10? '0'+String((date.getMonth()+1)):(date.getMonth()+1);
	var m = (date.getMonth()+1)
	var day = date.getDate();
	var time = month+'-'+day;
	return {
		month:m,
		day:day
	};
}
// 点击沪深
function clickHs(argument) {
	$('.home__timeline__tabs').find('a[data-category="105"]')[0].click();
	current = 'acceptLinks_hs';
	action();
}



// 爬取文章
function catchPages() {
	var page = {};
	page.title = $('.status-title').text();
	page.content = $('.detail').text();
	page.link = window.location.href;
	
	sendMeaasge('catch_pages_tt',page,function (data) {
		closeTab();
	})
}
// 关闭窗口
function closeTab() {
	console.log('<<---close--->>');
	window.close();
}
if(/https:\/\/xueqiu.com\/[a-zA-Z]{0,}\d{0,}\/[a-zA-Z]{0,}\d{0,}/.test(window.location.href)) {console.log('1');catchPages();}

if(/https:\/\/xueqiu.com\/[a-zA-Z]{1,}\d{0,}\/[a-zA-Z]{1,}\d{1,}/.test(window.location.href)) {console.log('1');catchPages();}

// 发送消息到后台
function sendMeaasge(types,content,callback) {
	console.log(content)
	chrome.runtime.sendMessage({type: types, options: { 
	    type: 'basic', 
	    message: content
	}},callback)
}

// 当天晚上 0点时间
function newTimeStamp(){
	var time = new Date();
	var todayStamp = time.getFullYear()+'-'+(Number(time.getMonth())+1)+'-'+time.getDate()+' '+'00:00';

	return new Date(todayStamp).getTime();
}

