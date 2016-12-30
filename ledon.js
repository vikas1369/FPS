var GT511C3 = require('gt511c3');
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
		fps.ledONOFF(1);
	},
	function(err) {
		console.log('init err: ' + fps.decodeError(err));
	}
);