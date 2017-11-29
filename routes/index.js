var express = require('express');
var router = express.Router();
var stats = require("stats-lite");
var dice = require("dice");
//https://www.npmjs.com/package/stats-lite

var x_co_ords = []
var y_co_ords = []
var pressure = []
var size = []
var time = []

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/saveData',function(req,res,next){
	console.log("\n\n********\n\n URL Hit \n\n** ", req.body, " ** ** \n\n");
	var data = JSON.parse(Object.keys(req.body)[0]);
	
	for(var i=0;i<data.length;i++){
		console.log(i , data[i]);	
		x_co_ords.push(data[i].x);
		y_co_ords.push(data[i].y);
		pressure.push(data[i].pressure);
		size.push(data[i].size);
		// time.push(data[i].time);
	}
	
	getStats("x_co_ords",x_co_ords);
	getStats("y_co_ords",y_co_ords);
	getStats("pressure",pressure);
	getStats("size",size);
	// getStats("time",time);
	

	res.sendStatus(200);
});


function getStats(value,object){
	
	console.log("value is: ",value," object ",object);
	console.log("rolls is:",x_co_ords);

	console.log("sum: ",stats.sum(x_co_ords));
	console.log("mean: %s", stats.mean(x_co_ords))
	console.log("median: %s", stats.median(x_co_ords))
	console.log("mode: %s", stats.mode(x_co_ords))
	console.log("variance: %s", stats.variance(x_co_ords))
	console.log("standard deviation: %s", stats.stdev(x_co_ords))
	console.log("25th percentile: %s", stats.percentile(x_co_ords, 0.25))
	console.log("50th percentile: %s", stats.percentile(x_co_ords, 0.5))
	console.log("75th percentile: %s", stats.percentile(x_co_ords, 0.75))
	console.log("last percentile: %s", stats.percentile(x_co_ords, 1.00))
	console.log("histogram:", stats.histogram(x_co_ords))
}



module.exports = router;