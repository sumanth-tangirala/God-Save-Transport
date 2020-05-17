var express = require('express');
const bodyParser = require('body-parser');
const firebase = require('firebase');

const metadataRouter = express.Router();
metadataRouter.use(bodyParser.json());

var database = firebase.database();

var dict = [];
var i;

metadataRouter.route('/')
	.get((req,res,next)=>{
		// get ref to all routes
		var ref = firebase.database().ref('/routes/');
		ref.on("value", function(routeListSnapshot) {

			var totalCount = routeListSnapshot.numChildren();

			// loop through all stops on every route
		
			const promisesArray = [];
			routeListSnapshot.forEach( function(routeInfoSnapshot) {
				var dictEntry = {
					RouteNumber: "",
					Start: "",
					Stop: ""
				}
				dictEntry.RouteNumber = routeInfoSnapshot.key;

				var stop = routeInfoSnapshot.child();
				var childData = routeInfoSnapshot.val();
				
				// hacky way to get a ref to each route
				var ref2 = firebase.database().ref('/routes/' + routeInfoSnapshot.key).limitToFirst(1);
				let promise1 = ref2.once("value")
				.then( function(routeSnapshot) {
					// loop through each stop on every route
					routeSnapshot.forEach( function(firstStopSnapshot) {
						// console.log(childSnapshot2.val());
						dictEntry.Start = firstStopSnapshot.val();
					})
				})
				.catch((err)=>{
					console.log(err);
				});
				// same thing but for the last one
				var ref3 = firebase.database().ref('/routes/' + routeInfoSnapshot.key).limitToLast(1);
				let promise2 = ref3.once("value")
				.then( function(routeSnapshot2) {
					// loop through each stop on every route
					routeSnapshot2.forEach( function(lastStopSnapshot) {
						// console.log(childSnapshot3.val());
						dictEntry.Stop = lastStopSnapshot.val();
					})
				})
				.catch((err)=>{
					console.log(err);
				});

				dict.push(dictEntry);
				promisesArray.push(Promise.all([promise1, promise2]));
			})
			Promise.all(promisesArray).then(()=>{
				res.send(dict);
			})
		})
	});

module.exports = metadataRouter;