// JavaScript Document


$(document).ready(function() {
  var errorbox = $("#Error");
  $("#submitbutton").click(submitValues);
});

function nameEnter(e) {
  if (e.keyCode === 13) {
    e.preventDefault();
    var input = $("#inputName");
    if (input.val()) {
      $("#inputPass").focus();
    }
  }
}

function submitEnter(e) {
  if (e.keyCode == 13) {
    submitValues(e);
  }
}

var submitValues = function(event) {
  if (event) event.preventDefault();
  var errorMsg = "";
  var errorbox = $("#Error");
  var username = $("#inputName").val();
  var password = $("#inputPass").val();
  var form = document.getElementsByTagName("form");
  if (!username) {
    errorMsg += "You forgot the username!<br />";
  }
  if (!password) {
    errorMsg += "You forgot the password!<br />";
  }
  if (errorMsg) {
    errorbox.html(errorMsg);
    errorbox.addClass("loginError");
  } else {
    errorbox.html("");
    errorbox.removeClass("loginError");
    $.ajax({
      url: "/login",
      type: "POST",
      cache: false,
      //contentType: 'application/json',
      dataType: "json",
      data: {
        username: username,
        password: password
      }
    }).done(function(data) {
      if (!data.login) {
        errorbox.html("No such user-password combination!");
        errorbox.addClass("loginError");
      } else {
        sessionStorage.setItem("token", data.token);
        window.location.replace("/user");
      }
    });
  }
};