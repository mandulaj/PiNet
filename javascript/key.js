// JavaScript Document

var keylist = [0,0,0,0];
var power = 100;


function getCookie(c_name)
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

KeyHash = getCookie("keyhash");
if (KeyHash == "" || KeyHash.length != 128)
{
	KeyHash = "";
}


function makeURL(keys,power) 
{
	var url = document.URL.split("/");
	url = url[0] + "//"+url[2];
	url += ":8081?move="+keys+"&pow="+power+"&hash="+KeyHash;
	return url
}

function updatekey() 
{
	dataToSend = keylist;
	if (keylist[1] == 1 && keylist[3] == 1){
		dataToSend[1] = 0;
		dataToSend[3] = 0;
	}
	if (keylist[0] == 1 && keylist[2] == 1){
		dataToSend[0] = 0;
		dataToSend[2] = 0;
	}
	
	var string_to_send = dataToSend.join("");
	url = makeURL(string_to_send,power);
	request.open("GET",url,true);
	request.send()
	
}




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
		keylist = [0,0,0,0];
		mUp(leftkey,true);
		mUp(upkey,true);
		mUp(rightkey,true);
		mUp(downkey,true);
		updatekey();
		console.log("mup")
	}
},false);



function mDown(obj) { //fires when key is pressed
	switch (obj.id) {
		case "upkey":
			keylist[0] = 1;
			break;
		case "leftkey":
			keylist[1] = 1;
			break;
		case "downkey":
			keylist[2] = 1;
			break;
		case "rightkey":
			keylist[3] = 1;
			break;
		
	}
	updatekey()
	obj.style.backgroundColor = "#454545";
}

function mUp(obj, all_element) { //fires when key is released
	if (all_element == false)  {
		switch (obj.id) {
			case "upkey":
				keylist[0] = 0;
				break;
			case "leftkey":
				keylist[1] = 0;
				break;
			case "downkey":
				keylist[2] = 0;
				break;
			case "rightkey":
				keylist[3] = 0;
				break;
		}
		updatekey()
	}
	obj.style.backgroundColor = "#B3B1B2";
}

$(document).ready(function(e) {
	
	if(is_touch_device)
	{
		
		upkey.addEventListener("touchstart",function() {
			keylist[0] = 1;
			updatekey();
			upkey.style.backgroundColor = "#454545";
		},false);
		
		downkey.addEventListener("touchstart",function() {
			keylist[2] = 1;
			updatekey();
			downkey.style.backgroundColor = "#454545";
		},false);
		
		leftkey.addEventListener("touchstart",function() {
			keylist[1] = 1;
			updatekey();
			leftkey.style.backgroundColor = "#454545";
		},false);
		
		rightkey.addEventListener("touchstart",function() {
			keylist[3] = 1;
			updatekey();
			rightkey.style.backgroundColor = "#454545";
		},false);
	
		
		
		
		upkey.addEventListener("touchend",function() {
			keylist[0] = 0;
			updatekey();
			upkey.style.backgroundColor = "#B3B1B2";
		},false);
		
		downkey.addEventListener("touchend",function() {
			keylist[2] = 0;
			updatekey();
			downkey.style.backgroundColor = "#B3B1B2";
		},false);
		
		leftkey.addEventListener("touchend",function() {
			keylist[1] = 0;
			updatekey();
			leftkey.style.backgroundColor = "#B3B1B2";
		},false);
		
		rightkey.addEventListener("touchend",function() {
			keylist[3] = 0;
			updatekey();
			rightkey.style.backgroundColor = "#B3B1B2";
		},false);
	}
	else
	{
		upkey.addEventListener("mousedown",function()
		{
			mDown(upkey);
			console.log("up");
		});
		downkey.addEventListener("mousedown",function()
		{
			mDown(downkey);
			console.log("down");
		});
		rightkey.addEventListener("mousedown",function()
		{
			mDown(rightkey);
			console.log("left");
		});
		leftkey.addEventListener("mousedown",function()
		{
			mDown(leftkey);
			console.log("right");
		});
	}

});