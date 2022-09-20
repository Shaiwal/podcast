var PODCAST = PODCAST || {};
$(document).ready(function(e){

    PODCAST.getAudioDuration = function(url,element){
        var audio= new Audio();
            audio.src = url;
            $(audio).on("loadedmetadata", function(){
                var time = parseFloat(audio.duration);
                var minutes = Math.floor(time / 60) % 60;
                var seconds = Math.floor(time - minutes * 60);
                element.text(minutes + ':' + seconds);
            });
    }

    PODCAST.parseAllTracks = function(data){
        $("#loaderModal").hide();
        var tracks = []; 
        if(data.responseCode === 1 && data.response!=null){
            if(data.response.length > 0){
                PODCAST.alltracks= data.response;
                var j=0;
                $(".list-item").css("display","block");
                for(var i=0; i <data.response.length; i++){                  
                    var cln,elm;
                    elm= document.getElementsByClassName("list-item")[0];
                    if(j>0){
                        cln= elm.cloneNode(true);
                        document.getElementsByClassName("userHomePage")[0].appendChild(cln);
                        $(cln).find(".tile").attr("amplitude-song-index",j);
                    }
                    else{
                        cln= elm;
                    }
                    $(cln).find(".title").text(data.response[i].filename);
                    $(cln).find(".desc").text(data.response[i].metadata.description);
                    $(cln).find(".desc").append( '</br><span>by '+ data.response[i].metadata.full_name  +'</span>');
                    var date = new Date(data.response[i].metadata.created_on);
                    $(cln).find(".date").text(date.toDateString().slice(3));
                    $(cln).find(".btn-share").attr("id",data.response[i]._id);
                    var cover_art_url = null;
                    if(data.response[i].metadata.track_icon && Array.isArray(data.response[i].metadata.track_icon)){
                        $(cln).find("#icon").attr("src","data:image/png;base64,"+ data.response[i].metadata.track_icon[0].buffer);
                        cover_art_url = "data:image/png;base64,"+ data.response[i].metadata.track_icon[0].buffer;
                    }else if(data.response[i].metadata.track_icon){
                        $(cln).find("#icon").attr("src", data.response[i].metadata.track_icon);
                        cover_art_url = data.response[i].metadata.track_icon;
                    }
                   // console.log("PODCAST.user.sessionId>>" + PODCAST.user.sessionId);
                    var track = {
                        "name": data.response[i].filename,
                        "artist": data.response[i].metadata.description + '</br><span>by '+ data.response[i].metadata.full_name  +'</span>',
                        "url":"/api/singleTrack/"+data.response[i]._id+"/"+PODCAST.user.sessionId,
                        "live":true,
                        "cover_art_url":cover_art_url
                    }
                   // PODCAST.getAudioDuration(track.url,$(cln).find(".audio-duration"));
                    tracks.push(track);
                    j++;
                }
                Amplitude.init({
                    "songs": tracks
                });
            }else{
                $(".audio-list>.accordion").hide();
                $(".audio-list").append("No recordings/tracks available right now.");
                $("section.audio-list").css("overflow-y","hidden");
            }    
        }else{
            $(".audio-list>.accordion").hide();
            $(".audio-list").append("Error in fetching recordings/tracks. Please try again.");
            $("section.audio-list").css("overflow-y","hidden");
        }
        PODCAST.Xhr(PODCAST.parseNotificationCount, "/api/getNewNotificationsCount/"+PODCAST.user.cecId, "GET");
    };

    

    PODCAST.parseNotificationCount = function(data){
        var tracks = [];
        if(data.responseCode === 1 && data.response!=null && data.response > 0){
            $(".tab-notification").find("span").show();
            $(".tab-notification").find("span").html(data.response);
        }else{
            $(".tab-notification").find("span").hide();
        }
    };

    PODCAST.parseUserLoginLog = function(data){
        if(data.responseCode === 1 && data.response!=null ){
            //console.log("sessionId: ", data.response);
            PODCAST.user.sessionId = data.response;
        }
    };
    
    
    (function() {
        try{

            $.ajax({
                type: "GET",
                url: "/api/getUserWOParam",
                dataType: "json",
                success: function(data, textStatus, jqXHR){
                  try{
                        if(data.responseCode === 1){
                           // console.log(data.response);
                            sessionStorage.setItem("pc-user",JSON.stringify(data.response));
                            PODCAST.user = data.response;
                            if(PODCAST.user){
                                if(PODCAST.user.fullname){
                                    var name = PODCAST.user.fullname.split(" ");
                                    $(".submenu-wrap button").text(name[0].charAt(0).toUpperCase() + name[1].charAt(0).toUpperCase());
                                //  window.location = "index.html";
                                  //  $(".user-login .user-inputs:nth-of-type(1)").removeClass("invalid");
                                }else{
                                    $(".submenu-wrap button").hide();
                                }
                                
                                if(PODCAST.user.roles && PODCAST.user.roles.length > 0){
                                    var isAdmin = false;
                                    PODCAST.user.roleString = "";
                                    PODCAST.user.groupNameString = "";
                                    $.each(PODCAST.user.roles, function( index, value ) {
                                        
                                        if(!isAdmin && (String(value["role"]).toLocaleLowerCase() === "admin" || String(value["role"]).toLocaleLowerCase() === "superadmin")){
                                            isAdmin = true;
                                        }
                                        PODCAST.user.roleString += String(value["role"]) + ",";
                                        PODCAST.user.groupNameString += String(value["groupName"]) + ",";
                                       
                                    });

                                    PODCAST.user.roleString = PODCAST.user.roleString.replace(/(^[,\s]+)|([,\s]+$)/g, '');
                                    PODCAST.user.groupNameString = PODCAST.user.groupNameString.replace(/(^[,\s]+)|([,\s]+$)/g, '');

                                    $(".upload-record-wrapper").css("display","none");
                                    $(".shareConfirmation").hide();
                                    PODCAST.loadHTML("./htmls/listen-now.html");
                                            
                                     try{
                                       // console.log("calling share groups");
                                        if(PODCAST.user.roleString.indexOf("superadmin")>-1){
                                            PODCAST.Xhr(PODCAST.parseShareGroups, "/api/getShareGroups" , "GET");
                                        }else{
                                            var shareGroupArr = [];
                                            var shareGroupOptionHTML = "";
                                            $.each(PODCAST.user.roles, function( index, value ) {
                                        
                                                if(String(value["role"]).toLocaleLowerCase() === "admin"){
                                                    shareGroupArr.push(String(value["groupName"]));
                                                    shareGroupOptionHTML += '<label class="container">' + String(value["groupName"]) ;
                                                    shareGroupOptionHTML += '<input type="checkbox" value=' + String(value["groupName"]) + '>' ;
                                                    shareGroupOptionHTML += '<span class="checkmark"></span>';
                                                    shareGroupOptionHTML += '</label>';
                                                }

                                            
                                            });
                                            $("#shareOptionSection").append(shareGroupOptionHTML);
                                            PODCAST.shareGroups=shareGroupArr;
                                        }
                                        
                                    }catch(err){
                                        console.log("Error while parsing parseShareGroups json", err);
                                    }

                                    if(!isAdmin){
                                        $('.profle-submenu ul li:nth-child(1) a').css('pointer-events', 'none');
                                        $('.profle-submenu ul li:nth-child(1)').css('background-color', 'lightgray');
                                        $('.profle-submenu ul li:nth-child(1) a').css('color', 'whitesmoke');
                                    }
                                }   


                               /* if(PODCAST.user.role !== "admin"){
                                    $('.profle-submenu ul li:nth-child(1) a').css('pointer-events', 'none');
                                    $('.profle-submenu ul li:nth-child(1)').css('background-color', 'lightgray');
                                    $('.profle-submenu ul li:nth-child(1) a').css('color', 'whitesmoke');
                                    //$(".profle-submenu ul li:nth-child(1) a").attr("disabled","disabled");
                                }

                                if(PODCAST.user.groupName){
                                    $(".upload-record-wrapper").css("display","none");
                                    $(".shareConfirmation").hide();
                                    PODCAST.loadHTML("./htmls/listen-now.html");

                                    try{
                                        console.log("calling share groups");
                                        PODCAST.Xhr(PODCAST.parseShareGroups, "/api/getShareGroups/" + PODCAST.user.groupName, "GET");
                                    }catch(err){
                                        console.log("Error while parsing parseShareGroups json", err);
                                    }
                                    
                                }*/
                                
                            } 
                        }
                        else{
                            alert("Can't fetch User details, please try again!!!");
                        }
                        var parameters = { "browser": browser(), "os": getOS() };
                        PODCAST.Xhr(PODCAST.parseUserLoginLog, "/api/logUserLogin", "POST", JSON.stringify(parameters));     
                        
                    }catch(e){
                        console.error("Error in gettin user data:", e);
                    } 
                },
                error: function(data, textStatus, error){
                    console.log(error);
                }
                
            });         

           
        }catch(err){
            console.log("inside err.. redirecting to login");
            sessionStorage.removeItem("pc-user");
            window.location = "index.html";
        }
        /*if(PODCAST.user.isAdminView){
            $(".upload-record-wrapper").css("display","block");
            $("#user-view-btn").text("User View");
            $(".tab-listen-now").text("All Recordings");
        }*/
    
    })();
});

