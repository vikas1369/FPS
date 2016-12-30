console.log('First Nodejs Project');
var GT511C3 = require('gt511c3');
var iotf =require('ibmiotf');
var config = require("./gateway.json");
var gatewayClient = new iotf.IotfGateway(config);
//setting the log level to trace. By default its 'warn'
gatewayClient.log.setLevel('debug');

var Lcd = require('lcd');
  lcd = new Lcd({
    rs: 26,
    e: 19,
    data: [13, 6, 5, 11],
    cols: 16,
    rows: 2
  });

var idSMS=1;
var time;
var fps = new GT511C3('/dev/ttyAMA0', {
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
		identify();
	},
	function(err) {
		console.log('init err: ' + fps.decodeError(err));
	}
);

function identify(){
		fps.captureFinger(0)
			.then(function() {
				return fps.identify();
			})
			.then(function(ID) {
				idSMS=ID;
				console.log("identify: ID = " + ID);
				sendSMS();
			}, function(err) {
				console.log("identify err: " + fps.decodeError(err));
			});
}	
function sendSMS(){
console.log("Getting executed");

	var date = new Date();
        var hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
        var am_pm = date.getHours() >= 12 ? "PM" : "AM";
        hours = hours < 10 ? "0" + hours : hours;
        var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
        time = hours + ":" + minutes +" " + am_pm;


  lcd.setCursor(0, 0); // col 0, row 0
  lcd.print("ID:"+idSMS);
  lcd.once('printed', function() {
    lcd.setCursor(0, 1); // col 0, row 1
	
     lcd.print("IN time:"+time); // print time
  });
gatewayClient.connect();
    gatewayClient.on('connect', function(){
    gatewayClient.publishGatewayEvent('myevt', 'json','{"SMS":"'+idSMS+'","Time":"'+time+'"}', 1);
    gatewayClient.on('disconnect', function(){
  	console.log('Disconnected!!');
	});

	gatewayClient.on('error', function (argument) {
	console.log(argument);
	process.exit(1);
});
});
}
process.on('SIGINT', function() {
  lcd.clear();
  lcd.close();
  process.exit();
});