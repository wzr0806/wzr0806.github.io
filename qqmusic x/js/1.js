//audio没有jQuery方法，得用原生JScript获取
var audio = document.querySelector('audio');
//定义一个全局空数组
var lrcarr = [];
//当前播放的歌曲是第几首歌曲
var playIndex = 0;
//三种模式，0：随机  1：顺序  2：单曲循环；
var patternNum = 0;
//把ajax中相同的地址存起来，方便之后试用；
var url = 'http://api.cimns.com:8081/QQMusic/';
var imgListMargin=15;
//轮播图
$.ajax({
	url: url + 'focus',
	dataType: 'json',
	type: 'get',
	success: function (res) {
		var arr = res.data.list;
		// console.log(arr);
		var n = 0;//当前加载了多少张
		$.each(arr, function(i,o){
			var oImg = new Image();
			oImg.src = o.pic_info.url;
			oImg.onload = function(){
				n++;
				if(n == arr.length){
					$('.loading').hide();
					$('.g-banner ul').empty();
					//创建
					$.each(arr, function(i,o){
						//图片
						var li = $('<div class="swiper-slide"></div>');
						li.append($('<img>').attr('src', o.pic_info.url));
						$('.in-banner .swiper-wrapper').append(li).append(li);
						//点
						var dotLi = $('<li>');
						if(i == 0) dotLi.addClass('active');
						$('.in-banner ol').append(dotLi);
					})
					//swiper
					var mySwiper = new Swiper ('.in-banner', {
						// direction: 'vertical', // 垂直切换选项
						loop: true, // 循环模式选项
						speed: 300, //动画的执行事件
						autoplay: {
							delay: 3000
						},

						// 如果需要分页器
						pagination: {
						  el: '.swiper-pagination',
						},
					}) 
				}
			}
		})


		
	}
})

//为你推荐歌单
$.ajax({
	url: url + 'hotrecom',
	dataType: 'json',
	type: 'get',
	success: function(res){
		var arr = res.data;
		$.each(arr, function(i,o){
			// console.log(o);
			var oDiv = $('<div class="swiper-slide img-item">');
			// console.log(i>6?'none':'block');
			// 把需要的参数 写到元素身上
			oDiv.attr('disstid', o.content_id)
                .attr('img', o.cover)
                .attr('tip', o.title);
			oDiv.html(
				`<div class="img-box">
					<img src="${o.cover}" alt="">
					<i class="font icon-qq" style="display: ${i>5?'none':'block'}">&#xe609;</i>
					<span class="img-tip"><i class="font">&#xe60d;</i>${o.listen_num>100000000?(o.listen_num/100000000).toFixed(2) + '亿': o.listen_num>10000?(o.listen_num/10000).toFixed(2) + '万': o.listen_num}</span>
				</div>
				<p>${o.title}</p>`);
			i>5?$('.img-list-cont').eq(1).append(oDiv):$('.img-list-cont').eq(0).append(oDiv);
			// $('.img-list-cont').append(oDiv);
		})
		var mySwiper = new Swiper ('.img-list', {
			slidesPerView: 3.3,
			spaceBetween: 10,
			slidesOffsetBefore: imgListMargin,
			slidesOffsetAfter: imgListMargin,
			speed: 300,
			preventClicksPropagation: true,
			
		}) 
	}
})

