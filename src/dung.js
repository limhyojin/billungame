/*******************************
	자바스크립트 똥피하기 v0.91
	
	제작자 : 최영규
	제작일 : 2006년 9월 3일

	문의는 http://hooriza.com/
*******************************/

// 이미지 리스트
ImageList = Class.create();

ImageList.prototype = {
	
	object : null,
	image : null,
	
	size : [ undefined, undefined ],
	
	initialize : function(src, width, height) {
		
		this.size = [ width, height ];
		
		this.object = document.createElement("div");
		this.image = document.createElement("img");
		
		this.object.appendChild(this.image);
		this.image.src = src;
		this.image.border = 0;

		with (this.object.style) {
			width = this.size[0] + "px";
			height = this.size[1] + "px";
			
			overflow = "hidden";
		}
	},
	
	showImage : function(image_num) {
		this.image.style.marginLeft = "-" + (image_num * this.size[0]) + "px";
	}
}

function Dung(_game) {

	// 게임화면
	var game;
	
	// 이미지 객체
	var img;
	
	//	위치
	var pos = [ undefined, undefined ];
	
	// 타이머
	var timer;
	var timeout;
	
	// 상태
	var index;
	
	this.initialize = function(_game) {

		game = _game;
		var ranNum = randomBH(1,4);
		img = new ImageList("images/billun"+ranNum+".gif", 150, 150);
		//1. 풍선의 배경 파일을 스크립트로 넣어주자 파일이름을 앞뒤로 나누고 사이에 랜덤값으로 1에서 4 사이의 값을 넣어주자
		
		img.object.className = "bil" + ranNum;
		img.object.style.position = "absolute";
		game.screen.appendChild(img.object);

		
		img.object.style.top = "-150px";
	};

	function randomBH(min, max) {
  		min = Math.ceil(min);
  		max = Math.floor(max);
  		return Math.floor(Math.random() * (max - min + 1)) + min;
	}//최소값과 최대값 사이의 임의의 숫자를 리턴하는 함수(복붙)
	
	this.setPosition = function(x, y) {
		
		pos[0] = x;	
		img.object.style.left = pos[0] + "px";

		pos[1] = y;
		img.object.style.top = (pos[1] - 150) + "px";
	};
	
	this.ready = function() {
		
		var x = parseInt(Math.random() * (game.size[0] - 150));
		
		img.showImage(0);
		this.setPosition(x, 0);
		
		index = 0;
	};
	
	this.start = function(delay) {
		
		var self = this;
		
		this.ready();		
		
		if (timer) window.clearInterval(timer);
		timer = null;
		
		if (timeout) window.clearTimeout(timeout);
		timeout = window.setTimeout(function() {

			if (timer) window.clearInterval(timer);
			timer = window.setInterval(self.drop.bind(self), 50);
			
			timeout = null;
			
		}, delay);
	};
	
	this.clear = function(){
		
	}
	this.drop = function() {
		
		if (index < 0) {
			
			if (index > -3) // 바닥에 떨어져도 어느정도까지는 충돌체크
				if (game.playing && game.man.collision(pos[0] + 150 / 2)){ // 충돌했으면
					
					game.gameOver(game.man);}

			//--은 연산전의 값
			//switch문은 if문과 같은 조건 제어문, 하지만 부등식을 사용할 수 없다. ==은 가능
			switch (index--) {
			case -1: case -2:
				img.showImage(1);
				break;
				
			case -3: case -4:
				img.showImage(2);
				break;
			
			case -5:
				this.start(Math.random() * 3000); // 떨어지는 간격으로 추정

			}

			return;
		}
		
		// 떨어지는 속도
	
		var incr = index++;
		if (incr > 50) incr = Math.random()*50; // 최대 속도 (incr 속도가 어느정도 달했을 때 꾸준히 어느정도의 속도를 유지한)
		
		pos[1] += incr;
		
		var screen_height = game.size[1];
		
		// 바닥에 닿았으면
		if (pos[1] >= screen_height) {
			if (game.playing) game.addScore(1);
			//console.log("score.value");
			pos[1] = screen_height;
			index = -1;
		}
		
		this.setPosition(pos[0], pos[1]);

		// 바닥과 거의 가까워졌으면 (충돌검사)
		if (pos[1] >= screen_height - 50 && game.playing) {
			if (game.playing && game.man.collision(pos[0] + 20 / 2)) // 충돌했으면
				game.gameOver(game.man);
		}
	};
	
	this.initialize(_game);
}


