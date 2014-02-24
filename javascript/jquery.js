// JavaScript Document
var Dragging = false;
var is_touch_device = 'ontouchstart' in document.documentElement;
var sideBar = 0;
var recordings = 0;
//var lightStatus = 0;
//var aiStatus = 0;
//var recStatus = 0;
//var recordings = [];

function Robot()
{
	thisObj = this;
	this.keylist = [0,0,0,0];
	this.power = 100;
	this.lightStatus = 0;
	this.aiStatus = 0;
	this.recStatus = 0;
	this.recordings = [];
	
	this.socket = io.connect(window.location.origin+":8081");
	this.socket.on("roger",function(data){
		thisObj.socket.emit("affirmative",{time:data.time});
	});
	
	this.KeyHash = this.getCookie("keyhash");
	if (this.KeyHash == "" || this.KeyHash.length != 128)
	{
		this.KeyHash = "";
		alert("Failed to authenticate!")
	}
}

Robot.prototype.getCookie = function(c_name)
{
	var c_value = document.cookie;
	var c_start = c_value.indexOf(" " + c_name + "=");
	if (c_start == -1)
	{
		c_start = c_value.indexOf(c_name + "=");
	}
	if (c_start == -1)
	{
		c_value = null;
	}
	else
	{
	  	c_start = c_value.indexOf("=", c_start) + 1;
	  	var c_end = c_value.indexOf(";", c_start);
	  	if (c_end == -1)
	  	{
			c_end = c_value.length;
		}
		c_value = unescape(c_value.substring(c_start,c_end));
	}
	return c_value;
}

Robot.prototype.updatekey = function() 
{
	var dataToSend = this.keylist;
	if (this.keylist[1] == 1 && this.keylist[3] == 1){
		dataToSend[1] = 0;
		dataToSend[3] = 0;
	}
	if (this.keylist[0] == 1 && this.keylist[2] == 1){
		dataToSend[0] = 0;
		dataToSend[2] = 0;
	}
	
	var string_to_send = dataToSend.join("");
	
	if ( this.recStatus == 1 )
	{
		
	}
	this.socket.emit("commands",{
		Hash: this.KeyHash,
		Key: string_to_send,
		Speed:  this.power,
		ai: this.aiStatus,
		light: this.lightStatus
	});
}

Robot.prototype.addNewRecording = function()
{
	var name = new Date().toLocaleTimeString("en-GB")
	if(	this.recordings.length > 5	)
	{
		this.recordings.shift();
	}
	this.recordings.push( new Recording(name) );
}

Robot.prototype.drawRecordings = function()
{
	if ( this.recordings.length == 0 )
	{
		$("#rec_window_content").html("No recordings Yet!");
	}
	else
	{
		$("#rec_window_content").html("");
	}
	for ( var i = 0; i < this.recordings.length; i++ )
	{
		console.log(i);
		$("#rec_window_content").append("<div><span id='rec_name'>"+this.recordings[i].name+"</span> <span id='rec_date'>"+this.recordings[i].date + "</span> <div id='rec_startstop' onClick='PiNet.recordings["+i+"].start(this)'></div>");
	}
}

Robot.prototype.stopAllMissions = function()
{
	for ( var i = 0; i < this.recordings.length; i++ )
	{
		this.recordings[i].hardStop()
	}
}

$(document).ready(function()
{
	$(".cover").fadeOut(500)
	window.PiNet = new Robot();
});

$(function() {
    $( "#grabthing" ).draggable({
		axis: "y",
		containment: 'parent',
		grid: [0,20],
		drag: function( event, ui ) {updateVal();},
		start: function( event, ui ) {Dragging = true;},
		stop: function( event, ui ) {setTimeout(function(){Dragging = false;},10);}
	});
 });


 
function updateVal() {
	var top = slidthing.style.top;
	top = top.replace("px","");
	top = 400 - top.valueOf();
	var percent = 100*(top/400);
	percent = Math.floor(percent+0.5);
	if (percent >= 90)
	{
		slidthing.childNodes[0].style.color = "#F00";
	}
	else
	{
		slidthing.childNodes[0].style.color = "#000";
	}
	slidthing.childNodes[0].innerHTML = percent+"%";
	power = percent;
	window.PiNet.updatekey();
}


$("#grabthing").mousedown(function() {
    $(window).mousemove(function() {
		updateVal();
    });
})

$(document).ready(function(e) {
    updateVal();
	
	$(".showsidebar").click(function(){
		if(sideBar == 0)
		{
			$(".sideBar").animate({
				left: "+=110"
			},1000,function(){
				$(".showsidebar>span").html("&lt;")
			});
			sideBar = 1
		}
		else
		{
			$(".sideBar").animate({
			left: "-=110"
			
			},1000,function(){
				$(".showsidebar>span").html("&gt;")	
			});
			sideBar = 0
		}
	});
	
	$(".lightSwitch").click(function(){
		if(window.PiNet.lightStatus == 0)
		{
			window.PiNet.lightStatus = 1;
			window.PiNet.updatekey()
			$(".lightSwitch").css("background-color","#FFF")
			$(".lightSwitch").html("On")
		}
		
		else if(window.PiNet.lightStatus == 1)
		{
			window.PiNet.lightStatus = 2;
			window.PiNet.updatekey();
			$(".lightSwitch").css("background-color","rgb(123, 238, 33)")
			$(".lightSwitch").html("Auto")
		}
		else if(window.PiNet.lightStatus == 2)
		{
			window.PiNet.lightStatus = 0;
			window.PiNet.updatekey()
			$(".lightSwitch").css("background-color","#111")
			$(".lightSwitch").html("Off")
		}
	});
	
	$(".ai").click(function(){
		if(window.PiNet.aiStatus == 0 && window.PiNet.recStatus == 0  && recordings == 0)
		{
			window.PiNet.aiStatus = 1;
			window.PiNet.updatekey()
			$(".ai").css("background-color","rgb(138, 0, 0)")
			$(".ai").html("On")
		}
		else
		{
			window.PiNet.aiStatus = 0;
			window.PiNet.updatekey()
			$(".ai").css("background-color","#111")
			$(".ai").html("Off")
		}
	});
	
	$(".rec").click(function(){
		if(window.PiNet.recStatus == 0 && window.PiNet.aiStatus == 0  && recordings == 0)
		{
			window.PiNet.addNewRecording()
			window.PiNet.recStatus = 1;
			$(".rec").css("background-color","rgb(255, 40, 40)").css("-webkit-animation","rec 3s infinite")
			$(".rec").html("On");
			$("#recIndic").fadeIn(200);
			
		}
		else
		{
			window.PiNet.recStatus = 0;
			$(".rec").css("background-color","#111").css("-webkit-animation","none 3s infinite")
			$(".rec").html("Off")
			$("#recIndic").fadeOut(200);
		}
	});
	
	$(".rec_view").click(function(){
		if(window.PiNet.recStatus == 0 && window.PiNet.aiStatus == 0 && recordings == 0)
		{
			recordings = 1;
			window.PiNet.drawRecordings()
			$(".rec_window").fadeIn(500);
		}
		else
		{
			recordings = 0;
			PiNet.stopAllMissions()
			$(".rec_window").fadeOut(500);
		}
	});
	
	$("#rec_window_close").click(function(){
		recordings = 0;
		$(".rec_window").fadeOut(500);
		PiNet.stopAllMissions()
	});

});

