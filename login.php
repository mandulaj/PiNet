<?php
    require_once("db_login.php");
    include "core/init.php";
    $saltFront = "8ATHAXaVAQEfu86YA2u44awRe9ene2PadEcreM";
    $saltBack = "veswEsusequTHuk2trapEpruyux3z9qeqeFR6p";
    $username = $_POST["username"];
    $password = $_POST["password"];
    
    
    
    if ($username&&$password)
    {
        
        
        $connect = mysqli_connect($HOST_db,$USERNAME_db,$PASSWORD_db,"PiNetLogin") or die("Can't connect to db!");
        $password = hash("sha512",$saltFront.$password.$saltBack);

        $username = mysqli_real_escape_string($connect, $username);
        $quary = mysqli_query($connect,"SELECT * FROM users WHERE username='$username' && password='$password'");
        $numrow = $quary->num_rows;
        
        if ($numrow == 1)
        {
            
			$result = mysqli_fetch_array($quary);
			$_SESSION["user_id"] = $result["id"];
			header("Location: index.php");
			
        } 
        else 
        {
			$_SESSION["passError"] = true;
            echo($username);
            echo("<br />");
            echo($password);
            echo("<br />");
            echo("Username/Password pair wrong!");
	echo($password);
			header("Location: index.php");
        }
    } 
    else 
    {
        echo("Enter the password and username!");
		$_SESSION["valError"] = true;
		header("Location: index.php");
    }
    
?>
