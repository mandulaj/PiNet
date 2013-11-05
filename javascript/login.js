// JavaScript Document


window.onload = function(){
	var errorbox = document.getElementById("Error");
	console.log(passErr);
	if (valErr){
		errorbox.innerHTML = "You forgot to enter the username or password!";
		errorbox.setAttribute( "class", "loginError" );
	}
	if (passErr){
		console.log("in");
		errorbox.innerHTML = "No such user-password combination.";
		errorbox.setAttribute( "class", "loginError" );
		
	}
}


var submitVal = function()
{
	var Error = ""
	var errorbox = document.getElementById("Error");
	var user = document.getElementById("inputName").value;
	var pass = document.getElementById("inputPass").value;
	var form = document.getElementsByTagName("form");
	if (!user){
		Error += "You forgot the username!<br />";
	}
	
	if (!pass){
		Error += "You forgot the password!<br />";
	}
	
	if(!Error)
	{
		if(errorbox.className == "loginError"){
			errorbox.removeAttribute("class");
			errorbox.innerHTML = "";
		}
		form[0].submit();
		
	}
	else
	{
		
		errorbox.innerHTML = Error;
		errorbox.setAttribute( "class", "loginError" );
	}
}