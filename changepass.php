<?php
	echo "Hi";
	include "core/init.php";
	require_once("db_login.php");
	$saltFront = "8ATHAXaVAQEfu86YA2u44awRe9ene2PadEcreM";
    $saltBack = "veswEsusequTHuk2trapEpruyux3z9qeqeFR6p";
	$user_id = $_SESSION["user_id"];
	echo "Hi";
	if(isset($_POST["oldPassword"]) && isset($_POST["newPassword"]) && $user_id){
		$oldPass = $_POST["oldPassword"];
		$newPass = $_POST["newPassword"];
		
		$connect = mysqli_connect($HOST_db,$USERNAME_db,$PASSWORD_db,"PiNetLogin") or die("Can't connect to db!");
		$oldPass = hash("sha512",$saltFront.$oldPass.$saltBack);
		$newPass = hash("sha512",$saltFront.$newPass.$saltBack);
		
		$quary = mysqli_query($connect,"SELECT * FROM users WHERE id='$user_id' && password='$oldPass'");
		$numrow = $quary->num_rows;
        
        if ($numrow == 1)
        {
			$quary = mysqli_query($connect,"UPDATE users SET password='$newPass' WHERE id='$user_id'");
			header("Location: index.php");
		}
		else
		{
			$_SESSION["passError"] = true;
			header("Location: index.php?changepassword=true");
		}
	}
	else
	{
		$_SESSION["valError"] = true;
		header("Location: index.php?changepassword=true");
	}
?>