function getOS() {
    var userAgent = window.navigator.userAgent,
        platform = window.navigator.platform,
        macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
        windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
        iosPlatforms = ['iPhone', 'iPad', 'iPod'],
        os = null;
  
    if (macosPlatforms.indexOf(platform) !== -1) {
      os = 'Mac OS';
    } else if (iosPlatforms.indexOf(platform) !== -1) {
      os = 'iOS';
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
      os = 'Windows';
    } else if (/Android/.test(userAgent)) {
      os = 'Android';
    } else if (!os && /Linux/.test(platform)) {
      os = 'Linux';
    }
  
    return os;
  };

  var browser = function() {
    // Return cached result if avalible, else get result then cache it.
    if (browser.prototype._cachedResult)
        return browser.prototype._cachedResult;

    // Opera 8.0+
    var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

    // Firefox 1.0+
    var isFirefox = typeof InstallTrigger !== 'undefined';

    // Safari 3.0+ "[object HTMLElementConstructor]" 
    var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification);

    // Internet Explorer 6-11
    var isIE = /*@cc_on!@*/false || !!document.documentMode;

    // Edge 20+
    var isEdge = !isIE && !!window.StyleMedia;

    // Chrome 1+
    var isChrome = !!window.chrome && navigator.userAgent.indexOf("Chrome") > -1;

    // Blink engine detection
    var isBlink = (isChrome || isOpera) && !!window.CSS;

    return browser.prototype._cachedResult =
        isOpera ? 'Opera' :
        isFirefox ? 'Firefox' :
        isSafari ? 'Safari' :
        isChrome ? 'Chrome' :
        isIE ? 'IE' :
        isEdge ? 'Edge' :
        isBlink ? 'Blink' :
        "Don't know";
};

  