function Man(_game) {
	
	// 게임객체
	var game;
	
	// 이미지 객체
	var img;
	
	//	위치
	var posx = undefined;
	
	// 타이머
	var timer;
	
	// 미끄러운 정도 (0 에 가까울수록 미끄럽다)
	var slip = 2.0;
	
	// 달리는 방향
	var dir;
	
	// 달리는 모양
	var action = 0;
	
	// 스피드
	var speed = 0;
	
	var step = 1.5;
	var max_speed = 30;
	
	this.initialize = function(_game) {
		
		game = _game;
		
		img = new ImageList("images/man.gif", 84, 150);
		
		img.object.style.position = "absolute";
		img.object.style.top = "-150px";
		
		game.screen.appendChild(img.object);
	};
	
	this.collision = function(dung_x) {
		return (Math.abs(dung_x - (posx + 84 / 2)) < 60);//끝의 숫자값의 따라 충돌정도가 달라짐
	};
	
	this.setLeft = function(x) {
		img.object.style.left = (posx = x) + "px";
	};
	
	this.spawn = function() {

		this.breath();
		if (timer) window.clearInterval(timer);
		timer = window.setInterval(this.breath.bind(this), 75);

		action = 0;
		speed = 0;
		
		img.object.style.top = (game.size[1] - 150) + "px";
		
		img.showImage(0);

		this.setLeft(parseInt((game.size[0] - 84) / 2));
		this.run(null);
	};
	
	this.kill = function() {
	
		if (timer) window.clearInterval(timer);
		timer = null;

		img.showImage(0);
		this.run(null);
	};
	
	this.breath = function() {
		img.showImage(0);
		action = ++action % 2;
	}
	
	this.run = function(_dir) {
		dir = _dir;
		
		if (dir) { // 달리기 시작
			
			this.move(); // 일단 한번 움직이고
			if (timer) window.clearInterval(timer);
			timer = window.setInterval(this.move.bind(this), 50);
			
			// $("debug").innerHTML = dir == Event.KEY_LEFT ? "left" : "right";
			
		} else { // 멈추기 시작
			
			if (game.playing) img.showImage(0);
			// $("debug").innerHTML = "stop";
		}
	};
	
	this.move = function() {
		
		if (!dir) { // 멈춰야 되면
			
			var mul = 0.5;
			
			if (Math.abs(speed) > 10) 
				mul = 1.5;
				
			mul *= slip;
			
			if (speed == 0) {

				this.breath();
				if (timer) window.clearInterval(timer);
				timer = window.setInterval(this.breath.bind(this), 75);
				
				return;
			} else if (speed > 0) {
				speed -= step * mul;
				if (speed < 0) speed = 0;
			} else {
				speed += step * mul;
				if (speed > 0) speed = 0;
			}
			
			action = 0;
			
		} else { // 달리는 중이면
			
			speed += (dir == Event.KEY_LEFT ? -step : step);
			img.showImage(0);
			
			action = ++action % 2;

		}
		
		// 최대속도 제한
		if (speed < -max_speed) speed = -max_speed;
		else if (speed > max_speed) speed = max_speed;
		
		posx = parseInt(posx) + speed;
		
		if (posx > game.size[0] - 90) { // 오른쪽 벽에 부딛혔으면
			posx = game.size[0] - 90
			speed = 0;
		} else if (posx < 0) { // 왼쪽 벽에 부딛혔으면
			posx = 0;
			speed = 0;
		}
		
		this.setLeft(posx);
	}
	
	this.initialize(_game);
}

