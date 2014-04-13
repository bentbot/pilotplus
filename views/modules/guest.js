function showGuest () {
  $('.guest').html('');
  var guesthtml = '<div class="row guestpanels">'+
        '<div class="col-md-4"><i class="fa fa-lock"></i><h1 data-translate="safe">Safe</h1><p data-translate="safebody">Encryption and dual factor authorization to protect your funds.</p></div>'+
        '<div class="col-md-4"><i class="fa fa-flag"></i><h1 data-translate="instant">Fast</h1><p data-translate="instantbody">Instantly deposit, trade, and withdrawal with Bitcoin.</p></div>'+
        '<div class="col-md-4"><span data-translate="fiaticon"><i class="fa fa-usd"></i></span><h1 data-translate="options">Options</h1><p data-translate="optionsbody">Trade on exchange rates, crypto currencies, stocks, and more.</p></div>'+
      '</div>'+
      '<div class="signupbox well">'+
      '<form>'+
      '<div class="input-group">'+
          '<input type="username" class="form-control username" placeholder="Username">'+
          '<i class="fa usernamei"></i>'+
          '<input type="email" class="form-control email" placeholder="Email">'+
          '<i class="fa emaili"></i>'+
          '<input type="password" class="form-control pwd" placeholder="Password">'+
          '<i class="fa passwordi"></i>'+
          '<button type="button" value="Register" class="btn btn-large btn-blue signupbtn" data-translate="signup">Sign Up</button>'+
        '</div>'+
      '<form>'+
      '</div>';
  $('.guest').append(guesthtml);
}
$(function () {

$.ajax({
      url: "signupsopen/",
      cache: false
    }).done(function( resp ) {
      if (resp != 'OK') $('.signupbox').removeClass('well').html('<div class="alert alert-warning"><strong data-translate="inviteonly">No Goats Allowed:</strong> <span data-translate="registrationsdisabled">New registrations are currently disabled.</span> <a class="btn btn-warning alertbtn" id="invitebtn"href="#" data-translate="haveaninvite">Have an Invite?</a></div>');
   });

  $(".hook").on("keyup",".username",function(e) {
    var user = $(".username").val();
    if (user) {
    $.ajax({
      url: "checkusername/"+user,
      cache: false
    }).done(function( resp ) {
      if (resp == 'OK') $('.input-group .usernamei').removeClass('red fa-times').addClass('green fa-check');
      if (resp == 'NO') $('.input-group .usernamei').removeClass('green fa-check').addClass('red fa-times');
    });
  }
  });  
  $(".hook").on("keyup",".email",function(e) {
    var email = $(".email").val();
    if (email) {
    $.ajax({
      url: "checkemail/"+email,
      cache: false
    }).done(function( resp ) {
    $('input-group .emaili').addClass('orange fa-times');
      if (resp == 'OK') $('.input-group .emaili').removeClass('orange fa-times').addClass('green fa-check');
      if (resp == 'NO') $('.input-group .emaili').removeClass('green fa-check').addClass('orange fa-times');
    });  
  }
  });  
  $(".hook").on("keyup",".pwd",function(e) {
    var pwd = $(".pwd").val();
    if (pwd) {
    $.ajax({
      url: "checkpass/"+pwd,
      cache: false
    }).done(function( resp ) {
      $('input-group .emaili').addClass('red fa-exclamation');
      if (resp == 'OK') $('.input-group .passwordi').removeClass('red fa-exclamation').addClass('green fa-check');
      if (resp == 'NO') $('.input-group .passwordi').removeClass('green fa-check').addClass('red fa-exclamation');
   });
  }
  });

  $(".hook").on("click",".signupbtn",function(e) {    
    var un = $(".username").val();
    var em = $(".email").val();
    var pwd = $(".pwd").val();
    if (un && em && pwd) {
    console.log('ajax out:'+un+':'+em+':'+pwd);
    $.ajax({
      url: "adduser/"+un+"/"+em+"/"+pwd,
      cache: false
      }).done(function( resp ) {
        console.log('ajax in: '+resp);
        if (resp == 'OK') {
          $('.input-group .username').css('margin-left', '8%');
          $('.input-group i').css('width', '0%');
          $('.signupbtn').removeClass('btn-blue').removeClass('btn-warning').addClass('btn-success').html('<i class="fa fa-magic"></i> <span data-translate="settingup">Setting Up</span>');
          setTimeout(function(){
              $.ajax({
                url: "login/"+un+"/"+pwd,
                cache: false
                }).done(function( resp ) {
                  if (resp == 'OK') {
                    $('.signupbtn').html('<i class="fa fa-magic"></i> <span data-translate="loggingin">Logging On</span>');
                    setTimeout(function(){location.reload();},750);
                  }
                });
          },1500);
          //login();
        } else {
          $('.signupbtn').removeClass('btn-blue').addClass('btn-warning').html('<i class="fa fa-times"></i> '+resp);
          setTimeout(function(){$('.signupbtn').addClass('btn-blue').removeClass('btn-warning').html('Sign Up');},3550);
        }
      });
      }
    });
});