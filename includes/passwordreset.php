<link rel="stylesheet" href="css/passwd.css" />
<link rel="stylesheet" href="css/login.css" />
<script src="javascript/passwd.js"> </script>
<div id="resetform">
	<form method="post" action="changepass.php">
    	<p>Old password</p>
    	<input type="password" name="oldPassword" id="oldPassword">
        <p>New password</p>
        <input type="password" name="newPassword" id="newPassword">
        <p>Retype new password</p>
        <input type="password" name="newPasswordAgain" id="newPasswordAgain">
        <br />
        <input type="button" onclick="vlalidate()" value="Submit">
        <a href="index.php">Go back</a>
    </form>
    <div id="Error">
    </div>
</div>