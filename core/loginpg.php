<link rel="stylesheet" href="css/login.css" />
<script type="text/javascript" src="javascript/login.js"> </script>
<div calss="maincontent">
	<div class="loginbox" id="loginbox">
    	<h2> Login </h2>
    	<form method="post" action="login.php">
        	
           <input class="input" id="inputName" type="text" name="username" placeholder="Username">
           <input class="input" id="inputPass" type="password" name="password" onKeyPress="submitEnter(event)" placeholder="Password">
           <input id="submitbutton" type="button" value="Sign In" onClick="submitVal()">

        </form>
        
			
		<div id="Error"></div>
       
    </div>
</div>