function showGuest () {
  var localcurrency = 'Canadian Dollar';
  $('.guest').html('');
  var guesthtml = '<div class="tradesbody"></div>'+
      '<div class="row guestpanels">'+
        '<div class="col-md-4"><i class="fa fa-lock" style="color: #FF9800 !important;"></i><h1 data-translate="safe">Super Safe</h1><p data-translate="safebody">Encryption and dual factor authorization so only you can access your funds.</p></div>'+
        '<div class="col-md-4"><i class="fa fa-bolt" style="color: #00BCD4 !important;"></i><h1 data-translate="instant">Lightning Fast</h1><p data-translate="instantbody">Instantly deposit, trade, and withdrawal with '+localcurrency+' and Bitcoin.</p></div>'+
        '<div class="col-md-4"><span data-translate="fiaticon"><i class="fa fa-usd"></i></span><h1 data-translate="options">Instantly Profitable</h1><p data-translate="optionsbody">Profit in seconds by trading on exchange rates, crypto currencies, stocks, and more.</p></div>'+
      '</div>'+
      '<div class="signupbox well">'+
      '<form autocomplete="false">'+
      '<div class="input-group">'+
          '<input type="username" autocomplete="false" class="form-control username" placeholder="Username">'+
          '<i class="fa usernamei"></i>'+
          '<input type="email" autocomplete="false" class="form-control email" placeholder="Email">'+
          '<i class="fa emaili"></i>'+
          '<input type="password" autocomplete="false" class="form-control pwd" placeholder="Password">'+
          '<i class="fa passwordi"></i>'+
          '<button type="button" value="Register" class="btn btn-large btn-blue signupbtn" data-translate="signup">Sign Up</button>'+
        '</div>'+
        '<p><input type="checkbox" id="termsbox" name="terms"> I accept the <a href="#" id="terms">terms and conditions</a>, and I understand this service is not guaranteed.</p>'+
      '<form>'+
      '</div>';
  $('.guest').append(guesthtml);
  //showChat();
  //showactive();
  $.ajax({
      url: "/signupsopen/",
      cache: false
    }).done(function( resp ) {
      if (resp != 'OK') $('.signupbox').html('<strong data-translate="inviteonly">No New Registrations Accepted.</strong> <span data-translate="registrationsdisabled">New registrations are currently disabled.</span> <a class="btn btn-warning alertbtn" style="display:none;" id="invitebtn" href="#" data-translate="haveaninvite">Have an Invite?</a>');
   });

  }
$(function () {
  var validemail = false;

  $(".hook").on("keyup",".username",function(e) {
    $('.signupbox p').show();
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
    $('.signupbox p').show();
    var email = $(".email").val();
    if (email) {
    $.ajax({
      url: "checkemail/"+email,
      cache: false
    }).done(function( resp ) {
    $('input-group .emaili').addClass('orange fa-times');
      if (resp == 'OK') {
        $('.input-group .emaili').removeClass('orange fa-times').addClass('green fa-check');
        validemail = true;
      }
      if (resp == 'NO') {
        $('.input-group .emaili').removeClass('green fa-check').addClass('orange fa-times');
        validemail = false;
      }
    });  
  }
  });  
  $(".hook").on("keyup",".pwd",function(e) {
    $('.signupbox p').show();
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
    $('.signupbox p').show();  
    var term = $("#termsbox").prop('checked');
    var un = $(".username").val();
    var em = $(".email").val();
    var pwd = $(".pwd").val();
    var path = "adduser/"+un+"/"+em+"/"+pwd;
    if (un && em && pwd && term && validemail && un.length >= 3) {
    $.ajax({
      url: path,
      cache: false
      }).done(function( resp ) {
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
      } else {
          $('.signupbtn').removeClass('btn-blue').addClass('btn-warning').html('<i class="fa fa-check-square"></i> Please Read Our Terms');
          setTimeout(function(){$('.signupbtn').addClass('btn-blue').removeClass('btn-warning').html('Sign Up');},3550);
        }
    });
});