this.angle = function(){
		var a = document.createElement("div");
		a.style.background = 'yellow';
		a.style.position = 'absolute';
		a.style.left = 200+'px';
		a.style.top = 100+'px';
		a.style.width=700+'px';
		a.style.height=700+'px';
		a.style.zIndex=-100;
		document.body.appendChild(a);
	}

DungGame = Class.create();

DungGame.prototype = {
	
	// 게임이 진행될 스크린
	screen : null,
	
	// 스크린 크기
	size : [ undefined, undefined ],
	
	// 똥객체
	dungs : [ ],
	man : null,
	
	// 왼쪽 버튼 눌리고 있는지
	left : false,
	
	// 오른쪽 버튼 눌리고 있는지
	right : false,
	
	// 가장 최근에 눌린 버튼
	recent : null,
	
	// 게임중
	playing : false,
	
	// 점수판
	score : null,
	
	// 메시지
	message : null,
	msgtimer : null,

	
	initialize : function(screen, number_of_dung, score) {
		this.screen = $(screen);
		this.score = $(score);
		
		Element.makePositioned(this.screen);
		
		with (this.screen.style) {
			overflow = "hidden";
			cursor = "default";;
		}
		
		for (var i = 0; i < number_of_dung; i++)
			this.dungs.push(new Dung(this));
		
		this.man = new Man(this);
		
		Event.observe(this.screen, "keydown", this.onKeyDown.bindAsEventListener(this));
		Event.observe(this.screen, "keyup", this.onKeyUp.bindAsEventListener(this));
		
		this.size = [ this.screen.clientWidth, this.screen.clientHeight ];
		
		this.message = document.createElement("div");
		with (this.message.style) {
			position = "absolute";
			textAlign = "center";

			fontSize = "20px";
			fontFamily = "'Press Start 2P', cursive";

			
		}	
		
		this.screen.appendChild(this.message);
		
		this.gameReady();
	},
	
	addScore : function(value) {
		if (this.score) this.score.value = parseInt(this.score.value) + value;
		if(this.score.value>100){
		this.playing = false;
		this.recent = null;
		this.man.kill();
		this.showMessage("clear!", 1500, this.gameClear.bind(this));
		wrap.style.overflow="visible";
		
		}
	},
	
	showMessage : function(msg, autohide, func) {

		var size;
				
		if (this.msgtimer) window.clearTimeout(this.msgtimer);

		this.msgtimer = null;
		this.image = document.createElement("img")
		this.message.innerHTML = msg;
		this.message.style.textAlign = "center";
		size = [ this.message.offsetWidth, this.message.offsetHeight ];
		//this.message.style.width = 100+"%";
		this.message.style.background = "white";
		this.message.style.left = "calc(50% - "+ this.message.offsetWidth/2 +"px)";
		this.message.style.top = "calc(50% - "+ this.message.offsetWidth/2 +"px)";
		this.message.style.visibility = "visible";
		
		if (autohide) {
			this.msgtimer = window.setTimeout(function() {
				
				this.message.style.visibility = "hidden";
				this.msgtimer = null;
				
				if (func) func();
			}.bind(this), autohide);
		}
	},
	
	
	gameReady : function() {

		
		
		this.showMessage(

			'<div style="margin:0;padding:0;margin-top:0px;"><h1 style="font-size:45px;font-weight:black;margin:0;padding:0; word-spacing:-30px;">STREET TROLL</h1><p style="line-height:30px;margin:0;padding:0;margin-top:20px; font-family:\'Noto Sans KR\', sans-serif;font-weight:400;">회사원 a씨가 길거리 트롤러를<br> 피해 회사에 지각하지 않게 해주세요!<br><span style="color:red;">100점 달성시 게임 클리어!</p></div>' +
			'<div style="font-size:20px; padding:10px 0px; color:red; word-spacing:-5px;">[Press SPACE]</div>'+
			'<div style="font-size:20p;margin:0;padding:0; padding-top:20px;font-family:\'Noto Sans KR\', sans-serif;font-weight:700;""><p style="margin:0;padding:0;">회사원 a씨</p><img src=images/man.gif></div>'+
			'<div style=" height:300px; margin-top:5px;font-family:\'Noto Sans KR\', sans-serif;font-weight:400;"><p style="margin:0;padding:0; font-size:20px;font-weight:700;">-빌런들-</p><div margin:auto;width:100%; height:300px;><div style="display=block;float:left;width:150px;"><img src=images/billun1.gif><p style="margin:0;padding:0;font-size:20px;">팔짱 빌런</p></div><div style="display=blcok; float:left;width:150px;"><img src=images/billun2.gif><p style="margin:0;padding:0;font-size:20px;">담배빵 빌런</p></div><div style="display=blcok; float:left;width:150px;"><img src=images/billun3.gif><p style="margin:0;padding:0;font-size:20px;">칵퉤 빌런</p></div><div style="display=blcok; float:left;width:150px;		"><img src=images/billun4.gif><p style="margin:0;padding:0; font-size:20px;">쓰레기투척 빌런</p></div></div></div>'
			);


			
	},

	gameClear : function() {

		
		
		this.showMessage(

			'<div style="width:130vh;height:130vh;"><div style="width:800px;position:absolute; left:50%;transform:translateX(-50%);top: calc(50% - 130px);  " ><h1 style="line-height:1.3;color:black; font-size:50px;">mission complete!</h1><p style="position:absolute;line-height:50px; color:red;font-size:16px; left:50%;transform:translateX(-50%);">You can scroll down</p><img src="downsc.png" style="positoin:absolute;width:30px;margin-top:50px; left:50%;"></div>'

			);


			
	},
	
	
	gameStart : function() {

		this.size = [ this.screen.clientWidth, this.screen.clientHeight ];
		
		for (var i = 0; i < this.dungs.length; i++)
			this.dungs[i].start(Math.random() * 4000);
		
		this.playing = true;
		this.recent = null;
		this.left = false;
		this.right = false;
		
		if (this.score) this.score.value = "0";
		
		this.man.spawn();
		this.showMessage("READY?", 1500);
	},
	//gameClear : function() {
		
	//		this.game = false;
	//		this.recent = null;
	//		this.man.kill();
	//		this.showMessage("DEAD", 1500, this.gameReady.bind(this));

		

	//},
	
	gameOver : function(t) {

		console.log(t);
		this.playing = false;
		this.recent = null;
		this.man.kill();

		this.showMessage("DEAD", 1500, this.gameReady.bind(this));
	},

	onKeyDown : function(e) {
		
		if (e.keyCode == 32 && !this.playing) {
			this.gameStart();
			return;
		}
		
		if (!this.playing) return;
		if (e.keyCode != Event.KEY_LEFT && e.keyCode != Event.KEY_RIGHT) return;

		this.recent = e.keyCode;
		
		switch (e.keyCode) {
		case Event.KEY_LEFT:
			this.left = true;
			break;
			
		case Event.KEY_RIGHT:
			this.right = true;
			break;
		}
		
		this.man.run(this.recent);
		
		Event.stop(e);
	},
	
	onKeyUp : function(e) {
		
		if (!this.playing) return;
		if (e.keyCode != Event.KEY_LEFT && e.keyCode != Event.KEY_RIGHT) return;
		
		switch (e.keyCode) {
		case Event.KEY_LEFT:
			this.left = false;
			break;
			
		case Event.KEY_RIGHT:
			this.right = false;
			break;
		}
		
		this.recent = null;
		
		if (this.left) this.recent = Event.KEY_LEFT;
		else if (this.right) this.recent = Event.KEY_LEFT;
		
		this.man.run(this.recent);
	}
};
