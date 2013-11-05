<link rel="stylesheet" href="css/login.css" />
<script type="text/javascript" src="javascript/login.js"> </script>
<div calss="maincontent">
	<div class="loginbox" id="loginbox">
    	<h2> Login </h2>
    	<form method="post" action="login.php">
        	
            <table>
                <tr>
                    <td>Username:</td>
                    <td><input id="inputName" type="text" name="username"></td>
                </tr>
                <tr>
                    <td>Password:</td>
                    <td><input id="inputPass" type="password" name="password"></td>
                </tr>
                <tr>
                    <td>&nbsp;</td>
                    <td><input id="submitbutton" type="button" value="Sign In" onClick="submitVal()"></td>
                </tr>
            </table>

       
            
        </form>
        
			
		<div id="Error"></div>
       
    </div>
</div>