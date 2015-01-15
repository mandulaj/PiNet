// JavaScript Document


$(document).ready(function() {
  $("#submitbutton").click(function(e) {
    e.preventDefault();
    submitForm();
  });
});

/*
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
};*/

function submitForm() {
  var errors = getErrors();

  if (errors) {
    $("#Error").addClass("loginError");
    $("#Error").html(errors);
    return;
  } else {
    $("#Error").removeClass("loginError");
    $("#Error").html("");
  }

  var oldp = $("#oldPassword").val();
  var newp = $("#newPassword").val();
  var newp2 = $("#newPasswordAgain").val();

  $.ajax({
    url: "/user/changepassword",
    type: "POST",
    cache: false,

    dataType: "json",
    data: {
      oldPassword: oldp,
      newPassword: newp
    }
  }).done(function(data) {
    if (data.success) {
      $("#Success").html("The Password has been successfully changed!");
      $("#Success").addClass("passSuccess");
    } else {
      $("#Error").html("Wrong password");
      $("#oldPassword").parent().addClass("has-error");
      $("#Error").addClass("loginError");
    }
  });
}

function checkOldPassword(password) {
  $.ajax({
    url: "/api/checkPassword",
    type: "POST",
    cache: false,

    dataType: "json",
    data: {
      password: password
    }
  }).done(function(data) {
    console.log(data);
  });
}


function getErrors() {
  var error = "";
  $("#Success").html("");
  $("#Success").removeClass("passSuccess");

  var oldp = $("#oldPassword");
  var newp = $("#newPassword");
  var newp2 = $("#newPasswordAgain");

  oldp.parent().removeClass("has-error");
  newp.parent().removeClass("has-error");
  newp2.parent().removeClass("has-error");


  if (oldp.val() === "") {
    oldp.parent().addClass("has-error");
    error += "Enter the old password!<br />";
  }

  if (newp.val() === "") {
    newp.parent().addClass("has-error");
    error += "Enter the new password!<br />";
  }

  if (newp2.val() === "") {
    newp2.parent().addClass("has-error");
    error += "Retype the new password!<br />";
  }

  if (error === "") {
    if (newp.val() != newp2.val()) {
      newp.parent().addClass("has-error");
      newp2.parent().addClass("has-error");
      error += "The new passwords don't match!";
    }
  }
  return error;
}