// JavaScript Document

// left
var key37 = false;  // Makes sure only one request is send each time to the server

// up
var key38 = false;

// right
var key39 = false;

//down
var key40 = false;

/**** wsad ***/
 
// w
var key87 = false;

// a
var key65 = false;

// s
var key88 = false;

// d
var key68 = false;

// x
var key83 = false;



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
        case 87:
			if (key87 == false) {
            		mDown(cam_upkey);
					key87 = true;
			}
            break;
        case 65:
			if (key65 == false) {
            		mDown(cam_leftkey);
					key65 = true;
			}
            break;
        case 83:
			if (key83 == false) {
            		mDown(cam_default);
					key83 = true;
			}
            break;
        case 68:
			if (key68 == false) {
            		mDown(cam_rightkey);
					key68 = true;
			}
            break;
        case 88:
			if (key88 == false) {
            		mDown(cam_downkey);
					key88 = true;
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
        case 87:
            mUp(cam_upkey,false);
			key87 = false;
            break;
        case 65:
            mUp(cam_leftkey,false);
			key65 = false;
            break;
        case 88:
            mUp(cam_downkey,false);
			key88 = false;
            break;    
        case 68:
            mUp(cam_rightkey,false);
			key68 = false;
            break;
        case 83:
            mUp(cam_default,false);
			key83 = false;
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
        
        mUp(cam_upkey,true);
        mUp(cam_leftkey,true);
        mUp(cam_downkey,true);
        mUp(cam_rightkey,true);
        mUp(cam_default,true);
        
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
        
        case "cam_upkey":
			window.PiNet.camMoves[0] = 1;
			break;
		case "cam_leftkey":
			window.PiNet.camMoves[1] = 1;
			break;
		case "cam_downkey":
			window.PiNet.camMoves[2] = 1;
			break;
		case "cam_rightkey":
			window.PiNet.camMoves[3] = 1;
			break;
        case "cam_default":
			window.PiNet.camMoves = [-1,-1,-1,-1];
			window.PiNet.updatekey()
            window.PiNet.camMoves = [0,0,0,0];
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
                
            case "cam_upkey":
				window.PiNet.camMoves[0] = 0;
				break;
			case "cam_leftkey":
				window.PiNet.camMoves[1] = 0;
				break;
			case "cam_downkey":
				window.PiNet.camMoves[2] = 0;
				break;
			case "cam_rightkey":
				window.PiNet.camMoves[3] = 0;
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
        
        
        cam_upkey.addEventListener("touchstart",function() {
			window.PiNet.camMoves[0] = 1;
			window.PiNet.updatekey();
			upkey.style.backgroundColor = "#454545";
		},false);
		
		cam_downkey.addEventListener("touchstart",function() {
			window.PiNet.camMoves[2] = 1;
			window.PiNet.updatekey();
			downkey.style.backgroundColor = "#454545";
		},false);
		
		cam_leftkey.addEventListener("touchstart",function() {
			window.PiNet.camMoves[1] = 1;
			window.PiNet.updatekey();
			leftkey.style.backgroundColor = "#454545";
		},false);
		
		cam_rightkey.addEventListener("touchstart",function() {
			window.PiNet.camMoves[3] = 1;
			window.PiNet.updatekey();
			rightkey.style.backgroundColor = "#454545";
		},false);
        
        cam_default.addEventListener("touchstart",function() {
			window.PiNet.camMoves = [-1,-1,-1,-1];
			window.PiNet.updatekey();
            window.PiNet.camMoves = [0,0,0,0];
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
        
        cam_upkey.addEventListener("touchend",function() {
			window.PiNet.camMoves[0] = 0;
			window.PiNet.updatekey();
			upkey.style.backgroundColor = "#B3B1B2";
		},false);
		
		cam_downkey.addEventListener("touchend",function() {
			window.PiNet.camMoves[2] = 0;
			window.PiNet.updatekey();
			downkey.style.backgroundColor = "#B3B1B2";
		},false);
		
		cam_leftkey.addEventListener("touchend",function() {
			window.PiNet.camMoves[1] = 0;
			window.PiNet.updatekey();
			leftkey.style.backgroundColor = "#B3B1B2";
		},false);
		
		cam_rightkey.addEventListener("touchend",function() {
			window.PiNet.camMoves[3] = 0;
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
        
        
        cam_upkey.addEventListener("mousedown",function()
		{
			mDown(cam_upkey);
		});
		cam_downkey.addEventListener("mousedown",function()
		{
			mDown(cam_downkey);
		});
		cam_rightkey.addEventListener("mousedown",function()
		{
			mDown(cam_rightkey);
		});
		cam_leftkey.addEventListener("mousedown",function()
		{
			mDown(cam_leftkey);
		});
        
        cam_default.addEventListener("mousedown",function()
		{
			mDown(cam_default);
		});
        
	}

});
