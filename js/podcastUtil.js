// JavaScript Document
$('.toggle').click(function(e) {
    e.preventDefault();

  var $this = $(this);

  if ($this.next().hasClass('show')) {
      $this.next().removeClass('show');
      $this.next().slideUp(350);
  } else {
      $this.parent().parent().find('div.inner').removeClass('show');
      $this.parent().parent().find('div.inner').slideUp(350);
      $this.next().toggleClass('show');
      $this.next().slideToggle(350);
  }
});

// Landscape orientation disable..

setTimeout(function(){
    let viewHeight= $(window).height();
    let viewWidth= $(window).width();
    let viewPort= document.querySelector("meta[name=viewport]");
    viewPort.setAttribute("content", "height=" +viewHeight + "px, width=" +viewWidth + "px, initial-scale=1.0");
});

$(document).on("click", '.submenu-wrap .button', (event) => {
  $(event.target).siblings('.profle-submenu')
    .toggleClass('is-open');
});

$(document).click(function(e) {
  $('.submenu-wrap')
    .not($('.submenu-wrap').has($(e.target)))
    .children('.profle-submenu')
    .removeClass('is-open');
});


PODCAST.loadHTML = function(url){

  $( "#contentArea" ).load( url, function() {
      //console.log( "Load was performed for: " + url );
  });
};

$(document).on("click", ".profle-submenu ul li:nth-child(1) a", function(e){
    if($(".play").css("display") === "block" || $("#list-screen").css("display") === "block"){
        Amplitude.pause();
        $("#contentArea").show();
        $(".play").hide();
        $('#list-screen').hide();
    }    
    
  if($(".upload-record-wrapper").is(":visible")){
      $("#user-view-btn").text("Admin View");
      $(".upload-record-wrapper").css("display","none");
      $(".tab-listen-now").text("Listen Now");
      PODCAST.loadHTML("./htmls/listen-now.html");
      PODCAST.user.isAdminView = false;
  }else{
      $(".upload-record-wrapper").css("display","block");
      $("#user-view-btn").text("User View");
      $(".tab-listen-now").text("All Recordings");
      PODCAST.loadHTML("./htmls/listen-now.html");
      PODCAST.user.isAdminView = true;
  } 
  $(".profle-submenu").toggleClass('is-open');
});

$(document).on("click",".profle-submenu ul li:nth-child(2) a", function(e){
  sessionStorage.removeItem("pc-user");
  if(window.location.href.indexOf("podcast.cisco.com")>-1)
    location.href = "http://www.cisco.com/autho/logout.html?ReturnUrl=http://www.cisco.com/web/fw/lo/logout.html?locale=en_US&redirectTo=https://podcast.cisco.com/";
  else 
    location.href = "http://www-stage.cisco.com/autho/logout.html?ReturnUrl=http://www-stage.cisco.com/web/fw/lo/logout.html?locale=en_US&redirectTo=https://icxpoc1-dev.cisco.com/";
});

$(document).on("click", "#uploadTrackLink", function(e){
  if($(".play").css("display")=== "block"){
     (PODCAST.minPlayer)();
  }
  PODCAST.loadHTML("./htmls/upload-recording.html");
});

$(document).on("click",".tab-menu", function(e){
  if($(".play").css("display")=== "block"){
     (PODCAST.minPlayer)();
  }
  if($(this).parent("li").hasClass("tab-active")){
      e.preventDefault();
      return false;
  }

  var currentActiveElement = $("footer").find("li.tab-active");
  currentActiveElement.removeClass("tab-active");

  if($(this).hasClass("tab-listen-now")){
      Amplitude.pause();
      $("#list-screen").hide();
      $(this).parent("li").addClass("tab-active");
      PODCAST.loadHTML("./htmls/listen-now.html");
  }

  if($(this).hasClass("tab-search")){
      Amplitude.pause();
      $("#list-screen").hide();
      $(this).parent("li").addClass("tab-active");
      PODCAST.loadHTML("./htmls/search-audio.html");
  }

  if($(this).hasClass("tab-notification")){
      Amplitude.pause();
      $("#list-screen").hide();
      $(this).parent("li").addClass("tab-active");
      PODCAST.loadHTML("./htmls/notifications.html");
  }

//  PODCAST.loadHTML("./htmls/listen-now.html");

});

/* audio player functions  */

$(document).on("click", "#song-played-progress", function(e){

  var offset = this.getBoundingClientRect();
  var x = e.pageX - offset.left;

  Amplitude.setSongPlayedPercentage( ( parseFloat( x ) / parseFloat( this.offsetWidth) ) * 100 );

});
/*document.getElementById('song-played-progress').addEventListener('click', function( e ){
var offset = this.getBoundingClientRect();
var x = e.pageX - offset.left;

Amplitude.setSongPlayedPercentage( ( parseFloat( x ) / parseFloat( this.offsetWidth) ) * 100 );
});*/
$('img[amplitude-song-info="cover_art_url"]').css('height', $('img[amplitude-song-info="cover_art_url"]').width() + 'px' );