//点击的时候去请求歌单
$('.img-list-cont').on('click', '.img-item', function(){
	$('.gl-list').show();
	$('.menu-list').empty();
	//歌单点进去之后的标题跟着你点击的歌单变化
    var msg=`
            <i class="font back-btn">&#xe633;</i>
            <div class="menu-list-title">${$(this).attr('tip')}</div>
            <i class="font more-btn">&#xe670;</i>
    `
    $('.menu-list').append(msg)
	//让当前首页向左移动三分之一
	$('.index').css({
		'transition': '.4s',
		'transform': 'translateX(-3.3rem)'
	})
	//播放器 下去
	$('.gl-tab').css({
		'transition': '.4s',
		'transform': `translateY(${$('.gl-icons-box').outerHeight(true)}px)`
	})
	setTimeout(function(){
			//列表页完全覆盖到屏幕中
		$('.gl-list').css({
			'transition': '.4s',
			'transform': 'translateX(0)'
		})
	});
	//背景图
	$('.list-header').css({
		'backgroundImage': 'url('+$(this).attr('img')+')'
	})
	//请求歌单
	$.ajax({
		url: url + 'playlist/detail',
		dataType: 'json',
		type: 'get',
		data: {
			type: 1,
			disstid: $(this).attr('disstid')
		},
		success: function(res){
			// console.log(res);
			//为下一次数据做准备
			$('.music-list').empty();
			//列表
            var arr = res.songlist;
            
            $('.playall-btn i').eq(1).html('全部播放（'+arr.length+')');
			$.each(arr, function(i,o){
				var li = $('<li>');
				li.attr('mid',o.songmid)
					.attr('singermid',o.singer[0].mid)
					.attr('songname',o.songname)
					.attr('singername',o.singer[0].name);

				li.append($('<span>').html(i+1))
					.append($('<div class="mu-text">')
							.append($('<p class="mu-title"></p>').html(o.songname))
							.append($('<p class="mu-cont">')
									.append($('<i class="font icon-dj">&#xe629;</i>'))
									.append($(issq(o)))
									.append($('<span class="singer-info">').html(o.singer[0].name+"·"+ o.albumname))
								)
						)
					.append($('<i class="font icon-video">&#xe667;</i>'))
					.append($('<i class="font icon-more">&#xe670;</i>'));
				if(o.vid=='') li.find('.icon-video').hide();
				if(!o.isonly) li.find('.icon-dj').hide();
                $('.music-list').append(li);
			})
		}
	})
})

//播放列表页面 返回
$('.list-header').on('click','.back-btn', function(){
	//让当前首页向左移动三分之一
	$('.index').css({
		'transition': '.4s',
		'transform': 'translateX(0)'
	})
	//播放器 下去
	$('.gl-tab').css({
		'transition': '.4s',
		'transform': `translateY(0)`
	})
	//列表页完全覆盖到屏幕中
	$('.gl-list,.gl-list-bd').css({
		'transition': '.4s',
		'transform': 'translateX(100%)'
	})
	setTimeout(function(){
		$('.gl-list').hide()
	}, 400);
})
/*
	click 在移动端中有 300毫秒的延迟
	touch事件：touchstart touchmove touchend

*/
var showTime = 0.4;
$('.music-list').on('click', 'li', function(){
	//让播放的歌曲当前索引值
	playIndex = $(this).index();
	fnplay($(this));
	$('.music-list').hide();
})
//请求歌曲的播放地址 和 初始化播放器的各种操作
function fnplay(_this){
	//清空歌词 重置播放器
	$('.lrc-inner').empty();
	audio.currentTime = 0;
	$('.play-line-old').css({width: 0});
	$('.btn-pause').hide();
	$('.btn-play').show();
	$('.lrc-inner').removeAttr('style');

	var _this = _this;
	$('.play-box').show();
	//进入的动画
	setTimeout(function(){
		$('.play-box').css({
			'transition': showTime + 's',
			'transform': 'translateY(0)'
		})
	},10)
	$.ajax({
		url: url + 'song/detail',
		dataType: 'json',
		type: 'get',
		data: {
			mid: _this.attr('mid')
		},
		success: function(res){
			
			var json = res;
			//sip 服务器   purl 播放地址   vkey 密钥  lrc 歌词
			// console.log(json);
			//处理音乐
			audio.src = json.sip[1] + json.purl;
			if(!navigator.userAgent.match(/iPhone/i)){
				audio.play();
				//处理按钮
				$('.btn-pause').show();
				$('.btn-play').hide();
			}
			//歌曲的图片
			var _src = 'http:' + getPic({page: 'singer', type: 300, mid: _this.attr('singermid')});
			$('.mini-play img,.play-singer-pic img').attr('src', _src);
			$('.play-bg').css({'background-image': 'url('+_src+')'})
			//处理歌曲名称和歌手名称
			$('.mini-play p').html(_this.attr('songname') + ' - ' + _this.attr('singername'));
			$('.play-box .menu-title').html(_this.attr('songname'));
			$('.singer-name span').html(_this.attr('singername'));
			//图片转动
			$('.play-singer-pic img').on('load', function(){
				$(this).addClass('imgplay')
			})
			$('.mini-play img').on('load',function(){
				$(this).addClass('imgplay')
			})
			//歌曲还是纯音乐
			if(json.lyric === ''){
				$('.lrc-inner').append($('<li>').html('纯音乐，请欣赏。'))
			}
			else{
				//处理歌词
				lrcarr = [];
				var lrcold = json.lyric.split('\n');
				// console.log(lrcold);
				$.each(lrcold, function(i,o){
					var arr = o.split(']');
					if(!isNaN(arr[0].substring(1).split(':')[0])){
						lrcarr.push([str2num(arr[0].substring(1)), arr[1]])
					}
				})
				//创建歌词的Li
				$.each(lrcarr, function(i,o){
					var oLi = $('<li>');
					oLi.html(o[1]);
					$('.lrc-inner').append(oLi);
				})
				// console.log(lrcarr);
			}
		}
	})
}

