const mongodb = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const config = require('./config');

/**
 * Connect Mongo Driver to MongoDB.
 */
var _db, dbEnv = config.devDB;

/*var dbUser =  String(process.env.MONGODB_USER);
var dbPass =  String(process.env.MONGODB_PASSWORD);
var dbHost =  String(process.env.MONGO_APP_NAME);
var dbPort =  String(process.env.MONGO_PORT);
var dbName =  String(process.env.MONGODB_DATABASE);*/
var dbUser =  String(process.env.MONGODB_CLOUD_USER);
var dbPass =  String(process.env.MONGODB_CLOUD_PASSWORD);
var dbHost =  String(process.env.MONGO_APP_NAME);
var dbPort =  String(process.env.MONGO_PORT);
var dbReplicaSet = String(process.env.MONGO_REPLICA_SET);
var dbReplicaHosts = String(process.env.MONGO_REPLICA_HOSTS);
var dbName =  String(process.env.MONGODB_DATABASE);

/*dbUser = "cdc_smb_user";
dbPass = "cdc_smb";
dbHost = "cdcsmbprodrepo-nqonxs3xdev-3-cdcsmbprodrepo.cloudapps.cisco.com";
dbPort = "35641";
dbName = "nqonxs3xdev";*/
/*dbUser = "cdc_smb_user";
dbPass = "cdc_smb";
dbHost = "cdcsmbprodrepo-yiz1kf3xstg-3-cdcsmbprodrepo.cloudapps.cisco.com";
dbPort = "55081";
dbName = "yiz1kf3xstg"*/;

//var dbURL = "mongodb://" + dbUser + ":" + dbPass + "@" + dbHost + ":" + dbPort + "/" + dbName; 
//,mgdb-cdcdev-npd2-1:27060,mgdb-cdcdev-npd3-1:27060
//var dbURL = "mongodb://cdcmodify:Mongo#1234@mgdb-cdcdev-npd1-1.cisco.com:27060,mgdb-cdcdev-npd2-1.cisco.com:27060,mgdb-cdcdev-npd3-1.cisco.com:27060/Personalization?replicaSet=cdcdevnpdrs";
var dbURL = "mongodb://" + dbUser + ":" + dbPass + "@" + dbReplicaHosts + "/" + dbName + "?replicaSet=" + dbReplicaSet; 

var env = process.env.CISCO_LC;
if(env === "poc"){
  dbEnv = config.devDB;
}else if(env === "b2x"){
  dbEnv = config.stageDB;
}

module.exports = {

  connectToServer: function( callback ) {
    console.log(dbEnv);
    MongoClient.connect( dbURL, { useNewUrlParser: true, useUnifiedTopology: true }, function( err, db ) {
      console.log("connection in DB error ", err);
      _db = db.db(dbName);//"Personalization"
      return callback( err, _db );
    } );
  },

  getDb: function() {
    return _db;
  }
};
