// JavaScript Document
var Dragging = false;
var is_touch_device = 'ontouchstart' in document.documentElement;
var sideBar = 0
var lightStatus = 0
var aiStatus =0;

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


 
var updateVal = function() {
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
	updatekey();
}


$("#grabthing").mousedown(function() {
	console.log("down");
    $(window).mousemove(function() {
		updateVal();
		console.log("move");
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
		if(lightStatus == 0)
		{
			lightStatus = 1;
			updatekey()
			$(".lightSwitch").css("background-color","#FFF")
			$(".lightSwitch").html("On")
		}
		
		else if(lightStatus == 1)
		{
			lightStatus = 2;
			updatekey();
			$(".lightSwitch").css("background-color","rgb(123, 238, 33)")
			$(".lightSwitch").html("Auto")
		}
		else if(lightStatus == 2)
		{
			lightStatus = 0;
			updatekey()
			$(".lightSwitch").css("background-color","#111")
			$(".lightSwitch").html("Off")
		}
	});
	
	$(".ai").click(function(){
		if(aiStatus == 0)
		{
			aiStatus = 1;
			updatekey()
			$(".ai").css("background-color","rgb(138, 0, 0)")
			$(".ai").html("On")
		}
		else
		{
			aiStatus = 0;
			updatekey()
			$(".ai").css("background-color","#111")
			$(".ai").html("Off")
		}
	});
	
	

});
