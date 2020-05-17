const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const firebase = require('firebase');

const app = express();
app.use(bodyParser.json());

// Define Firebase DB
var config = {
  apiKey: "AIzaSyAQFvW9xPnMyPtNqw0dyZBTg_UyPgPhHWA",
  authDomain: "god-save-transport-c8155.firebaseapp.com",
  databaseURL: "https://god-save-transport-c8155.firebaseio.com/",
  storageBucket: "god-save-transport-c8155.appspot.com"
};
firebase.initializeApp(config);
var database = firebase.database();

// Define routers
const metadataRouter = require('./routes/metadataRouter.js');
const routeidRouter = require('./routes/routeidRouter.js');
const topRouter = require('./routes/topRouter.js');

// Link routers with routes
//app.use('/', routeidRouter); // temp: can delete once hooked up with react
app.use('/routes', routeidRouter);
app.use('/metadata', metadataRouter);
app.use('/topNums', topRouter);

// Start server
const server = http.createServer(app);
const hostname = 'localhost';
const port = 3000;
server.listen(port,hostname,()=>{
	console.log(`Server running at http://${hostname}:${port}`);
});