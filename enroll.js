console.log('First Nodejs Project');
var range = require('range');
var GT511C3 = require('gt511c3');
var mysql      = require('mysql');
var connection;
var returned;
var fpsids=new Array();
var fps = new GT511C3('/dev/ttyS0', {
	baudrate: 115200
	//baudrate: 57600,
	//baudrate: 38400,
	//baudrate: 19200,
	//baudrate: 9600,
	//debug: true
});
fps.init().then(
	function() {
		isInit = true;
		console.log('init: OK!');
		console.log('firmware version: ' + fps.firmwareVersion);
		console.log('iso area max: ' + fps.isoAreaMaxSize);
		console.log('device serial number: ' + fps.deviceSerialNumber);
		//fps.ledONOFF(1);
		getFPSIds();
	},
	function(err) {
		console.log('init err: ' + fps.decodeError(err));
	}
);

function getFPSIds(){
	connection = mysql.createConnection({
        host     : 'iot.cqsrh7cmen98.us-west-2.rds.amazonaws.com',
        user     : 'vikas1369',
        password : 'indica108',
    });
	
    connection.connect(function(err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return;
        }
        console.log('connected as id ' + connection.threadId);
    });
	var query1=connection.query('SELECT FPSid FROM IOTSCHOOL.Students');
    query1.on("error",function (err) {
        console.log(err.message);
    });
	query1.on("result",function (rows) {
        fpsids.push(rows.FPSid);
        returned1=true;
    });
	query1.on("end",function () {
        if(returned1 ===true){
            console.log("Successful");
	    returned1=false;
	    identifyId();
        }
        else{	
       	console.log("Try again");
        }
        //connection.end()
    });
}
function identifyId(){
	console.log("In identify id");
	var id;
	for(var i=0;i<fpsids.length;i++){
	console.log(fpsids[i]);
	}
	for(var i=0;i<200;i++){
		id=i;
		if(fpsids.indexOf(i)>=0);
		else break;	
	}
	console.log(id);
	enrollFinger(id);
}
function enrollFinger(i){
		console.log("In enroll");
fps.ledONOFF(1).then(function() {
			console.log('ledON: OK!');
		fps.enroll(i).then(function() {
			console.log('enroll: enrolled!');
		}, function(err) {
			console.log('enroll err: ' + fps.decodeError(err));
		});
		}, function(err) {
			console.log('ledON error: ' + fps.decodeError(err));
		});

}
