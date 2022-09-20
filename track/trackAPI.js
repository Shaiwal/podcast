const express = require('express');
const mongodb = require('mongodb');
const ObjectID = require('mongodb').ObjectID;
const multer = require('multer');
const { Readable } = require('stream');
const config = require('../config');
var response = config.response;
var base64Img = require('base64-img');
var https = require('https');

var trackAPI = {

    getTrack: function(req, res) {
                try {
                    global.logger.info("inside getTrack>> ", req.params.trackID);
                    var db =  global.dbo;//.db("nqonxs3xdev")
                    var trackID = new ObjectID(req.params.trackID);
                 
                res.set('content-type', 'audio/mp3');
                res.set('accept-ranges', 'bytes');
                
                let bucket = new mongodb.GridFSBucket(db, {
                    bucketName: 'podcast_tracks'
                });
                
                let downloadStream = bucket.openDownloadStream(trackID);
                global.logger.info("downloadStream");
                downloadStream.on('data', (chunk) => {
                    global.logger.info("downloadStream chukns streaming");
                    res.write(chunk);
                });
                
                downloadStream.on('error', () => {
                global.logger.error("Error in DB transaction");
                response.responseCode = -1; response.response = "Error in DB transaction"; return res.json(response);  
                });
                
                downloadStream.on('end', () => {
                    res.end();
                });

                trackAPI.logUserAction(req, res);
             }
        catch(err) {
                    global.logger.error("Invalid trackID in URL parameter", err);
                    response.responseCode = -1; response.response = "Invalid trackID in URL parameter. Must be a single String of 12 bytes or a string of 24 hex characters"; return res.json(response);
                }
                
    },
    getTrackURI: function(req, res){
               /* try{

                  /*  var filePath = path.join("https://gitlab-sjc.cisco.com/shaiwsha/podcast/blob/master/files/S3-Agile-and-SAFe-in-IT-Infrastructure-with-Bonnie-Lee.mp3");//(__dirname, 'myfile.mp3');
                    var stat = fileSystem.statSync(filePath);

                    response.writeHead(200, {
                        'Content-Type': 'audio/mpeg',
                        'Content-Length': stat.size
                    });

                    var readStream = fileSystem.createReadStream(filePath);
                    // We replaced all the event handlers with a simple call to readStream.pipe()
                    readStream.pipe(response);
                   */

                 
                //  request('https://gitlab-sjc.cisco.com/shaiwsha/podcast/blob/master/files/S3-Agile-and-SAFe-in-IT-Infrastructure-with-Bonnie-Lee.mp3', function (error, response, body) {
                    
              /*  request({method:'GET', url:'https://cisco.app.box.com/file/401729304698',header:{'Cookie':"ObSSOCookie g%2FIMWoVEKdafRBkrIxn7cGcVWka5PQEPRPeJvOE%2FCQBg4YM86Uuq96fP%2BZSKhhHXTSjElVHTyQKPpFbT9HHbI2sG1d%2FeIYk61ct3Ofl31u5kcAUntl2hpT9dHm12U7joxL%2FUYujTimcN3IQQmMm9DGGWBYxVWNkWdIHv6bpbPw%2F%2Fi6UZfN94XPoABh20Ar78mT85QrWeR6HCtE8vUfNdpt%2Fg9wZ%2BgUSs5HUnc31Q8tgYDB8raKmOxWkkk7gdcXCpTs12tZTJl4OR4WbXu6Z0bfSapRT8DYhomiquzNvRZJgvOz3WBU0pPjWymId3N5Qh"}}, function (error, response, body) {

                    console.log('error:', error); // Print the error if one occurred
                    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                    console.log('body:', body); // Print the HTML for the Google homepage.
                    res.pipe(fs.createWriteStream(body));
                  });
*/
                /*  http.get('http://cisco.app.box.com/file/401729304698cls', function (res1) {
                      console.log(res1);
                    //res1.pipe(fs.createWriteStream('some.mp3'));
                  });*/

             /*     var box = new Box({
                   // client_id: 'APPLICATION_CLIENT_ID',
                   // client_secret: 'APPLICATION_CLIENT_SECRET',
                    access_token: 'wm4bysoY9uTbC0koz7TX1w4jiQs6'
                   // refresh_token: 'USER_REFRESH_TOKEN'
                });*/

              //  client = box.getAnonymousClient();
             /* var sdk = new BoxSDK({
                clientID: 'otuty9c8dhbdx6dhu1fkzc6vhuvbomzy',
                clientSecret: ''
              });
                var client = BoxSDK.getBasicClient('YxWgX88xKGGksbG03WGRpxIo0CR6HSbT');

                    client.files.getReadStream('401840109254')//https://api.box.com/2.0/files/401840109254/content
                        .then(function (error, stream) {
                            if (error) { 
                                throw error; 
                            }
                            // write the file to disk 
                            var output = fs.createWriteStream('./output/'+file_id+".mp3"); //I know for sure there will only be zip files 
                            stream.pipe(output); 
                        });
                }catch(err){
                    global.logger.error("Invalid URL /track ", err);
                    response.responseCode = -1; response.response = "Invalid url param. Must be a single String of 12 bytes or a string of 24 hex characters"; return res.json(response);

                }*/
    },
    logUserAction: function(req, res){
        try {
            var cecId = req.headers.uid;
            if(cecId == null){
               cecId = "shivang2";
               //global.logger.error("User CEC Id not available");
               //response.responseCode = -1; response.response = "User CEC Id not available"; return res.json(response);

            }
            var dateTime = new Date();
    
            var logObj = {};
            logObj.cecId = cecId;
            logObj.sessionId = req.params.sessionID;
            logObj.dateTime = dateTime;
            logObj.trackId = req.params.trackID;
            logObj.action = "trackPlay";
            //.db("nqonxs3xdev")
            global.logger.info("inside logUserAction sessionID>> ", req.params.sessionID);
            global.dbo.collection("podcast_track_access_log").insertOne(logObj, function(err, resp) {
            if (err) {
                global.logger.error("Error in DB transaction", err);
                response.responseCode = -1; response.response = "Error in DB transaction"; return res.json(response);
            }
            global.logger.info("1 document inserted podcast_track_access_log: ", resp.insertedCount + " .. " + resp.insertedId);
           /* if(resp != null && (resp.insertedCount === 1 &&  resp.insertedId != null) ){
                console.log("User Session Id: ", resp.insertedId);
                response.responseCode = 1; response.response = resp.insertedId; return res.json(response);
            }else{
                response.responseCode = -1; response.response = null; return res.json(response);
            }*/
            });
            
        } catch(err) {
            global.logger.error("Error in DB transaction", err);
            response.responseCode = -1; response.response = "Error in DB transaction"; return res.json(response);
        }    
    },
    deleteTrack: function(req, res) {
                try {
                    global.logger.info("inside deleteTrack>> " ,req.body.trackId);
                    if(!req.body.trackId || req.body.trackId==null) {
                        global.logger.error("inside deleteTrack, trackId not present");
                        response.responseCode = -1; response.response = "trackId not present"; return res.json(response);  
                    }
                    else if(!req.body.cecId || req.body.cecId == null) {
                        global.logger.error("inside uploadTrack, cecId not present");
                        response.responseCode = -1; response.response = "cecId not present"; return res.json(response);  
                    }
                    var trackID = new ObjectID(req.body.trackId);
                    var query={"metadata.isAvailable":false,"metadata.modified_on":new Date(),"metadata.modified_by":req.body.cecId};                  
                   global.dbo.collection("Podcast_Tracks.files").updateOne({"_id":trackID}, { $set:query}, function(err, resp) {
                                if (err) {
                                global.logger.error("Error in DB transaction", err);
                                response.responseCode = -1; response.response = "Error in DB transaction"; return res.json(response);   
                                }
                                if(resp!=null && resp.result.nModified != null){
                                    global.logger.info(resp.result.nModified + "Document deleted");
                                    response.responseCode = 1; response.response = resp.result;return res.json(response);
                                }else{
                                    response.responseCode = -1; response.response = null; return res.json(response);
                               }                              
                            }); 
                } catch(err) {
                    global.logger.error("Track Not Present", err);
                    response.responseCode = -1; response.response="Track Not Present"; return res.json(response); 
                }               
    },
    getAllTracks: function(req, res) {
                try {
                    var cecId = req.headers.uid;
                     var roles=[];
                    if(cecId == null){
                        //cecId = "shaiwsha";
                        global.logger.error("User CEC Id not available");
                        response.responseCode = -1; response.response = "User CEC Id not available"; return res.json(response);
                    }
                    global.logger.info("inside getAllTrack>> ",req.params.groupNames);  
                    var sortQuery={created_on:-1};   
                    var trackIdArr = [];         
                    global.dbo.collection('podcast_users').find({cecId:cecId}).toArray(function(err, result) {
                        try{
                            if (err) {
                                global.logger.error("Error in DB transaction", err);
                                response.responseCode = -1; response.response = "Error in DB transaction"; return res.json(response); 
                            }
                            if(result == null || result.length ===0 ){
                                response.responseCode = -1; response.response = "No data"; return res.json(response);
                            }else{
                                for(var i=0; i<result.length; i++){                              
                                   roles.push(result[i].role);                         
                            }
                                 if(req.params.groupNames){
                        if(roles.indexOf("superadmin")>-1){
                            global.dbo.collection('podcast_notifications').find({}).sort(sortQuery).toArray(function(err, result) {
                            if (err) {
                                global.logger.error("Error in DB transaction", err);
                                response.responseCode = -1; response.response = "Error in DB transaction"; return res.json(response); 
                            } 
                            for(var i=0; i<result.length; i++){                              
                                    trackIdArr.push(new ObjectID(result[i].trackId));                           
                            }
                            console.log("trackIdArr", trackIdArr);
                            trackAPI.getAllTracksCallback(trackIdArr,req,res);
                        });
                        }
                    else{
                        global.dbo.collection('podcast_notifications').find({"cec_Id":cecId}).sort(sortQuery).toArray(function(err, result) {
                            if (err) {
                                global.logger.error("Error in DB transaction", err);
                                response.responseCode = -1; response.response = "Error in DB transaction"; return res.json(response); 
                            } 
                            var counter = 0;
                            for(var i=0; i<result.length; i++){
                                if(req.params.groupNames.indexOf(result[i].groupName) > -1){
                                    trackIdArr.push(new ObjectID(result[i].trackId));
                                } 
                            }
                            trackAPI.getAllTracksCallback(trackIdArr,req,res);
                        });
                    }
                    }else{
                        response.responseCode = 1; response.response = "Error with User Group Name while fetching tracks."; return res.json(response);
                    } 
                            }
                } catch(err) {
                    global.logger.error("No Tracks", err);
                    response.responseCode = -1; response.response="No Tracks"; return res.json(response); 
                }  
                })             
                } catch(err) {
                    global.logger.error("No Tracks", err);
                    response.responseCode = -1; response.response="No Tracks"; return res.json(response); 
                }               
    },
    getAllTracksCallback: function(trackIdArr,req, res){
        var sortQuery={created_on:-1};  
        global.dbo.collection('podcast_recordings').find({"isAvailable":true,"_id":{ $in: trackIdArr}}).sort(sortQuery).toArray(function(errIn, resultIn) {
       // global.dbo.collection('podcast_tracks.files').find({"metadata.isAvailable":true,"_id":{ $in: trackIdArr}}).sort(sortQuery).toArray(function(errIn, resultIn) {
            if (errIn) {
                global.logger.error("Error in DB transaction", errIn);
                response.responseCode = -1; response.response = "Error in DB transaction"; return res.json(response); 
            } 
            else{
                resultIn = resultIn.sort(function(a, b){ 
                    trackIdArr = trackIdArr.map(String);
                    console.log("test trackIdArr", trackIdArr);
                    return trackIdArr.indexOf(String(a._id)) - trackIdArr.indexOf(String(b._id));
                });
                response.responseCode = 1; response.response = resultIn; return res.json(response);
            }
        });
    },
    getAllRecordings: function(req, res) {
                try {
                    global.logger.info("inside getAllTracks>> ",req.params.cec_id);  
                    //var query ={$or:[{"metadata.author":req.params.cec_id},{"metadata.created_by":req.params.cec_id}]};
                   // var query={$and:[{$or:[{"author":req.params.cec_id},{"metadata.created_by":req.params.cec_id}]},{"metadata.isAvailable":true}]};
                   var query={$and:[{$or:[{"author":req.params.cec_id},{"created_by":req.params.cec_id}]},{"isAvailable":true}]};
                    var sortQuery={created_on:-1};
                   // global.dbo.collection('podcast_tracks.files').find(query).sort(sortQuery).toArray(function(err, result) {
                    global.dbo.collection('podcast_recordings').find(query).sort(sortQuery).toArray(function(err, result) {   
                        if (err) {
                                global.logger.error("Error in DB transaction", err);
                                response.responseCode = -1; response.response = "Error in DB transaction fetching all recordings. "; return res.json(response); 
                                }
                        if(result == null || result.length ===0 ){
                            response.responseCode = 1;response.response = result;return res.json(response);
                        }else{
                            response.responseCode = 1; response.response = result;return res.json(response);
                        }
                    });
                } catch(err) {
                    response.responseCode = -1;response.response="No Recordings"; return res.json(response); 
                }               
    },
    uploadWithImage: function(req, res) {
                var uppload = multer({ dest: 'uploadedfiles/' });
                var cpUpload = uppload.fields([{ name: 'imgfile', maxCount: 1 }, { name: 'audfile', maxCount: 1 }]);
                 cpUpload(req, res, (err) => {
                if (err) {
                      global.logger.error("Upload Request Validation Failed", err);
                     response.responseCode = -1; response.response ="Upload Request Validation Failed"; return res.json(response);
                }
                for(i=0;i<req.files.length;i++)
                {
                global.logger.info("filename "+req.files[i].filename+" path "+req.files[i].path);
                var file = __dirname + '/' + req.files[i].filename;
                fs.rename(req.files[i].path, file, function(err) {
                if (err) {
                   global.logger.error("Upload Request Validation Failed", err);
                    response.responseCode = -1; response.response ="Upload Request Validation Failed"; return res.json(response);
                } else {                   
                global.logger.info("File uploaded successfully Filename:",req.file.filename);
                }
            });
        }
        response.responseCode = 1; response.response ="File uploaded successfully",req.files;return res.json(response);
        });            
    },
    uploadCallback: function(uploadStream, query, req, res){                                  
                    var db =  global.dbo;//.db("nqonxs3xdev")
                    let id = uploadStream.id;                        
                    global.logger.info("req.files['track']>>>",req.files['track']);
                        uploadStream.on('finish', () => {
                            db.collection("podcast_tracks.files").updateOne({"_id":id}, { $set:query}, function(err, res) {
                                if (err) {
                                    global.logger.error("Error in DB transaction", err);
                                    response.responseCode = -1; response.response = "Error in DB transaction"; return res.json(response);   
                                }
                                global.logger.info("Document updated");
                            }); 
                            response.responseCode = 1;
                            response.response = "File uploaded successfully, stored under Mongo ObjectID: " + id ;
                            return res.json(response);
                        });
    },
    uploadTrack: function(req, res) {
        try{
          		global.logger.info("In  upload get user",global.user);
                global.logger.info("inside upload track",req.body);
                const storage = multer.memoryStorage();
          		global.logger.info("In storage");
                var db =  global.dbo;
          		global.logger.info("In db");
                var track_icon = null;
                const upload = multer({ storage: storage});
               // const upload = multer({ storage: storage, limits: { fields: 10, fileSize: 10000000, files: 2, parts: 10 }});
          		global.logger.info("In  const upload removed limits");
          		global.logger.info("removed limits in const upload");
                upload.fields([{
                        name: 'track', maxCount:1
                    },
                    {
                        name: 'track_icon', maxCount:1
                    }
                ])(req, res, err =>{ 
                    
                    if (err) {
                        global.logger.error("Upload Request Validation Failed",err);
                        response.responseCode = -1; response.response = "Upload Request Validation Failed: "+err.message; return res.json(response);  
                    }
                    try{                    
                    global.logger.info("inside capturing request");
                    var track_extension = req.files.track[0].mimetype;
                    if (!track_extension.match("^audio")) {
                        global.logger.error("invalid file type, please upload a MP3 file format");
                        response.responseCode = -1; response.response = "invalid file format"; return res.json(response);  
                    }
                    else if(!req.body.name || req.body.name==null) {
                        global.logger.error("inside uploadTrack, name of recording not present");
                        response.responseCode = -1; response.response = "name of recording not present"; return res.json(response);  
                    }
                    else if(!req.files['track'] || req.files['track']==null) {
                        global.logger.error("inside uploadTrack, track of recording not present");
                        response.responseCode = -1; response.response = "track of recording not present"; return res.json(response);  
                    }
                    else if(!req.body.description || req.body.description==null || req.body.description.length>=500) {
                        global.logger.error("inside uploadTrack, description not present or length greater than 500");
                        response.responseCode = -1; response.response = "description not present or length greater than 500"; return res.json(response);  
                    }
                    else if(!req.body.authorName || req.body.authorName==null) {
                        global.logger.error("inside uploadTrack, Author name not present");
                        response.responseCode = -1; response.response = "Author name not present"; return res.json(response);  
                    }
                    else if(!req.body.requestedBy || req.body.requestedBy==null) {
                        global.logger.error("inside uploadTrack, requestedBy not present");
                        response.responseCode = -1; response.response = "requestedBy not present"; return res.json(response);  
                    }
                   /* else if(!req.body.groupName || req.body.groupName==null) {
                        global.logger.error("inside uploadTrack, groupName not present");
                        response.responseCode = -1; response.response = "groupName not present"; return res.json(response);  
                    }*/
                    let fullName = "";
                    if(!req.headers.fullname ||req.headers.fullname==null){
                        fullName=req.body.fullName;
                    }
                    else{
                        fullName=req.headers.fullname;
                    }
                   // req.files['track']
                   // req.files['track_icon']
                    let trackName = req.body.name;
                    let trackDescription =req.body.description;
                    let authorName =req.body.authorName;
                    let requestedBy =req.body.requestedBy;
                   // let groupName =req.body.groupName;
                    
                    if(req.body.isTrackIconFile === "true"){
                        if(!req.files['track_icon'] || req.files['track_icon']==null){
                        global.logger.error("inside uploadTrack, track_icon of recording not present");
                        response.responseCode = -1; response.response = "track_icon of recording not present"; return res.json(response);  }
                        else{                      
                            track_icon =  req.files['track_icon'];
                        global.logger.info("Else Tracktrue");}
                    }
                    else if(req.body.isTrackIconFile === "false"){
                        if(!req.body.track_icon || req.body.track_icon==null){
                        global.logger.error("inside uploadTrack, default track_icon of recording not present in body");
                        response.responseCode = -1; response.response = "default track_icon of recording not present in body"; return res.json(response); } 
                        else{
                             base64Img.base64(req.body.track_icon, function(err, data) {
                        if (err) {
                                global.logger.error("Error in base64 processing", err);
                                response.responseCode = -1; response.response = "Error in base64 processing"; return res.json(response); }
                        track_icon = data;
                                 global.logger.info("Else Trackfalse");
                       });
                        }
                    }
    
                    global.logger.info("request body: ",req.body);

                     // Covert buffer to Readable Stream
                     const readableTrackStream = new Readable();
                     readableTrackStream.push(req.files['track'][0].buffer);
                     readableTrackStream.push(null);
                 
                     let bucket = new mongodb.GridFSBucket(db, {
                         bucketName: 'podcast_tracks',
                     });

                    let uploadStream = bucket.openUploadStream(trackName);
                    let id = uploadStream.id;
                    readableTrackStream.pipe(uploadStream);
                
                    uploadStream.on('error', () => {
                        global.logger.error("In uploadStream error,Error uploading file ");
                        response.responseCode = -1; response.response = "In uploadStream error,Error uploading file"; return res.json(response);  
                    });

                    uploadStream.on('finish', () => {
                        try{
                        var query={metadata: { description: trackDescription, author: authorName, duration: "", created_by: requestedBy, created_on: new Date() , modified_on:new Date(), modified_by: requestedBy, isAvailable:true, track_icon: track_icon,full_name:fullName}};
                        db.collection("podcast_tracks.files").updateOne({"_id":id}, { $set:query}, function(err, res) {
                            if (err) {
                                    global.logger.error("Error in DB transaction", err);
                                    response.responseCode = -1; response.response = "Error in DB transaction"; return res.json(response);   
                                }
                            global.logger.info("Document updated");
                        }); 
                        response.responseCode = 1;
                        response.response = "File uploaded successfully, stored under Mongo ObjectID: " + id ;
                        return res.status(201).json(response);
                        }
                        catch(err){
                          global.logger.error("In uploadStream finish, Error uploading file",err);
                          response.responseCode = -1; response.response = "In uploadStream finish,Error uploading file"; return res.json(response);  
                        }
                    });
                }catch(err){
                          global.logger.error("In upload,Error uploading file",err);
                          response.responseCode = -1; response.response = "In upload,Error uploading file"; return res.json(response);  
                        }
                });
        }
        catch(err){
          global.logger.error("Error uploading file",err);
          response.responseCode = -1; response.response = "Error uploading file"; return res.json(response);  
        }
    },
    logActionOnTrack: function(req, res){
        try {
            var dateTime = new Date();
            var logObj = {};
            logObj.cecId = req.body.user_id;
            logObj.dateTime = dateTime;
            logObj.trackId = req.body.track_id;
            logObj.userAction = req.body.user_action;
            global.dbo.collection("podcast_user_action_log").insertOne(logObj, function(err, resp) {
                if (err) {
                    global.logger.error("Error in DB transaction", err);
                    response.responseCode = -1; response.response = "Error in DB transaction"; return res.json(response);
                }
                else{
                    response.responseCode = 1; response.response = "log added for user action " + logObj.userAction + " on track";
                    return res.json(response);
                }
                
            });
            
        } catch(err) {
            global.logger.error("Error in DB transaction", err);
            response.responseCode = -1; respone.response = "Error in DB transaction"; return res.json(response);
        }    
    },
    uploadURICallback : function(req, res, db, query){
        try{
      //  var query={metadata: { description: trackDescription, author: authorName, duration: "", created_by: requestedBy, created_on: new Date() , modified_on:new Date(), modified_by: requestedBy, isAvailable:true, track_icon: track_icon,full_name:fullName, url: uri}};
        db.collection("podcast_recordings").insertOne(query, function(err, result) {
            if (err) {
                global.logger.error("Error in DB transaction while adding recording details. ", err);
                response.responseCode = -1; response.response = "Error in DB transaction while adding recording details."; return res.json(response);   
            }else{
                response.responseCode = 1;
                response.response = "File uploaded successfully, stored under Mongo ObjectID: "  ;
                return res.status(201).json(response);
            }
            global.logger.info("Recording Document added");
        }); 
        
        }
        catch(err){
          global.logger.error("In uploadStream finish, Error uploading file",err);
          response.responseCode = -1; response.response = "In uploadStream finish,Error uploading file"; return res.json(response);  
        }
    },
    download: function(req, res) {
       
        
          var request = https.get("https://fdk-stage.cisco.com/c/dam/assets/podcast/1RegionalITOverview-KattyCoulson-May2017.mp3", function(response) {
            var data = [];
        
            response.on('data', function(chunk) {
              data.push(chunk);
            });
        
            response.on('end', function() {
              data = Buffer.concat(data);
              console.log('parsed content length: ', data.length);
              res.writeHead(200, {
                'Content-Type': 'application/audio/mpeg3',
                'Content-Disposition': 'attachment; filename=audio.mp3',
                'Content-Length': data.length
              });
              res.end(data);
            });
          });
        
          request.end();
    },
    uploadTrackURI: function(req, res) {
        try{
          		global.logger.info("In  upload URI get user",global.user);
                global.logger.info("inside upload track URI",req.body);
                var db =  global.dbo;
          		global.logger.info("In db");
                var track_icon = null;
                const storage = multer.memoryStorage();
                const upload = multer({ storage: storage, limits: { fields: 10, fileSize: 10000000, files: 2, parts: 10 }});
                upload.fields([
                    {
                        name: 'track_icon', maxCount:1
                    }
                ])(req, res, err =>{ 
                    
                    if (err) {
                        global.logger.error("Upload Request Validation Failed",err);
                        response.responseCode = -1; response.response = "Upload Request Validation Failed: "+err.message; return res.json(response);  
                    }
                    try{                    
                    global.logger.info("inside capturing request");
                 
                    if(!req.body.fileURL || req.body.fileURL==null) {
                        global.logger.error("inside uploadTrack, URI of recording not present");
                        response.responseCode = -1; response.response = "uri of recording not present"; return res.json(response);  
                    }
                    else if(!req.body.name || req.body.name==null) {
                        global.logger.error("inside uploadTrack, name of recording not present");
                        response.responseCode = -1; response.response = "name of recording not present"; return res.json(response);  
                    }
                    else if(!req.body.description || req.body.description==null || req.body.description.length>=500) {
                        global.logger.error("inside uploadTrack, description not present or length greater than 500");
                        response.responseCode = -1; response.response = "description not present or length greater than 500"; return res.json(response);  
                    }
                    else if(!req.body.authorName || req.body.authorName==null) {
                        global.logger.error("inside uploadTrack, Author name not present");
                        response.responseCode = -1; response.response = "Author name not present"; return res.json(response);  
                    }
                    else if(!req.body.requestedBy || req.body.requestedBy==null) {
                        global.logger.error("inside uploadTrack, requestedBy not present");
                        response.responseCode = -1; response.response = "requestedBy not present"; return res.json(response);  
                    }
                   
                    let fullName = "";
                    if(!req.headers.fullname ||req.headers.fullname==null){
                        fullName=req.body.fullName;
                    }
                    else{
                        fullName=req.headers.fullname;
                    }
                   
                    let uri = req.body.fileURL;
                    let trackName = req.body.name;
                    let trackDescription =req.body.description;
                    let authorName =req.body.authorName;
                    let requestedBy =req.body.requestedBy;
                    
                    if(req.body.isTrackIconFile === "true"){
                        if(!req.files['track_icon'] || req.files['track_icon']==null){
                            global.logger.error("inside uploadTrack, track_icon of recording not present");
                            response.responseCode = -1; response.response = "track_icon of recording not present"; return res.json(response);  
                        }
                        else{                      
                            track_icon =  req.files['track_icon'];
                            var query={ filename: trackName, description: trackDescription, author: authorName, duration: "", created_by: requestedBy, created_on: new Date() , modified_on:new Date(), modified_by: requestedBy, isAvailable:true, track_icon: track_icon,full_name:fullName, url: uri};
                            global.logger.info("Else Tracktrue");
                            trackAPI.uploadURICallback(req, res, db, query);
                        }
                    }
                    else if(req.body.isTrackIconFile === "false"){
                        if(!req.body.track_icon || req.body.track_icon==null)
                        {
                            global.logger.error("inside uploadTrack, default track_icon of recording not present in body");
                            response.responseCode = -1; response.response = "default track_icon of recording not present in body";
                            return res.json(response);
                        } 
                        else{
                            base64Img.base64(req.body.track_icon, function(err, data) {
                                if (err) {
                                    global.logger.error("Error in base64 processing", err);
                                    response.responseCode = -1; response.response = "Error in base64 processing"; 
                                    return res.json(response); 
                                }
                                track_icon = data;
                                global.logger.info("Else Trackfalse", data);
                                var query={ filename: trackName, description: trackDescription, author: authorName, duration: "", created_by: requestedBy, created_on: new Date() , modified_on:new Date(), modified_by: requestedBy, isAvailable:true, track_icon: track_icon,full_name:fullName, url: uri};
                                trackAPI.uploadURICallback(req, res, db, query);
                            });
                        }
                    }
    
                    global.logger.info("request body: ",req.body);

                }catch(err){
                          global.logger.error("In upload,Error uploading file",err);
                          response.responseCode = -1; response.response = "In upload,Error uploading file"; return res.json(response);  
                        }
                });
        }
        catch(err){
          global.logger.error("Error uploading file",err);
          response.responseCode = -1; response.response = "Error uploading file"; return res.json(response);  
        }
    }
};
  

module.exports = trackAPI;