//播放界面返回（到底部）
$('.down-btn').click(function(){
	$('.index').show();
	$('.music-list').show();
	$('.play-box').css({
		'transition': showTime + 's',
		'transform': 'translateY(100%)'
	})
	//进入的动画
	setTimeout(function(){
		$('.play-box').hide();
	},showTime*1000)
})
//播放器控制
$('.mini-play img').click(function(){
	if(audio.src=='') return;
	$('.play-box').show();
	$('.index').hide();
	$('.music-list').hide();
	//进入的动画
	setTimeout(function(){
		$('.play-box').css({
			'transition': showTime + 's',
			'transform': 'translateY(0)'
		})
	},10)
})
//暂停按钮
$('.btn-pause').on('click', function(){
	//图片暂停转动
	$('.play-singer-pic img').addClass('imgplay-pause');
	//音乐暂停
	audio.pause();
	//按钮切换
	$('.btn-pause').hide();
	$('.btn-play').show();
})
//播放按钮
$('.btn-play').on('click', function(){
	//图片暂停转动
	$('.play-singer-pic img').removeClass('imgplay-pause');
	//音乐暂停
	audio.play();
	//按钮切换
	$('.btn-pause').show();
	$('.btn-play').hide();
})
//addEventListener 事件监听（绑定）  timeupdate 当时间发生变化的时候
audio.addEventListener('timeupdate', function(){
	var c = audio.currentTime;
	var d = audio.duration;
	//圆点所占比例
	// var dotScale = $('.play-line-old span').width() / $('.play-line').width();

	$('.currentTime').html(changeTime(c));
	$('.duratime').html(changeTime(d));
	//进度条
	/*
	方法1 麻烦
	 $('.play-line-old').css({
		//c/d 时间的比例 1-dotScale 最终走不到100%
		width: (c/d*(1-dotScale) + dotScale) * 100 +'%'
	})*/
	$('.play-line-old').css({
		width: c/d * 100 +'%'
	})
	if($('.lrc-inner li').length!=0){
		//歌词部分
		for(var i=0;i<lrcarr.length;i++){
			if(audio.currentTime>=lrcarr[i][0]){
				$('.lrc-inner li').eq(i).addClass('active').siblings('li').removeClass('active');

				$('.lrc-inner').css({
					'transform': 'translateY(-'+$('.lrc-inner li').eq(i).position().top+'px)',
					'transition': '.35s linear'
				})
			}
		}
	}
}, false)
//进度条
/*  方法1  麻烦
$('.play-line-box').on('touchstart', function(e){
	//鼠标距离元素的位置
	var x = e.touches[0].clientX - $('.play-line-box').offset().left;
	var scale = x / ($('.play-line-box').width() - $('.play-line-old span').width());
	//点站的比例
	var dotScale = $('.play-line-old span').width() / $('.play-line').width();

	//进度条
	$('.play-line-old').css({
		width: (scale*(1-dotScale)) * 100 + '%'
	})
	//当前时间
	audio.currentTime = (scale-dotScale) * audio.duration;
})
 */
$('.play-line-box').on('touchstart', function(e){
	audio.pause();
	$('.btn-pause').hide();
	$('.btn-play').show();
	//鼠标距离元素的位置
	var x = e.touches[0].clientX - $('.play-line-box').offset().left;
	var scale = x / $('.play-line-box').width();
	//点站的比例
	//进度条
	$('.play-line-old').css({
		width: scale * 100 + '%'
	})
	//当前时间
	audio.currentTime = scale * audio.duration;
})


$('.play-line-box').on('touchmove', function(e){
	//鼠标距离元素的位置
	var x = e.touches[0].clientX - $('.play-line-box').offset().left;
	var scale = x / $('.play-line-box').width();
	//点站的比例
	//进度条
	$('.play-line-old').css({
		width: scale * 100 + '%'
	})
	//当前时间
	audio.currentTime = scale * audio.duration;
})

