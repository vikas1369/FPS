var iotf = require("ibmiotf");
var config = require("./gateway.json");

var gatewayClient = new iotf.IotfGateway(config);

//setting the log level to trace. By default its 'warn'
gatewayClient.log.setLevel('debug');

gatewayClient.connect();
var id=199;
var time;
var date = new Date();
        var hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
        var am_pm = date.getHours() >= 12 ? "PM" : "AM";
        hours = hours < 10 ? "0" + hours : hours;
        var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
        time = hours + ":" + minutes +" " + am_pm;
gatewayClient.on('connect', function(){
    gatewayClient.publishGatewayEvent('myevt', 'json', '{"SMS":"'+id+'","Time":"'+time+'"}', 1);
    //gatewayClient.publishDeviceEvent('Sensors','Sengwb827' ,'myevt', 'json', '{"hello":"world"}', 1);
    //gatewayClient.subscribeToDeviceCommand('Sensors','Sengwb827');
    //gatewayClient.unsubscribeToDeviceCommand('Sensors','Sengwb827');
    //gatewayClient.subscribeToDeviceCommand('RPIGWType','gwb827');
    
    //gatewayClient.subscribeToGatewayCommand('blink');
    //gatewayClient.unsubscribeToGatewayCommand('blink');
    //gatewayClient.subscribeToGatewayCommand('blink1');
});

gatewayClient.on('reconnect', function(){ 

    console.log("Reconnected!!!");
});

gatewayClient.on('command', function(type, id, commandName, commandFormat, payload, topic){
    console.log("Command received");
    console.log("Type: %s  ID: %s  \nCommand Name : %s Format: %s",type, id, commandName, commandFormat);
    console.log("Payload : %s",payload);
});

gatewayClient.on('disconnect', function(){
  console.log('Disconnected!!');
});

gatewayClient.on('error', function (argument) {
	console.log(argument);
	process.exit(1);
});