$(document).on("click", ".btn-share", function(e){
  e.stopPropagation();
  e.preventDefault();
 // alert("inside click capture..");
  $("#shareOptionSection input").prop('checked', false);
  //$("#shareEmailAddrs").val('');
  $(".modal-body .user-inputs").removeClass("invalid");
 // $("#shareEmailAddrs").attr("placeholder","abc@cisco.com, xyz@cisco.com");
  $("#myModal").show();
  $("#shareTrackBtn").attr("track-id",$(this).attr("id"));
});
$(document).ready(function(){
    /*$("#shareEmailAddrs").focusin(function() {
     $(".modal-body .user-inputs").removeClass("invalid");
     $(".checkmark").css("border","1px solid #dfdfdf");
    });*/
});
$(document).on("click",".checkmark", function(){
    $(".modal-body .user-inputs").removeClass("invalid");
    $(".checkmark").css("border","1px solid #dfdfdf");
});
// When the user clicks on <span> (x), close the modal
$(document).on("click", ".modal-header .close", function(e){
  $("#myModal").hide();
});
PODCAST.parseEventLog = function(data){
    if(data.responseCode === 1 && data.response!=null ){
            console.log(data.response);
        return;
    }
    else{
        console.log(data.response);
    }
};
$(document).on("click", ".tile", function(e){
  var eventSource = e.target || e.srcElement;
 // alert("event",e)    
  $("#contentArea").hide();
  $("#list-screen").hide();
  $(".play").show();    
  var track_title= $(this).find('h3').text();
    if(track_title !== undefined){
        for (var i in PODCAST.alltracks){    
            if(track_title === PODCAST.alltracks[i].filename){
                var parameters = { "user_id": PODCAST.user.cecId, "track_id": PODCAST.alltracks[i]._id, "user_action": "tileClick"};
                PODCAST.Xhr(PODCAST.parseEventLog, "/api/logOnTrack", "POST",JSON.stringify(parameters));
                return;
            }  
        }
    }
});

$(document).click(function(e){
    var track_title;
    var user_action;
    if(e.target.id === "play-pause" || e.target.id === "play-pause-container"){
        track_title = $(".song-name").html();
        user_action = "playPauseBtn";
    }
    else if(e.target.id === "prev-container" || e.target.id === "previous"){
        track_title = $(".song-name").html();
        user_action = "previousBtn";
    }
    else if(e.target.id === "next-container" || e.target.id === "next"){
        track_title = $(".song-name").html();
        user_action = "nextBtn";
    }
    if(track_title !== undefined && user_action !== undefined){
        for (var i in PODCAST.alltracks){    
            if(track_title === PODCAST.alltracks[i].filename){
                var parameters = { "user_id": PODCAST.user.cecId, "track_id": PODCAST.alltracks[i]._id, "user_action": user_action};
                PODCAST.Xhr(PODCAST.parseEventLog, "/api/logOnTrack", "POST",JSON.stringify(parameters));
                return;
            }  
        }
    }
});

PODCAST.parseShareGroups = function(data){
  $("#shareOptionSection").html("");
  //  if(data.responseCode === 1 && data.response!=null && data.response.length > 0){
      PODCAST.shareGroups = data.response;
        for(var i=0; i <data.response.length; i++){
          var shareGroupOptionHTML = "<h1>Share the Recording</h1>";
          shareGroupOptionHTML = '<label class="container">' + data.response[i] ;
          shareGroupOptionHTML += '<input type="checkbox" value="' + data.response[i] + '">' ;
          shareGroupOptionHTML += '<span class="checkmark"></span>';
          shareGroupOptionHTML += '</label>';
          $("#shareOptionSection").append(shareGroupOptionHTML);
        }
    //  }
};

PODCAST.parseShareResponse = function(data){
    $("#loaderModal").hide();
    if(data.responseCode === 1 && data.response!=null){
      $("#myModal").hide();
      PODCAST.loadHTML("./htmls/share-confirm.html");
      setTimeout(function(e){
        PODCAST.loadHTML("./htmls/listen-now.html");
      }, 3000);
    }else{
      alert("Not able to share.");
  }
};


$(document).on('click', "#shareTrackBtn", function(e){
   
    var selected = [];
    $('#shareOptionSection input:checked').each(function(key, val) {
      $.each(PODCAST.shareGroups, function( index, value ) {
        if(value == val.value){
          selected = selected.concat(value);
        }
      });
    });
    
   /* if($("#shareEmailAddrs").val().trim()!==""){
     var pattern = /^((\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*)\s*[,]{0,1}\s*)+$/ ;
      var emailAddrs = $("#shareEmailAddrs").val().trim().split(",");
      if(pattern.test(emailAddrs)){
        for(var i=0; i< emailAddrs.length; i++){
          if(emailAddrs[i].trim()!==""){
            selected.push(emailAddrs[i].trim());
          }
        }
      }
      else{
          $(".modal-body .user-inputs").addClass("invalid");
          $("#shareEmailAddrs").val('');
          $("#shareEmailAddrs").attr("placeholder","Invalid format");
          $("#loaderModal").hide();
          return false;
      }    
    }*/
	if(selected.length !== 0){
         $("#loaderModal").show();
		var parameters = { "mailIds": selected, "requestedBy": PODCAST.user.cecId, "trackId": $(this).attr("track-id")};
		PODCAST.Xhr(PODCAST.parseShareResponse, "/api/shareTrack", "POST", JSON.stringify(parameters));  
	}
    else{
	/*	$(".modal-body .user-inputs").addClass("invalid");
        $(".checkmark").css("border","1px solid red");
        return false; */
	}

});
