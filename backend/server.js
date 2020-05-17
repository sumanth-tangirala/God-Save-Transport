const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const firebase = require('firebase/database');

const app = express();
app.use(bodyParser.json());

// Define Firebase DB
var config = {
  apiKey: "AIzaSyAQFvW9xPnMyPtNqw0dyZBTg_UyPgPhHWA",
  authDomain: "god-save-transport-c8155.firebaseapp.com",
  databaseURL: "https://god-save-transport-c8155.firebaseio.com/",
  storageBucket: "bucket.appspot.com"
};
firebase.initializeApp(config);
var database = firebase.database();

// Define routers
const main = require('./routes/main.js');

// Link routers with routes
app.use('/', main);

// Start server
const server = app.listen(8080, () => {
  const host = server.address().address;
  const port = server.address().port;

  console.log(`Example app listening at http://${host}:${port}`);
});