$('.play-line-box').on('toucend',function(e){
	audio.play();
})
//把秒转为分钟 00:00
function changeTime(t){
	isNaN(t)?t=0:t;
	//isNAN的TRUE表示不是数字，
	var m = parseInt(t / 60);
	var s = parseInt(t % 60);
	return db(m)+':'+db(s);
}
//补零
function db(n){return n<10?'0'+n:n;}
//字符串转数组
function str2num(str){
	// var str = '01:27.83'; //['01','27.83']
	var arr = str.split(':');
	return arr[0]*60 + Number(arr[1]);
}

//播放模式
//下一首
//模式  0 随机  1 顺序  2 单曲

$('.btn-random').click(function(){
	var patternNum = 1;
	$('.btn-random').hide();
	$('.btn-list').show();
})
$('.btn-list').click(function(){
	var patternNum = 2;
	$('.btn-random').hide();
	$('.btn-list').hide();
	$('.btn-only').show();
})
$('.btn-only').click(function(){
	var patternNum = 0;
	$('.btn-random').hide();
	$('.btn-only').hide();
	$('.btn-random').show();
})
$('.btn-next').click(function(){
	audio.pause();
	
	if(patternNum == 0){
		playIndex = parseInt(Math.random() * $('.music-list li').length);
		//播放函数
		fnplay($('.music-list li').eq(playIndex));
	}else if(patternNum == 1){
		playIndex = $('.music-list li').length?playIndex=0:playIndex++;
	}
	fnplay($('.music-list li').eq(playIndex));
})

audio.addEventListener('ended',function(){
	$('.btn-next').trigger('click');
})

$('.btn-prev').click(function(){
	audio.pause();
	if(patternNum == 0){
		playIndex = parseInt(Math.random() * $('.music-list li').length);
		//播放函数
		fnplay($('.music-list li').eq(playIndex));
	}else if(patternNum == 1){
		playIndex = $('.music-list li').length?playIndex=0:playIndex++;
	}
	fnplay($('.music-list li').eq(playIndex));
})

audio.addEventListener('ended',function(){
	$('.btn-next').trigger('click');
})



//获取歌手和歌曲图片-返回字符串
function getPic(t){
  t = t || {};
  let e = "//y.gtimg.cn/mediastyle/macmusic_v4/extra/default_cover.png?max_age=31536000",
      o = t.page,
      n = t.type,
      i = t.mid;
  return 90 >= n ? n = 90 : n > 90 && 180 >= n ? n = 150 : n > 180 && 300 >= n ? n = 300 : n > 300 && 500 >= n ? n = 500 : n > 500 && (n = 800),
      window.devicePixelRatio && parseInt(window.devicePixelRatio) > 1 && ((300 == n || 500 == n) && (n = 800),
          150 == n && (n = 300),
          (68 == n || 90 == n) && (n = 150)),
      "string" == typeof i && i.length >= 14 ? (o = "album" == o ? "T002" : "singer" == o ? "T001" : o,
          e = "//y.gtimg.cn/music/photo_new/" + o + "R" + (n || 68) + "x" + (n || 68) + "M000" + i + ".jpg?max_age=2592000") : i > 0 && (e = "//y.gtimg.cn/music/photo/" + o + "_" + (n || 68) + "/" + i % 100 + "/" + (n || 68) + "_" + o + "pic_" + i + "_0.jpg?max_age=2592000"),
      e
}

$('.mi-play-btn').click(function(){
	$('.mi-play-btn').hide();
	$('.mi-play-list-btn-pause').show();
	audio.play();
})

$('.mi-play-list-btn-pause').click(function(){
	$('.mi-play-btn').show();
	$('.mi-play-list-btn-pause').hide();
	audio.pause();
})


$('.play-cont-item').on('touchstart',function(){
	var Inum=$(this).index();
	if(Inum==0){
		$('.play-cont-inner').css({
			'transform':'translateX(-10rem)'
		})
		$('.play-dot').children().eq(1).addClass('active').siblings().removeClass('active')
	}else{
		$('.play-cont-inner').css({
			'transform':'translateX(0rem)'
		})
		$('.play-dot').children().eq(0).addClass('active').siblings().removeClass('active')
	}
})

