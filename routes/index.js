var express = require('express');
var router = express.Router();
var stats = require("stats-lite");
var dice = require("dice");
var mysql = require("mysql");

var pool = mysql.createPool({
		host : "localhost",
		user : "root",
		password : "admin",
		database : "iaserver"
});
//https://www.npmjs.com/package/stats-lite
//https://stackoverflow.com/questions/28841139/how-to-get-coordinates-of-touchscreen-rawdata-using-linux


var x_co_ords = []
var y_co_ords = []
var pressure = []
var size = []
var time = []
var derived_values = {};


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/registerUser',function(req,res){
	var data = JSON.parse(Object.keys(req.body));

	saveDataMysql(data).then(function(createdUser){
		console.log("saveDataMysql then: ", createdUser);
		res.send(createdUser);
	}).catch((error) => {
	 	console.log("saveDataMysql catch: ", error);
	});
});

function saveDataMysql(data){
	console.log("inside the function");
	var createduserid;
	
	return new Promise(function (resolve, reject) {
		pool.getConnection( function(err, connection) {
	  		var userData = {
	  			username :data.username,
	  			emailid : data.emailid,
	  			gender: data.gender,
	  			dominating_hand : data.dominating_hand
	  		};

			var query = connection.query("INSERT INTO new_table SET ?", userData, function(query_error,result){
				console.log(result);

				if(result.affectedRows > 0){
					createduserid = {userid : result.insertId};
					console.log("saveDataMysql before resolve: ", createduserid);
				}

				connection.release();
				
				resolve(createduserid);

				if(err){
					// throw err;
					return reject(err);
				} 
			});
		});
	});
}

router.post('/saveData',function(req,res,next){
	var data = JSON.parse(Object.keys(req.body)[0]);
	var pinchgesture = "PinchZoom";
	if(data[0].gesture.trim() === pinchgesture.trim()){
		console.log("Gesture is pinch");
		savePinchGesture(data);
	}else{
		saveStrokeData(data);
	}
		
	derived_values = {};
	//save the raw data for the records
	
	for(var i=0;i<data.length;i++){
		x_co_ords.push(data[i].x);
		y_co_ords.push(data[i].y);
		pressure.push(data[i].pressure);
		size.push(data[i].size);
		// time.push(data[i].time);
	}
	
	getStats("x",x_co_ords,data[0].userid);
	getStats("y",y_co_ords,data[0].userid);
	getStats("pressure",pressure,data[0].userid);
	getStats("size",size,data[0].userid);
	// getStrokeCurvature();
	// getSlope(y_co_ords,x_co_ords);
	// getAverageSpeed();
	updateDerivedValuesToDB(data[0].strokeid,data[0].userid);
	clearAll();
	
	res.sendStatus(200);
});

function getStrokeCurvature(){

}

function getSlope(y_co_ords,x_co_ords){
	y_diff = (y_co_ords[y_co_ords.length-1] - y_co_ords[0]);
	x_diff = (x_co_ords[x_co_ords.length-1] - x_co_ords[0]);

	console.log("x_diff ",x_diff," y_diff ",y_diff);
	slope = (y_diff/ x_diff);
	console.log("Slope is : ",slope);

	curvature = Math.atan(y_diff,x_diff);
	console.log("Swipe Curvature ",curvature);
}

function saveStrokeData(data){
	pool.getConnection(function(err, connection) {
		for(var i=0;i<data.length;i++){
			var sql = "INSERT INTO raw_data (strokeid,pointid,deviceid,time,x1,y1,pressure1,size1,action,userid,gestureType) VALUES ('"+data[i].strokeid+"','"+data[i].pointid+"','"+data[i].deviceid+"','"+data[i].time+"','"+data[i].x+"','"+data[i].y +"','"+data[i].pressure+"','"+data[i].size+"','"+data[i].action+"','"+data[i].userid+"','"+data[i].gesture+"')";
			connection.query(sql, function (error, result) {
				if (error) throw error;
				// console.log("1 record inserted");
			});
		}

		connection.release();
	});
}

function savePinchGesture(data){
	pool.getConnection(function(err, connection) {
		for(var i=0;i<data.length;i++){
			var sql = "INSERT INTO raw_data (strokeid,pointid,deviceid,time,x1,y1,pressure1,size1,x2,y2,pressure2,size2,action,userid,gestureType) VALUES ('"+data[i].strokeid+"','"+data[i].pointid+"','"+data[i].deviceid+"','"+data[i].time+"','"+data[i].x1+"','"+data[i].y1 +"','"+data[i].pressure1+"','"+data[i].size1+"','"+data[i].x2+"','"+data[i].y2+"','"+data[i].pressure2+"','"+data[i].size2+"','"+data[i].action+"','"+data[i].userid+"','"+data[i].gesture+"')";
			connection.query(sql, function (error, result) {
				if (error) throw error;
				console.log("1 record inserted");
			});
		}

		connection.release();
	});
}


function getStats(value,object,userid){

	// console.log("Getting   stats for ",value," value is ",object);
	var mean_val = stats.mean(object);
	var median_val = stats.median(object);
	var mode_val = stats.mode(object);
	var variance_val = stats.variance(object);
	var std_dev_val = stats.stdev(object);
	var percent25_val = stats.percentile(object, 0.25);
	var percent50_val = stats.percentile(object, 0.5);
	var percent75_val = stats.percentile(object, 0.75);
	var percent100_val = stats.percentile(object, 1.00);

	console.log(mean_val+" "+median_val+" "+mode_val+" "+variance_val+" "+mode_val+" "+percent25_val);

			//Add the values to the database
	derived_values["avg_"+value] = mean_val;
	derived_values["median_"+value] = median_val;
	derived_values["mode_"+value] = mode_val;
	derived_values["variance_"+value] = variance_val;
	derived_values["std_dev_"+value] = std_dev_val;
	derived_values["percent25_"+value] = percent25_val;
	derived_values["percent50_"+value] = percent50_val;
	derived_values["percent75_"+value] = percent75_val;
	derived_values["percent100_"+value] = percent100_val;
	
}


function updateDerivedValuesToDB(strokeid,userid){
	derived_values["stroke_id"] = strokeid;
	derived_values["userid"] = userid;
	console.log("updateDerivedValuesToDB called "+ Number(derived_values['size_mean_val']));
	for (key in derived_values){
	    console.log( key + ": " + derived_values[key]);
	}

	pool.getConnection(function(err, connection) {
		var derived_values_data = derived_values;
		var sql2 = "INSERT INTO derived_data SET ?";
		connection.query(sql2,derived_values_data, function (error, result) {
			if (error) throw error;
			console.log("1 record inserted");
		});
		connection.release();
	});
}

function clearAll(){
	var x_co_ords = [];
	var y_co_ords = [];
	var pressure = [];
	var size = [];
	var time = [];
}


module.exports = router;