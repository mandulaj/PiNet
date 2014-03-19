// JavaScript Document

var key37 = false;  // Makes sure only one request is send each time to the server
var key38 = false;
var key39 = false;
var key40 = false;



document.addEventListener("keydown", function() 
{
    switch (window.event.keyCode) {
        case 37:
				if (key37 == false) {
            		mDown(leftkey);
					key37 = true; //Sets key-press to true
				}
            	break;
        case 38:
			if (key38 == false) {
            		mDown(upkey);
					key38 = true;
			}
            break;
        case 39:
			if (key39 == false) {
            		mDown(rightkey);
					key39 = true;
			}
            break;
        case 40:
			if (key40 == false) {
            		mDown(downkey);
					key40 = true;
			}
            break;
    }
},false);


document.addEventListener("keyup",function() 
{
	 switch (window.event.keyCode) 
	 {
        case 37:
            mUp(leftkey,false);
			key37 = false; //Sets the key-press back to false
            break;
        case 38:
            mUp(upkey,false);
			key38 = false;
            break;
        case 39:
            mUp(rightkey,false);
			key39 = false;
            break;
        case 40:
            mUp(downkey,false);
			key40 = false;
            break;
	 }
},false);




document.addEventListener("mouseup", function() { //fires when mouse is released clearing all the other buttons.
	if (!Dragging && !is_touch_device){
		window.PiNet.keylist = [0,0,0,0];
		mUp(leftkey,true);
		mUp(upkey,true);
		mUp(rightkey,true);
		mUp(downkey,true);
		window.PiNet.updatekey();
	}
},false);



function mDown(obj) { //fires when key is pressed
	switch (obj.id) {
		case "upkey":
			window.PiNet.keylist[0] = 1;
			break;
		case "leftkey":
			window.PiNet.keylist[1] = 1;
			break;
		case "downkey":
			window.PiNet.keylist[2] = 1;
			break;
		case "rightkey":
			window.PiNet.keylist[3] = 1;
			break;
		
	}
	window.PiNet.updatekey()
	obj.style.backgroundColor = "#454545";
}

function mUp(obj, all_element) { //fires when key is released
	if (all_element == false)  {
		switch (obj.id) {
			case "upkey":
				window.PiNet.keylist[0] = 0;
				break;
			case "leftkey":
				window.PiNet.keylist[1] = 0;
				break;
			case "downkey":
				window.PiNet.keylist[2] = 0;
				break;
			case "rightkey":
				window.PiNet.keylist[3] = 0;
				break;
		}
		window.PiNet.updatekey()
	}
	obj.style.backgroundColor = "#B3B1B2";
}

$(document).ready(function(e) {
	
	if(is_touch_device)
	{
		
		upkey.addEventListener("touchstart",function() {
			window.PiNet.keylist[0] = 1;
			window.PiNet.updatekey();
			upkey.style.backgroundColor = "#454545";
		},false);
		
		downkey.addEventListener("touchstart",function() {
			window.PiNet.keylist[2] = 1;
			window.PiNet.updatekey();
			downkey.style.backgroundColor = "#454545";
		},false);
		
		leftkey.addEventListener("touchstart",function() {
			window.PiNet.keylist[1] = 1;
			window.PiNet.updatekey();
			leftkey.style.backgroundColor = "#454545";
		},false);
		
		rightkey.addEventListener("touchstart",function() {
			window.PiNet.keylist[3] = 1;
			window.PiNet.updatekey();
			rightkey.style.backgroundColor = "#454545";
		},false);
	
		
		
		
		upkey.addEventListener("touchend",function() {
			window.PiNet.keylist[0] = 0;
			window.PiNet.updatekey();
			upkey.style.backgroundColor = "#B3B1B2";
		},false);
		
		downkey.addEventListener("touchend",function() {
			window.PiNet.keylist[2] = 0;
			window.PiNet.updatekey();
			downkey.style.backgroundColor = "#B3B1B2";
		},false);
		
		leftkey.addEventListener("touchend",function() {
			window.PiNet.keylist[1] = 0;
			window.PiNet.updatekey();
			leftkey.style.backgroundColor = "#B3B1B2";
		},false);
		
		rightkey.addEventListener("touchend",function() {
			window.PiNet.keylist[3] = 0;
			window.PiNet.updatekey();
			rightkey.style.backgroundColor = "#B3B1B2";
		},false);
	}
	else
	{
		upkey.addEventListener("mousedown",function()
		{
			mDown(upkey);
		});
		downkey.addEventListener("mousedown",function()
		{
			mDown(downkey);
		});
		rightkey.addEventListener("mousedown",function()
		{
			mDown(rightkey);
		});
		leftkey.addEventListener("mousedown",function()
		{
			mDown(leftkey);
		});
	}

});

function getStatus()
{
	
}




/* Recording object ***/
function Recording(name,socket)
{
	this.name = name;
    this.socket = socket;
	this.date = new Date().toLocaleTimeString("en-GB")
	this.moves = []
	this.status = "stop"
    this.time = 0;
}

Recording.prototype.add = function(moves)
{
    if(this.moves.length != 0)
    {
        var date = new Date;
        var timeNow = date.getTime();
        var timeDiff = timeNow - this.time;
        this.time = timeNow;
        this.moves[this.moves.length - 1].setTimeDelay(timeDiff);
    }
    else
    {
        var date = new Date;
        this.time = date.getTime();
    }
    this.moves.push(moves)
	
}

Recording.prototype.start = function(obj)
{
    var thisObj = this;
	this.startButton = obj;
	if( this.status == "start")
	{
		this.socket.emit("mission",{"status":"stop"});
        this.status = "stop";
		$(obj).css("background-image","url(images/videoplay.png)")	
	}
	else if ( this.status == "stop" )
	{
		this.status = "start";
        this.socket.emit("mission",window.JSON.stringify(this.moves));
		$(obj).css("background-image","url(images/videostop.png)")	
	}
}

Recording.prototype.hardStop = function()
{
	this.status = "stop";
    
}

Recording.prototype.stopLastRecord = function()
{
    var date = new Date;
    var timeNow = date.getTime()/1000;
    var timeDiff = timeNow - this.time;
    
    this.moves[this.moves.length.setStop(timeDiff)]
}

function Move(move)
{
    this.direction = move.direction;
    this.speed = move.speed;
    this.light = move.light;
    this.delay = 0;   
}

Move.prototype.setTimeDelay = function(delay)
{
    this.delay = delay;
}

Move.prototype.setStop = function(delay)
{
    this.delay = delay;
}