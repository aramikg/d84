//server.js
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var swig = require('swig');
var path = require('path');
var mongodb = require('mongodb');
var colors = require('colors');
var multer = require('multer');
var util = require("util");
var router = express.Router();

if (process.env.NODE_ENV === "development") {
  server.listen(7000);
} else {
  server.listen(80);
}

app.engine('html',swig.renderFile);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'static')));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(multer({
  dest: "public/uploads"
}));

var db = new mongodb.Db('site', new mongodb.Server('127.0.0.1', 27017), {safe:true});

/* ROUTES */
//var apiRoute = require('./routes/api');
app.get('/', function (req, res) {
  db.open(function(err) { //save to db
    if (!err) {
      db.collection("site",function(err,collection) {
        collection.find().toArray(function(err, result) {
          if (err) {
            res.send(err)
          } else {
              res.render('index',{site:result});
            db.close();
          }
        });
      });
    } else {
      console.log('       ERROR: database error -> '.error.bold + err);
      res.send({error: {message:"error ->" + err}})
    }
  }); //end db
});

app.get('/admin', function (req, res) {
  db.open(function(err) { //save to db
    if (!err) {
      db.collection("site",function(err,collection) {
        collection.find().toArray(function(err, result) {
          if (err) {
            res.send(err)
          } else {
            res.render('admin/index',{site:result});
            db.close();
          }
        });
      });
    } else {
      console.log('       ERROR: database error -> '.error.bold + err);
      res.send({error: {message:"error ->" + err}})
    }
  }); //end db
});


//db structure
var system = {
  "info": {
    "version": 0.01,
    "build": 1
  },
  "accounts": {
    "admin": "password"
  },
  "globals" : [{name:"asdf"},{version:1}],
  "site" : {
    "name": "my simpleWeb",
    "description": "the simpliest way to create and manage your site"
  }
}


/* SOCKET STUFF */
io.on('connection', function (socket) {
  console.log(socket.id + ' connected!');
  var world = socket.handshake.headers.host;



  socket.join(world); //join domain room

  socket.on('update',function(data) {
    console.log("recieved update from " + socket);
    io.to(world).emit('response',data);
    var key = data[0];
    var val = data[1];
    var prevVal = data[2];

    var db = new mongodb.Db('site', new mongodb.Server('127.0.0.1', 27017), {safe:true});

    db.open(function(err) { //save to db
      if (!err) {
        db.collection("site",function(err,collection) {

          var query = {};
          query[key] = prevVal;

          var update = {};
          update[key] = val;

          collection.update(query, {$set: update},{update:true,upsert:true},function(err,result) {

            if (err) {
              console.log('error while saving photo to db ->'.error + err);
            } else {
              console.log('updated'.green + " " + result);
              db.close();
            }
          });
        });
      } else {
        console.log('       ERROR: database error -> '.error.bold + err);
      }
    }); //end db
  });



  socket.on('remove',function(data) {
    var key = data[0];
    var val = data[1];
    var prevVal = data[2];
    io.to(world).emit('response',data);
    var db = new mongodb.Db('site', new mongodb.Server('127.0.0.1', 27017), {safe:true});

    db.open(function(err) { //save to db
      if (!err) {
        db.collection("site",function(err,collection) {

          var query = {};
          query[key] = prevVal;

          var update = {};
          update[key] = val;

          collection.update(query, {$unset: update},function(err,result) {

            if (err) {
              console.log('error while saving photo to db ->'.error + err);
            } else {
              console.log('updated'.green + " " + result);
              db.close();
            }
          });
        });
      } else {
        console.log('       ERROR: database error -> '.error.bold + err);
      }
    }); //end db
  });


  socket.on('disconnect',function(data) {
    console.log(socket.id + ' disconnected!');
  });
});
