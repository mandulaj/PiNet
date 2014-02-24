<!DOCTYPE html5>
<?php
	include "core/init.php";
	
	$loggedin = isset($_SESSION["user_id"]);
	
	$valErr = isset($_SESSION["valError"]);
	$passErr = isset($_SESSION["passError"]);
	
	if($loggedin)
	{
		$filename = "./hash.openit";
		if(file_exists($filename))
		{
			$file = fopen($filename,"r") or die("Error opening hash.openit.");
			$contentOfFile = fread($file,filesize($filename));
			fclose($file);
			if(strlen($contentOfFile) == 128)
			{
				setcookie("keyhash",$contentOfFile,time()+60*60*24);
			}
			else
			{
				die("Couldn't set cookie");
			}	
		}
		else
		{
			die("Can't find hash.openit.");
		}
	}
	else
	{
		setcookie("keyhash","",time()+60*60*24);
	}
		
?>
<html>
<head>
	<?php
	if($loggedin)
	{
		if(isset($_GET["changepassword"]))
		{
			include "core/changepasshead.php";
		}
		else
		{
			include "core/controlhead.php";	
		}
	}
	else
	{
		include "includes/stdhead.php";
	}
	
	if($valErr){
		echo "<script>valErr = true;</script>";
	}else{
		echo "<script>valErr = false;</script>";
	}
	
	if($passErr){
		echo "<script>passErr = true;</script>";
	}else{
		echo "<script>passErr = false;</script>";
	}
	?>
    <link href="css/style.css" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/> 
</head>


	<body unselectable="on">
    	<div id="top">
			<h1>Welcome to PiNet control room</h1>
            <?php
				if ($loggedin){
					echo "<a href='index.php?changepassword=true' id='chpassword'>Change Password</a>";
					echo "<div id='recIndic' style='display: none;'></div>";
					echo "<a href='logout.php' id='logout'>Logout</a>";
				}		
			?>
        </div>
        
        <?php
		if ($loggedin)
		{
			if(isset($_GET["changepassword"]))
			{
				include "includes/passwordreset.php";
			}
			else
			{
				include "core/controlroom.php";
			}
		}
		else
		{
			include "core/loginpg.php";
		}
		
		?>
        
	</body>
</html>
