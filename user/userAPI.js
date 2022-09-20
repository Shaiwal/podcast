var User = require('./user');
const config = require('../config');
var response = config.response;
var userAPI = {

    getUser: function(req, res) {
                var user = null;
                try {
                  /*  global.logger.info("inside getUser>> ", req.params.userID);             
                    var query = { "cec_id": req.params.userID };*/
                    global.logger.info("inside getUser>> ", req.headers.userid);             
                    var query = { "cec_id": req.headers.userid }; //.db("Podcast")
                    global.dbo.collection("podcast_users").find(query).toArray(function(err, result) {
                        if (err) {
                        global.logger.error("Error in DB transaction", err);
                        response.responseCode = -1; response.response = "Error in DB transaction"; return res.json(response);
                        }                  
                        if(result == null || result.length ===0 ){
                            response.responseCode = -1; response.response = null; return res.json(response);
                        }else{
                            user = result[0]; 
                            response.responseCode = 1; response.response = user; return res.json(response);
                        }     
                    });
                } catch(err) {
                    global.logger.error("Error in DB transaction", err);
                    response.responseCode = -1; response.response = "Error in DB transaction"; return res.json(response);
                }               
    },
    getUserWOParam: function(req, res) {
        global.user = {
            cecId : req.headers.uid,
            fullname : req.headers.fullname,
            //role : "user"
        }
       /* global.user = {
            cecId : "shivang2",
            fullname : "Shaiwal Tharma",
        }*/
        try {
          /*  global.logger.info("inside getUser>> ", req.params.userID);             
            var query = { "cec_id": req.params.userID };*/
            global.logger.info("inside getUserWOParam>> ", req.headers.userid);             
            var query = { "cecId": global.user.cecId }; 
            //.db("nqonxs3xdev")
            global.dbo.collection("podcast_users").find(query).toArray(function(err, result) {
                if (err) {
                    global.logger.error("Error in DB transaction", err);
                    response.responseCode = -1; response.response = "Error in DB transaction"; return res.json(response);
                }   
                if(result == null || result.length === 0 ){
                   // response.responseCode = 1; response.response = global.user; return res.json(response);
                   response.responseCode = -1; response.response = "No such user exists"; return res.json(response);
                }else{
                   // user = result[0]; 
                    global.user.roles = result;
                    //global.user.groupName = result[0].groupName;
                    console.log("User:: ", global.user);
                    response.responseCode = 1; response.response = global.user; return res.json(response);
                }     
            });
        } catch(err) {
            global.logger.error("Error in DB transaction", err);
            response.responseCode = -1; response.response = "Error in DB transaction"; return res.json(response);
        }               
    },
    addUser: function(req, res) {
                try {
                    global.logger.info("inside addUser>> ", req.body);
                    var usr = new User(), params = req.body;
                    usr.cec_id = params.cec_id;//for required parameters have validation
                    usr.role = params.role ? params.role ://for optional parameters
                    global.dbo.collection("podcast_users").insertOne(usr, function(err, resp) {
                    if (err) {
                    global.logger.error("Error in DB transaction", err);
                    response.responseCode = -1; response.response = "Error in DB transaction"; return res.json(response);
                    }
                    global.logger.info("1 document inserted", resp.insertedCount + " .. " + resp.insertedId);
                        if(resp != null && (resp.insertedCount === 1 &&  resp.insertedId != null) ){
                            response.responseCode = 1; response.response = res.insertedId; return res.json(response);
                        }else{
                            response.responseCode = -1; response.response = null; return res.json(response);
                        }
                    });
                    
                } catch(err) {
                    global.logger.error("Error in DB transaction", err);
                    response.responseCode = -1; response.response = "Error in DB transaction"; return res.json(response);
                }               
    },
    logUserLogin: function(req, res) {
        try {
            var cecId = req.headers.uid;
            if(cecId == null){
                cecId = "shaiwsha";
            }
            var dateTime = new Date();
            var browser = req.body.browser;
            var os = req.body.os;
            var logObj = {};
            logObj.cecId = cecId;
            logObj.dateTime = dateTime;
            logObj.browser = browser;
            logObj.os = os;
            global.logger.info("inside logUserLogin>> ", req.body);
            global.dbo.collection("podcast_login_access_log").insertOne(logObj, function(err, resp) {
            if (err) {
                global.logger.error("Error in DB transaction", err);
                response.responseCode = -1; response.response = "Error in DB transaction"; return res.json(response);
            }
            global.logger.info("1 document inserted", resp.insertedCount + " .. " + resp.insertedId);
            if(resp != null && (resp.insertedCount === 1 &&  resp.insertedId != null) ){
                console.log("User Session Id: ", resp.insertedId);
                response.responseCode = 1; response.response = resp.insertedId; return res.json(response);
            }else{
                response.responseCode = -1; response.response = null; return res.json(response);
            }
            });
            
        } catch(err) {
            global.logger.error("Error in DB transaction", err);
            response.responseCode = -1; response.response = "Error in DB transaction"; return res.json(response);
        }               
    }
};
  

module.exports = userAPI;