//排行榜--请求ajax数据:
$.ajax({
	url:"http://api.cimns.com:8081/QQMusic/ranktop",//接口地址
	dataType:'json',//服务器返回json格式数据
	type:'get',//HTTP请求类型
	success:function(data){
		// console.log(data)
		var lis=data.data;
		// var grouptit=data.topinfo
		// console.log(lis)
		$.each(lis,function(index,item){
			if(item.group_id==0){
				var groupli=item.list
				
				$.each(groupli,function(index,item){
					if(index<8){
						var bd=`
							<div class="m-bd-list-item" tid="${item.id}" img="${item.pic}" tit="${item.name}">
								<div class="m-bd-msg">
									<h3>${item.name}</h3>
									<ol class="u-bd-msg-list"></ol>
								</div>
								<div class="m-bd-img">
									<img src=${item.pic} class="u-tosinglist">
									<div class="u-bd-img-info">
										<em class="iconfont">&#xe60d;</em>
										<span>${item.listen_num}</span>
									</div>
								</div>
							</div>
						`
						$('.g-bd-list').append(bd);
						var songlist=item.songlist
						// console.log(songlist);
						$.each(songlist,function(index,item){
							var song=`
								 <li>${item.track_name}<span>-${item.singer_name}</span></li>
							`
							$('.u-bd-msg-list').append(song)
						})
					}else if(index<14){
						var area=`
						<div class="m-bd-square-item" tid="${item.id}" tit="${item.Name}">
							<img src=${item.pic} class="u-tosinglist">
							<div class="u-bd-img-info">
								<em class="iconfont">&#xe60d;</em>
								<span>${item.listen_num}</span>
							</div>
						</div>
					  `
					  $('.g-bd-square-one').append(area);
					}else{
						var area=`
						<div class="m-bd-square-item" tid="${item.id}" img="${item.pic}" tit="${item.Name}">
							<img src=${item.pic} class="u-tosinglist">
							<div class="u-bd-img-info">
								<em class="iconfont">&#xe60d;</em>
								<span>${item.listen_num}</span>
							</div>
						</div>
					  `
					  $('.g-bd-square-two').append(area);
					}
				})
			}else{
				var grlist=item.list;
				// console.log(grlist);
				$.each(grlist,function(index,item){
					var gritem=`
						<div class="m-bd-square-item" tid="${item.id}" img="${item.pic}" tit="${item.Name}">
							<img src=${item.pic} class="u-tosinglist">
							<div class="u-bd-img-info">
								<em class="iconfont">&#xe60d;</em>
								<span>${item.listen_num}</span>
							</div>
						</div>
					`
					$('.g-bd-square-three').append(gritem);
				})

			}
		})
	}
});
$('#my-page').click(function(){
	$('.g-self-showbox').show();
	//首页像左移动
	$('.index').css({
		'transition': '.4s',
		'transform': 'translateX(-3.3rem)'
	})
	//榜单页面显示在页面中
	setTimeout(function(){
		$('.g-self-showbox').css({
			'transition': '.4s',
			'transform': 'translateX(0rem)'
		})
	})
})


$('.sing-rank').click(function(){
	$('.g-bd-showbox').show();
	//首页像左移动
	$('.index').css({
		'transition': '.4s',
		'transform': 'translateX(-3.3rem)'
	})
	//播放器下去
	$('.gl-tab').css({
		'transition': '.4s',
		'transform': `translateY(${$('.gl-icons-box').outerHeight(true)}px)`
	})
	//榜单页面显示在页面中
	setTimeout(function(){
		$('.g-bd-showbox').css({
			'transition': '.4s',
			'transform': 'translateX(0)'
		})
	})
})
$('.sing-list').click(function(){
	$('.g-card-showbox').show();
	//首页像左移动
	$('.index').css({
		'transition': '.4s',
		'transform': 'translateX(-3.3rem)'
	})
	//播放器下去
	$('.gl-tab').css({
		'transition': '.4s',
		'transform': `translateY(${$('.gl-icons-box').outerHeight(true)}px)`
	})
	//榜单页面显示在页面中
	setTimeout(function(){
		$('.g-card-showbox').css({
			'transition': '.4s',
			'transform': 'translateX(0)'
		})
	})
})
$('#bgback').click(function(){
	//首页回来
	$('.index').css({
		'transition': '.4s',
		'transform': 'translateX(0)'
	})
	//播放器回来
	$('.gl-tab').css({
		'transition': '.4s',
		'transform': `translateY(0)`
	})
	//榜单页面回去
	$('.g-bd-showbox').css({
		'transition': '.4s',
		'transform': 'translateX(100%)'
	})
	setTimeout(function(){
		$('.g-bd-showbox').hide();
	}, 400)
})
$('#styleback').click(function(){
	//首页回来
	$('.index').css({
		'transition': '.4s',
		'transform': 'translateX(0)'
	})
	//播放器回来
	$('.gl-tab').css({
		'transition': '.4s',
		'transform': `translateY(0)`
	})
	//榜单页面回去
	$('.g-card-showbox').css({
		'transition': '.4s',
		'transform': 'translateX(100%)'
	})
	setTimeout(function(){
		$('.g-card-showbox').hide();
	}, 400)
})
$('#my-home').click(function(){
	//首页回来
	$('.index').css({
		'transition': '.4s',
		'transform': 'translateX(0)'
	})
	//榜单页面回去
	$('.g-self-showbox').css({
		'transition': '.4s',
		'transform': 'translateX(100%)'
	})
	setTimeout(function(){
		$('.g-self-showbox').hide();
	}, 400)
})




