var express = require('express');
const bodyParser = require('body-parser');
const firebase = require('firebase');
const axios = require('axios');

const routeidRouter = express.Router();
routeidRouter.use(bodyParser.json());

var database = firebase.database();

function computeFFSum(data){
	let count = 0;
	let sum = 0;
	data.RWS.forEach((RWS)=>{
		RWS.RW.forEach((RW)=>{
			RW.FIS.forEach((FIS)=>{
				FIS.FI.forEach((FI)=>{
					FI.CF.forEach((CF)=>{
						sum += CF.FF;
						count++;
					})
				})
			})
		})
	})
	return {
		count,
		sum
	}
};

routeidRouter.route('/:routeid')
	.get((req,res,next)=>{
		var dict2 = [];
		// get ref to specific route ID
		var ref = firebase.database().ref('/routes/' + req.params.routeid).orderByKey();
		ref.on("value", function(routeSnapshot) {
			// loop through the stops for that specific route
			let index = 0;

			let promiseArray = [];
			routeSnapshot.forEach( function(stopSnapshot) {
				var dictEntry2 = {
					StopName: "",
					Lat: "",
					Long: "",
					XFactor_pre_norm: "",
					XFactor_post_norm: "",
					index:"",
					intensity:""
				}
				var stop = stopSnapshot.val();
				let stopIndex = index;

				var ref2 = firebase.database().ref('/stops/' + stop);
				let promise = ref2.once("value")
				.then (function(stopInfoSnapshot) {
					var value = stopInfoSnapshot.val();
					dictEntry2.StopName = stopInfoSnapshot.key;
					dictEntry2.Lat = value["lat"];
					dictEntry2.Long = value["lng"];

					return axios.get('https://traffic.ls.hereapi.com/traffic/6.2/flow.json?apiKey=wb620JMpEXicArNCaVP9aNNFOejRxRpKl7STGIkeGmw&prox='+value['lat']+','+value['lng']+','+'1')
				}).then(response => {
					var vals = computeFFSum(response.data);
					var scaling = routeSnapshot.numChildren() - stopIndex;
					var norm_factor = routeSnapshot.numChildren() * (routeSnapshot.numChildren() + 1)/2;
					console.log(scaling);
					console.log(norm_factor);
					dictEntry2.XFactor_pre_norm = (vals.sum / vals.count) * scaling;
					dictEntry2.XFactor_post_norm = (vals.sum / vals.count) * scaling / norm_factor;
					if(dictEntry2.XFactor_post_norm <= 0.25){
						dictEntry2.intensity = 0;
					}
					else if(dictEntry2.XFactor_post_norm <= 0.8){
						dictEntry2.intensity = 1;
					}
					else if(dictEntry2.XFactor_post_norm <= 1.3){
						dictEntry2.intensity =3;
					}
					else{
						dictEntry2.intensity = 2;
					}

					dictEntry2.index = stopIndex;

					dict2.push(dictEntry2);
				})
				.catch(error => {
					console.log(error.message);
				});
				promiseArray.push(promise);
				index++;
			})
			Promise.all(promiseArray).then(() => {
				dict2.sort(function(a,b){return a.index - b.index});
				res.send(dict2);
			})
		})
	});

module.exports = routeidRouter;