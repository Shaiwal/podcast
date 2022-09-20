const express = require('express');
const ObjectID = require('mongodb').ObjectID;

var Notification = require('./notification.js');
const config = require('../config');
const Tracks = require('../track/track');
var response = config.response;

var notificationAPI = {

    getNewNotificationsCount: function(req, res) {
                               // global.logger.info("inside getNotifications>> ", req);
                               //.db("nqonxs3xdev")
                                try {
                                    global.logger.info("inside getNewNotificationsCount>> ", req.params.cec_id);             
                                    var query = { cec_Id: req.params.cec_id,  is_viewed:false};
                                    global.dbo.collection("podcast_notifications").find(query).toArray(function(err, result) {
                                        if (err) {
                                            global.logger.error("Error in DB transaction", err);
                                            response.responseCode = -1; response.response = "Error in DB transaction"; return res.json(response);  
                                        }                                          
                                        if(result == null || result.length ===0 ){
                                            response.responseCode = -1; response.response = null; return res.json(response);
                                        }else{
                                            var stringCompateArr = [];
                                            //var notificationIdArr = [];
                                            var notiToUpdate=[];
                                            for(var i=0;i<result.length;i++){
                                                var dt = new Date(result[i].shared_date);
                                                var complexString = String(result[i].shared_by) + String(result[i].trackId)+ String(result[i].shared_date);
                                                if(stringCompateArr.indexOf(complexString)==-1){
                                                    stringCompateArr.push(complexString);
                                                   // notificationIdArr.push(String(result[i]._id));
                                                }
                                                else
                                                    notiToUpdate.push(new ObjectID(result[i]._id));
                                            }
                                            if(notiToUpdate.length>0){
                                                    var myquery = { _id: { $in:notiToUpdate} };
                                                    var date=new Date();
                                                    var newvalues = {$set: {is_viewed:true,modified_on:date} };
                                                    global.dbo.collection("podcast_notifications").updateMany(myquery, newvalues, function(err, resp) {
                                                    if (err) {global.logger.error("Error in DB transaction", err);
                                                    response.responseCode = -1; response.response = "Error in DB transaction"; return res.json(response);  }
                                                        if(resp!=null && resp.result.nModified != null){
                                                            global.logger.info(resp.result.nModified + " document(s) updated from notification count");
                                                        }
                                                    });  
                                                }
                                            response.responseCode = 1; response.response = stringCompateArr.length; return res.json(response);
                                        }    
                                    });
                                } catch(err) {
                                    global.logger.error("Error in DB transaction", err);
                                    response.responseCode = -1; response.response = "Error in DB transaction"; return res.json(response); 
                                }
    },
    getNotifications: function(req, res){                                  
                    try {
                            global.logger.info("inside checkDuration>> ", req.params.cec_id);                
                            var query = { cec_Id: req.params.cec_id,is_available:true};
                             var duration=[]; var changeArray=[];
                      global.dbo.collection("podcast_notifications").find(query).toArray(function(err, result) {
                    try{
                        if (err) {
                            global.logger.error("Error in DB transaction", err);
                           response.responseCode = -1; response.response = "Error in DB transaction"; return res.json(response);  
                        } 
                        if(result == null || result.length ===0 ){
                            global.logger.info("In first db null loop",result);
                            response.responseCode = -1; response.response = null;res.json(response);
                        }else{
                            for(var i=0;i<result.length;i++){
                                if(result[i].is_viewed==true){
                                var d1=new Date(result[i].shared_date);
                                var d2=new Date();
                                var delta = Math.abs(d2 - d1) / 1000; // get total seconds between the times
                                var days = Math.floor(delta / 86400); // calculate (and subtract) whole days
                                 duration[i]={"sec":delta};
                                    if(days>=2)
                                        changeArray.push(result[i]._id);
                                }
                                }
                            if(changeArray.length>0){
                                //notificationAPI.updateAvailable(changeArray,req,res);
                                    global.logger.info("inside updateAvailable>> ");
                                    var arr=[];
                                    for(var i=0;i<changeArray.length;i++)
                                    arr[i]=new ObjectID(changeArray[i]);
                                    var myquery = { _id: { $in:arr} };
                                    var date=new Date();
                                    var newvalues = {$set: {is_available:false,modified_on:date} };
                                    global.dbo.collection("podcast_notifications").updateMany(myquery, newvalues, function(err, resp) {
                                    if (err) {global.logger.error("In getNotifications second query ,Error in DB transaction", err);
                                   response.responseCode = -1; response.response = "In second query ,Error in DB transaction"; return res.json(response);  }
                                        if(resp!=null && resp.result.nModified != null){
                                             global.logger.info(resp.result.nModified + " document(s) updated");
                                             notificationAPI.getNotificationsOld(req,res);
                                        }else{
                                            response.responseCode = -1; response.response = null; return res.json(response);
                                        }
                                    });   
                            }
                            else{
                               notificationAPI.getNotificationsOld(req,res);    
                            }
                      }
                          } catch(err) {
                            global.logger.error("In getNotifications first query ,Error in DB transaction", err);
                            response.responseCode = -1; response.response = "In first query ,Error in DB transaction"; return res.json(response);
                        }
                            });                                  
                        } catch(err) {
                            global.logger.error("Error in DB transaction", err);
                            response.responseCode = -1; response.response = "Error in DB transaction"; return res.json(response);
                        }   
    },
    getNotificationsOld: function(req, res) {
                try {
                    var durationn=[]; var notification = [];    var result1= []; var result2=[];
                    global.logger.info("inside getNotifications>> ", req.params.cec_id);                
                    var query = { cec_Id: req.params.cec_id,is_available:true};
                    var tracks = [];
                      global.dbo.collection("podcast_notifications").find(query).sort({shared_date:-1}).toArray(function(err, result) {
                          try{
                        if (err) {
                            global.logger.error("Error in DB transaction", err);
                           response.responseCode = -1; response.response = "Error in DB transaction"; return res.json(response);  
                        }                                    
                        if(result == null || result.length ===0 ){
                            global.logger.info("In first db null loop",result);
                            response.responseCode = -1; response.response = null;res.json(response);
                        }else{   
                             global.logger.info("In first db else",result);
                            var stringCompateArr = [];
                                            for(var i=0;i<result.length;i++){
                                                var dt = new Date(result[i].shared_date);
                                                var complexString = String(result[i].shared_by) + String(result[i].trackId)+ String(result[i].shared_date);
                                                if(stringCompateArr.indexOf(complexString)==-1){
                                                    stringCompateArr.push(complexString);
                                                    result1.push(result[i]);
                                                    tracks.push(new ObjectID(result[i].trackId));
                                                }
                                            }                         
                             global.logger.info("TrackId",tracks);
                          //  global.dbo.collection("podcast_tracks.files").find({ _id: { $in:tracks} } ).toArray(function(err, result) {
                            global.dbo.collection("podcast_recordings").find({ _id: { $in:tracks} } ).toArray(function(err, result) {
                                try{
                                if (err) {
                                    global.logger.error("Error in DB transaction", err);
                                    response.responseCode = -1; response.response = "Error in DB transaction"; return res.json(response);  
                                }                       
                                if(result == null || result.length ===0 ){
                                    global.logger.info("In second db null loop",result);
                                    response.responseCode = -1;response.response = null;return res.json(response);
                                }else{
                                    global.logger.info("In second db else loop",result);
                                    for(var i=0;i<result.length;i++){
                                        result2[i]=result[i];
                             }
                                    for(var i=0;i<result1.length;i++){
                                for(var j=0;j<result2.length;j++){
                                    var t1=new ObjectID(result1[i].trackId);
                                if(t1.equals(result2[j]._id)){ 
                                    var d1=new Date(result1[i].shared_date);
                                var d2=new Date();
                                var delta = Math.abs(d2 - d1) / 1000; // get total seconds between the times
                                 durationn[i]={"sec":delta};
                                    
            //notification[i]=new Notification(result1[i]._id,result1[i].cec_Id,result1[i].trackId,result1[i].shared_by,result1[i].shared_date,result1[i].is_viewed,result1[i].created_on,result1[i].modified_on,new Tracks(result2[j]._id,result2[j].length,result2[j].chunkSize,result2[j].uploadDate,result2[j].filename,result2[j].md5,result2[j].metadata.description,result2[j].metadata.author,result2[j].metadata.duration,result2[j].metadata.created_by,result2[j].metadata.created_on,result2[j].metadata.modified_on,result2[j].metadata.modified_by,result2[j].metadata.isAvailable,result2[j].metadata.track_icon,result2[j].metadata.full_name),durationn[i]);
            notification[i]=new Notification(result1[i]._id,result1[i].cec_Id,result1[i].trackId,result1[i].shared_by,result1[i].shared_date,result1[i].is_viewed,result1[i].created_on,result1[i].modified_on,new Tracks(result2[j]._id,result2[j].length,result2[j].chunkSize,result2[j].uploadDate,result2[j].filename,result2[j].md5,result2[j].description,result2[j].author,result2[j].duration,result2[j].created_by,result2[j].created_on,result2[j].modified_on,result2[j].modified_by,result2[j].isAvailable,result2[j].track_icon,result2[j].full_name, result2[j].url),durationn[i]);
                        }   
                    }
                    }               
                                    response.responseCode = 1; response.response = notification; return res.json(response);
                                } 
                                } catch(err) {
                    global.logger.error("In getNotificationsOld second query,,Error in DB transaction", err);
                    response.responseCode = -1; response.response = "In getNotificationsOld ,Error in DB transaction";return res.json(response);
                } 
                            });                                   
                        }
                    } catch(err) {
                    global.logger.error("In getNotificationsOld first query,Error in DB transaction", err);
                    response.responseCode = -1; response.response = "In getNotificationsOld ,Error in DB transaction";return res.json(response);
                } 
                    });
                   
                } catch(err) {
                    global.logger.error("Error in DB transaction", err);
                    response.responseCode = -1; response.response = "Error in DB transaction";return res.json(response);
                }       
                
    },
    updateNotification: function(req, res) {
                        try {
                            global.logger.info("inside updateNotification>> ");
                            var arr=[];
                            for(var i=0;i<req.body.length;i++)
                            arr[i]=new ObjectID(req.body[i]);
                            var myquery = { _id: { $in:arr} };
                            var date=new Date();
                            var newvalues = {$set: {is_viewed:true,modified_on:date} };
                            global.dbo.collection("podcast_notifications").updateMany(myquery, newvalues, function(err, resp) {
                            if (err) {global.logger.error("Error in DB transaction", err);
                           response.responseCode = -1; response.response = "Error in DB transaction"; return res.json(response);  }
                                if(resp!=null && resp.result.nModified != null){
                                    global.logger.info(resp.result.nModified + " document(s) updated");
                                    response.responseCode = 1; response.response = resp.result;return res.json(response);
                                }else{
                                    response.responseCode = -1; response.response = null; return res.json(response);
                                }
                            });                                  
                        } catch(err) {
                            global.logger.error("Error in DB transaction", err);
                            response.responseCode = -1; response.response = "Error in DB transaction"; return res.json(response);
                        }                
    },
    getShareGroups: function(req, res) {            
                try {
                    var cecId = req.headers.uid;
                    if(cecId==null){
                        cecId = "shaiwsha";
                    }
                    global.logger.info("inside getShareGroups for group>> ");         
                    global.dbo.collection("podcast_users").distinct('groupName', function(err, result) {
                        if (err) {
                            global.logger.error("Error in DB transaction", err);
                           response.responseCode = -1; response.response = "Error in DB transaction"; return res.json(response);  
                        }                        
                        if(result == null || result.length ===0 ){
                            response.responseCode = -1; response.response = null; return res.json(response);
                        }else{
                            response.responseCode = 1; response.response = result; return res.json(response);
                        }
                    });
                } catch(err) {
                    global.logger.error("Error in DB transaction", err);
                    response.responseCode = -1; response.response = "Error in DB transaction"; return res.json(response);
                }
    },
    shareTrack: function(req, res) {
        try {
            if(!req.body.requestedBy || req.body.requestedBy==null){
                global.logger.error("In shareTrack ,requestedBy not present");
            response.responseCode = -1; response.response = "In shareTrack ,requestedBy not present"; return res.json(response);
            }
            if(!req.body.trackId || req.body.trackId==null){
                global.logger.error("In shareTrack ,trackId not present");
            response.responseCode = -1; response.response = "In shareTrack ,trackId not present"; return res.json(response);
            }
            if(!req.body.mailIds || req.body.mailIds==null || !req.body.mailIds.length>0){
                global.logger.error("In shareTrack ,neither Group Id nor mailer Id provided");
            response.responseCode = -1; response.response = "In shareTrack ,neither Group Id nor mailer Id provided"; return res.json(response);
            }
            
            global.logger.info("inside share Track>> ", req.body);

            var notifications = [];
            global.dbo.collection("podcast_users").find({groupName:{ $in:req.body.mailIds}}).toArray(function(err, result) {
                try{
            if (err) {
                global.logger.error("Error in DB transaction", err);
                response.responseCode = -1; response.response = "Error in DB transaction"; return res.json(response);  
                }                                          
            if(result == null || result.length ===0 ){
            global.logger.info("Result in -1");
            response.responseCode = -1; response.response = null; return res.json(response);
            }else{
            global.logger.info("Outside cecusers");
                var dt = new Date();
                for(var i=0; i< result.length; i++){
                    global.logger.info("cecId: ",result[i].cecId);
                    var share = {cec_Id:result[i].cecId, trackId: req.body.trackId, shared_date: dt, is_viewed: false, shared_by: req.body.requestedBy, created_on: dt, modified_on:dt,is_available:true,groupName:result[i].groupName};
                    notifications.push(share);
                }
            
            if(notifications.length > 0){    
                global.dbo.collection("podcast_notifications").insertMany(notifications, function(err, resp) {
                    if (err) {global.logger.error("Error in DB transaction", err);
                           response.responseCode = -1; response.response = "Error in DB transaction"; return res.json(response);  }
                    global.logger.info("Documents inserted", resp.insertedCount );
                        if(resp != null && resp.insertedCount > 0 ){
                            response.responseCode = 1; response.response = resp; return res.json(response);
                        }else{
                            response.responseCode = -1; response.response = null; return res.json(response);
                        }
                });
            }  
        }  
        } catch(err) {
            global.logger.error("Error in DB transaction", err);
            response.responseCode = -1; response.response = "Error in DB transaction"; return res.json(response);
        }    
        });
           
        } catch(err) {
            global.logger.error("Error in DB transaction", err);
            response.responseCode = -1; response.response = "Error in DB transaction"; return res.json(response);
        }                
    }
};
  

module.exports = notificationAPI;



