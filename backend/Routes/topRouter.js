
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

var promise = new Promise(function(resolve, reject))

var getTopNums(routeNum){
    var dict2 = [];
    // get ref to specific route ID
    var ref = firebase.database().ref('/routes/' + routeNum).orderByKey();
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
                //console.log(scaling);
                //console.log(norm_factor);
                dictEntry2.XFactor_pre_norm = (vals.sum / vals.count) * scaling;
                dictEntry2.XFactor_post_norm = (vals.sum / vals.count) * scaling / norm_factor;
                dictEntry2.index = stopIndex;
                console.log(dictEntry2);
                dict2.push(dictEntry2);
            })
            .catch(error => {
                console.log(error.message);
            });
            promiseArray.push(promise);
            index++;
        })
        Promise.all(promiseArray).then(() => {
            console.log("about to return ############");
            dict2.sort(function(a,b){return a.index - b.index});
            arrDicts.push(dict2);
        })
    })
}

var i;
var arrDicts = [];
topRouter.route('/:topNum')
    .get((req,res,next)=>{
        console.log("outside");
        for(i = 1; i < 2; i++){
            getTopNums(i, arrDicts);
            //arrDicts.push(getTopNums(i));
        }
        console.log("outside 2");
        res.send(arrDicts);
    });

module.exports = topRouter;