// JavaScript Document
var Dragging = false;
var is_touch_device = 'ontouchstart' in document.documentElement;



$(function() {
    $( "#grabthing" ).draggable({
		axis: "y",
		containment: 'parent',
		drag: function( event, ui ) {updateVal();},
		start: function( event, ui ) {Dragging = true;},
		stop: function( event, ui ) {setTimeout(function(){Dragging = false;},10);}
	});
 });


 
var updateVal = function() {
	var top = slidthing.style.top;
	top = top.replace("px","");
	top = 374 - top.valueOf();
	var percent = 100*(top/374);
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
});
