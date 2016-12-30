console.log('First Nodejs Project');
var GT511C3 = require('gt511c3');
var fps = new GT511C3('/dev/ttyAMA0', {
	baudrate: 115200
	//baudrate: 57600,
	//baudrate: 38400,
	//baudrate: 19200,
	//baudrate: 9600,
	//debug: true
});
identifyFinger();
function identifyFinger(){
		fps.captureFinger(0)
			.then(function() {
				return fps.identify();
			})
			.then(function(ID) {
				console.log("identify: ID = " + ID);
				//sendSMS();
			}, function(err) {
				console.log("identify err: " + fps.decodeError(err));
			});
}	
