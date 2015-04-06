// JavaScript Document

(function ($, window) {
  // Initialization
  $(document).ready(function(){
    $("#submitbutton").click(function(e){
      e.preventDefault();
      submitForm();
    });
  });

  /**
   * Checks the values and sends them the server
  */
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

  // TODO: implement cb function
  /**
   * Checks the old password with the server
   * @param{string} password The old password being checked with the server
   * @param{function(boolean)} cb callback function with the status of the password (True if correct)
  */
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

  /**
   * Collects all the errors
   * @return{string} string of all the errors found
  */
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
