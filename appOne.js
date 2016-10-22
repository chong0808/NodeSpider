var express = require('express');
var app = express();
var cheerio = require('cheerio');
var superagent = require('superagent');
var request = require('request');
var fs = require('fs');
var async = require("async");
var path = require("path");
var fetch_data_get = require("./fetch.js").fetch_data_get;
var fetch_data_post = require("./fetch.js").fetch_data_post;

// 存储所有图片链接的数组
var photos = [];
var count = 0;


//  输入问题编号
configSetting("29279000")

app.get('/',function(req,res){
		res.send(photos);
}).listen(9090)

function configSetting(questionNum) {
			var setting = {};

			setting = {
				header: {
					"Accept": "*/*",
					"Accept-Encoding": "gzip, deflate, br",
					"Accept-Language": "zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3",
					"Connection": "keep-alive",
					"Content-Length": "132",
					"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
					"Host": "www.zhihu.com",
					"Referer": "https://www.zhihu.com/question/" + questionNum, //问题
					"User-Agent": "Mozilla/5.0 (Windows NT 6.3; WOW64; rv:44.0) Gecko/20100101 Firefox/44.0",
					"X-Requested-With": "XMLHttpRequest"
				},
				firstLink: "https://www.zhihu.com/question/" + questionNum, //问题
				ajaxLink: "https://www.zhihu.com/node/QuestionAnswerListV2",
				post_data_h: "method=next&params=%7B%22url_token%22%3A" + questionNum + "%2C%22pagesize%22%3A10%2C%22offset%22%3A", //请求数据
				post_data_f: "%7D&_xsrf=98360a2df02783902146dee374772e51", //请求头的每个人固定的东西
				//  发送ajax间隔时间
				ajax_timeout: 5,
				//  下载图片速度
				download_v: 100,
				title:questionNum
			}

			//创建一个目录文件夹
			getInitUrlList(setting);
}
// 获取首屏所有图片链接
function getInitUrlList(setting) {

			fetch_data_get(setting.firstLink, {})
				.then(function(result) {
					var $ = cheerio.load(result.text);
					var itemsAnswer = $('.zm-item-answer ');
					var maxNum = parseInt($('#zh-question-answer-num').text());

						itemsAnswer.map(function(i, elem) {

							var name = $(elem).find('a.author-link').text();
							name?name=name : name='匿名';
							var id = $(elem).find('a.author-link').attr('href');
							id ? id = id.substring(8,id.length) :'匿名用户';
							var nameSrc =  $(elem).find('a.author-link').attr('href');
							nameSrc? nameSrc='www.zhihu.com' + nameSrc: nameSrc='zhihu.com';
							var answerImg = $(elem).find( '.zm-item-rich-text img' );
							var imgSrc = []

							if(answerImg.length>0){


								answerImg.each(function(i, el) {
									imgSrc.push($(el).data().original);
								})

								photos.push({
									'id':id,
									'name': name,
									'nameSrc': nameSrc,
									'imgSrc': imgSrc
								});

							}else{

								return false;
							}

						})
					// 继续发送ajax请求
					getIAjaxUrlList(20, setting,maxNum);

				})
				.catch(function(error) {
					console.log(error)
				});
}
// 每隔300毫秒模拟发送ajax请求，并获取请求结果中所有的图片链接
function getIAjaxUrlList(offset, setting,maxNum) {
			fetch_data_post(setting.ajaxLink, setting.post_data_h + offset + setting.post_data_f, setting.header)
				.then(function(result) {
					var response = JSON.parse(result.text);
					if (offset < maxNum) {
						// 把所有的数组元素拼接在一起
						var $ = cheerio.load(response.msg.join(""));
						var itemsAnswer = $('.zm-item-answer ');
						itemsAnswer.map(function(i, elem) {
								var name = $(elem).find('a.author-link').text();

								name ? name = name : name='匿名';
								
								var id = $(elem).find('a.author-link').attr('href');
								id ? id = id.substring(8,id.length) :id ='匿名用户';
								var nameSrc = 'www.zhihu.com' + $(elem).find('a.author-link').attr('href');
								nameSrc? nameSrc=nameSrc: nameSrc='zhihu.com';
								var answerImg = $(elem).find( '.zm-item-rich-text img' );
								var imgSrc = []
								if(answerImg.length>0){
									answerImg.each(function(i, el) {
										imgSrc.push($(el).attr('src'));
									})
									photos.push({
										'id':id,
										'name': name,
										'nameSrc': nameSrc,
										'imgSrc': imgSrc
									});
								}else{
									return false;
								}
						})

						setTimeout(function() {
							offset += 20;
							console.log("已成功抓取 " + photos.length + " 个人的答案");
							getIAjaxUrlList(offset, setting,maxNum);
						}, setting.ajax_timeout)

					} else {
						console.log("图片链接全部获取完毕，一共有" + photos.length + "个人的答案");
						// console.log(photos)
						return downloadImg(setting);
						// return  photos;
					}
				})
				.catch(function(error) {
					console.log(error)
				});
}
function downloadImg(asyncNum) {
			// console.log(question)

			// 有一些图片链接地址不完整没有“http:”头部,帮它们拼接完整
			for(var j=0;j<photos.length;j++){

				if(photos[j].name&&photos[j].nameSrc){
					fs.mkdir(__dirname+'/img/'+photos[j].name+'('+photos[j].id+')',function(err){
						if(err){console.log(err)}
							console.log('创建目录成功')
					})
				}else{
				
					fs.mkdir(__dirname+'/img/'+'匿名',function(err){
						if(err){console.log(err)}
							console.log('创建匿名目录成功')
					})
					
				}
				if(photos[j].imgSrc.length>0){
					async.mapLimit(photos[j].imgSrc, asyncNum.download_v, function(photo, callback) {
						var name = photos[j].name;
						var nameId = photos[j].id;
						fetch_data_get(photo, {})
							.then(function(result) {
								var fileName = path.basename(photo);
								fs.writeFile('./img/'+ name+'('+nameId+')'+'/' + fileName, result.body, function(err) {
									
									if (err) {
										console.log(err);
									} else {
										count++;
										console.log(count + " done ");
										callback(null, fileName);
									}
								})
							})
							.catch(function(error) {
								console.log(error)
							})
					}, function(err, result) {
						if (err) {
							console.log(err);
						} else {
							console.log(" all right ! ");
							console.log(result);
						}
					})
				}
			}
}