//榜单 跳转歌单页面
$('body').on('click','.m-bd-list-item',function(){
	$('.music-list').empty();
	// $('.menu-list-title').html('');
	$('.gl-list-bd').show();
	$('.g-slist-play').html('');
	$('.g-slist-banner').html('');
	play='';
	//榜单页面向左移动三分之一
	$('.g-bd-showbox').css({
		'transition': '.4s',
		'transform': 'translateX(-3.3rem)'
	})
	//榜单里面的歌单显示在页面中
	setTimeout(function(){
		$('.gl-list-bd').css({
			'transition': '.4s',
			'transform': 'translateX(0)'
		})
	})
   // 背景图
   $('.list-header').css({
		'backgroundImage': 'url('+$(this).attr('img')+')'
	})

	$('.gl-list-bd .menu-title').html($(this).attr('tit'));

	$.ajax({
		url:'http://api.cimns.com:8081/QQMusic/rank/detail',
		dataType:'json',//服务器返回json格式数据
		type:'get',//HTTP请求类型
		data:{
			topid:$(this).attr('tid')
		},
		success:function(data){
			console.log(data)
			var singlist=data.songlist;
			console.log(singlist)
			$('.playall-btn i').eq(1).html('全部播放（'+singlist.length+'）')
			$.each(singlist, function(i,o){
				var li = $('<li>');
				li.attr('mid',o.songmid)
					.attr('singermid',o.data.singer[0].mid)
					.attr('songname',o.data.songname)
					.attr('singername',o.data.singer[0].name);

				li.append($('<span>').html(i+1))
					.append($('<div class="mu-text">')
							.append($('<p class="mu-title"></p>').html(o.data.albumname))
							.append($('<p class="mu-cont">')
									.append($('<i class="font icon-dj">&#xe629;</i>'))
									.append($(issq(o)))
									.append($('<span class="singer-info">').html(o.data.singer[0].name+"·"+ o.data.albumname+"·"+ o.data.albumdesc))
								)
						)
					.append($('<i class="font icon-video">&#xe667;</i>'))
					.append($('<i class="font icon-more">&#xe670;</i>'));
				if(o.vid=='') li.find('.icon-video').hide();
				if(!o.isonly) li.find('.icon-dj').hide();
				$('.music-list').append(li);
			})
		}
	})

})
$('.list-header').on('click','.back-btn-bd', function(){
	//让当前首页向左移动三分之一
	$('.g-bd-showbox').css({
		'transition': '.4s',
		'transform': 'translateX(0)'
	})
	//播放器 下去
	// $('.gl-tab').css({
	// 	'transition': '.4s',
	// 	'transform': `translateY(0)`
	// })
	//列表页完全覆盖到屏幕中
	$('.gl-list-bd').css({
		'transition': '.4s',
		'transform': 'translateX(100%)'
	})
	setTimeout(function(){
		$('.gl-list-bd').hide();
	}, 400);

})
$('.m-bd-return').click(function(){
	$('.g-show-box').hide();
})

//判断是sq还是hq
//HQ是high quality 的简称，指的是比特率为320kbps的高品mp3格式的歌曲。
//SQ是super quality 的简称，无损音乐flac或者ape格式的歌曲。
function issq(o){
	if(o.sizeflac!=0) return '<i class="font icon-sq">&#xe626;</i>';
	else if(o.size320!=0) return '<i class="font icon-hq">&#xe62b;</i>';
}

$(window).on('scroll',function(){
	var scl=$(document).scrollTop();
	// console.log(scl)
	$('.menu-list').css({
		'transform':'translateY('+scl+'px)',
		'color':'yellow'
	})
})