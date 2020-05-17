
var express = require('express');
const bodyParser = require('body-parser');

const metadataRouter = express.Router();
metadataRouter.use(bodyParser.json());

const firebase = require('firebase');
var database = firebase.database();

var dict = [];

var i;

metadataRouter.route('/')
	.get((req,res,next)=>{
		// get ref to all routes
		var ref = firebase.database().ref('/routes/');
		ref.on("value", function(snapshot) {
			var dictEntry = {
				RouteNumber: "",
				Start: "",
				Stop: ""
			}
			// loop through all stops on every route
			snapshot.forEach( function(childSnapshot) {
				dictEntry.RouteNumber = childSnapshot.key;

				var stops = childSnapshot.numChildren();
				var childData = childSnapshot.val();
				
				// hacky way to get a ref to each route
				var ref2 = firebase.database().ref('/routes/' + childSnapshot.key).limitToFirst(1);
				ref2.on("value", function(snapshot2) {
					// loop through each stop on every route
					snapshot2.forEach( function(childSnapshot2) {
						// console.log(childSnapshot2.val());
						dictEntry.Start = childSnapshot2.val();
					})
				})

				// same thing but for the last one
				var ref3 = firebase.database().ref('/routes/' + childSnapshot.key).limitToLast(1);
				ref3.on("value", function(snapshot3) {
					// loop through each stop on every route
					snapshot3.forEach( function(childSnapshot3) {
						// console.log(childSnapshot3.val());
						dictEntry.Stop = childSnapshot3.val();
					})
				})

				dict.push(dictEntry);
				// console.log(dictEntry);
			})
		})

		res.send(dict);
	});

module.exports = metadataRouter;