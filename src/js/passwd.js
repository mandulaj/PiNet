// JavaScript Document

(function ($, window) {

  $(document).ready(function(){
    $("#submitbutton").click(function(e){
      e.preventDefault();
      submitForm();
    });
  });

  function submitForm(){
    var errors = getErrors();

    if(errors) {
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
        $("#Success").html("Password has been updated!");
        $("#Success").addClass("passSuccess");
      } else {
        $("#Error").html("Wrong password");
        $("#oldPassword").parent().addClass("has-error");
        $("#Error").addClass("loginError");
      }
    });
  }

  function checkOldPassword(password){
    $.ajax({
      url: "/api/checkPassword",
      type: "POST",
      cache: false,

      dataType: "json",
      data: {
        password: password
      }
    }).done(function(data) {
      console.log(data)
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


})($, window)
