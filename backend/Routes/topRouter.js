
var express = require('express');
const bodyParser = require('body-parser');
const firebase = require('firebase');
const axios = require('axios');

const topRouter = express.Router();
topRouter.use(bodyParser.json());

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

var routeNum;
var arrDicts = [];
const promisesArray = [];
var k = 1;

function getTopNums(res,routeNum){
    var dict2 = [];
    // get ref to specific route ID
    var ref = firebase.database().ref('/routes/' + routeNum).orderByKey();
    ref.once("value")
    .then(function(routeSnapshot) {
        // loop through the stops for that specific route
        let index = 0;
        routeSnapshot.forEach( function(stopSnapshot) {
            var dictEntry2 = {
                StopName: "",
                Lat: "",
                Long: "",
                XFactor_pre_norm: "",
                XFactor_post_norm: "",
                index:""
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
                dictEntry2.XFactor_pre_norm = (vals.sum / vals.count) * scaling;
                dictEntry2.XFactor_post_norm = (vals.sum / vals.count) * scaling / norm_factor;
                dictEntry2.index = stopIndex;
                // console.log(dictEntry2);
                dict2.push(dictEntry2);
                if(stopIndex == routeSnapshot.numChildren()){
                    arrDicts.push(dict2);
                }
            })
            .catch(error => {
                console.log(error.message);
            });
            promisesArray.push(promise)
            index++;
            //console.log("promise array size: " + promisesArray.length);

        })
        Promise.all(promisesArray).then(() => {
            console.log("after resolve all promise array size: " + promisesArray.length);
            console.log("about to return ############");
            //dict2.sort(function(a,b){return a.index - b.index});
            // console.log(arrDicts);
            if(k==1){
                console.log(arrDicts.length);
                res.send(arrDicts);
                k--;
            }
            else{
                console.log("value of k " + k + "not sendig");
            }

        })
        .catch(err => {
            console.log(err.message);
        })
    })
}

topRouter.route('/:topNum')
    .get((req,res,next)=>{

        for(routeNum= 1; routeNum < 2; routeNum++){
            getTopNums(res,routeNum);
        }

    });

module.exports = topRouter;