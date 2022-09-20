var express = require('express');
var router = express.Router();
var request = require('request');

var fs = require('fs');

var track = require('../track/trackAPI');
var notification = require('../notifications/notificationAPI');
var user = require('../user/userAPI');

//list down API calls in router and let individual module handle them
router.get('/api/singleTrack/:trackID/:sessionID', track.getTrack);
router.get('/api/getTrackURI', track.getTrackURI);
router.post('/api/uploadTrack/', track.uploadTrack);
router.post('/api/uploadTrackURI/', track.uploadTrackURI);
router.get('/api/allTracks/:groupNames',track.getAllTracks);
router.post('/api/uploadWithImage',track.uploadWithImage);
router.get('/api/allRecordings/:cec_id',track.getAllRecordings);
router.post('/api/deleteTrack',track.deleteTrack);
router.post('/api/logOnTrack', track.logActionOnTrack);
//router.get('/api/download', track.download);

router.get('/api/getUser/:userID', user.getUser);
router.get('/api/getUserWOParam/', user.getUserWOParam);
router.post('/api/addUser', user.addUser);
router.post('/api/logUserLogin', user.logUserLogin);

router.get('/api/allNotifications/:cec_id',notification.getNotifications);
router.post('/api/updateNotifications',notification.updateNotification);
router.post('/api/shareTrack',notification.shareTrack);
router.get('/api/getShareGroups/',notification.getShareGroups);
router.get('/api/getNewNotificationsCount/:cec_id',notification.getNewNotificationsCount);

/*router.get('/index.html',function(req, res){
    global.logger.info("inside /index call ", req.headers);
    fs.readFile('./index.html', function (err, html) {
        if (err) throw err;  
        res.writeHeader(200, {"Content-Type": "text/html"});  
        res.write(html);  
        res.end();    
    });
});*/

module.exports = router;
