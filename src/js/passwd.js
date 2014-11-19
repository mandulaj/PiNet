// JavaScript Document

window.onload = function() {
  var errorbox = document.getElementById("Error");
  if (valErr) {
    errorbox.innerHTML = "You forgot to enter the passwods!";
    errorbox.setAttribute("class", "dataError");
  }
  if (passErr) {
    errorbox.innerHTML = "Wrong password.";
    errorbox.setAttribute("class", "dataError");

  }
};


function vlalidate() {
  var error = "";
  var errorbox = document.getElementById("Error");
  var oldp = document.getElementById("oldPassword");
  var newp = document.getElementById("newPassword");
  var newp2 = document.getElementById("newPasswordAgain");
  var form = document.getElementsByTagName("form");
  if (oldp.value === "") {
    error += "Enter the old password!<br />";
  }

  if (newp.value === "") {
    error += "Enter the new password!<br />";
  }

  if (newp2.value === "") {
    error += "Retype the new password!<br />";
  }

  if (error === "") {
    if (newp.value == newp2.value) {
      if (errorbox.className == "dataError") {
        errorbox.removeAttribute("class");
        errorbox.innerHTML = "";
      }
      form[0].submit();

    } else {
      error += "The new password don't match!";
    }
  }
  if (error) {
    errorbox.innerHTML = error;
    errorbox.setAttribute("class", "dataError");
  }
}