//In this module intergration of Keypad and LCD module is done
var rpio = require('rpio');
var GT511C3 = require('gt511c3');
var mysql      = require('mysql');
var Lcd = require('lcd');
//This program takes the input from the keypad & displays the text on the terminal
/*
 * The sleep functions block, but rarely in these simple programs does one care
 * about that.  Use a setInterval()/setTimeout() loop instead if it matters.
 */
var conn;
var connection;
var code="";
var comeout=0;
var returned=false;
var isInit=false;
var durFingerScan;
var KEY;
var logout=0;
rpio.open(3, rpio.OUTPUT, rpio.LOW);
  lcd = new Lcd({
    rs: 18,
    e: 23,
    data: [24, 17, 27, 22],
    cols: 8,
    rows: 2
  });
var fps = new GT511C3('/dev/ttyS0', {
	baudrate: 115200
	//baudrate: 57600,
	//baudrate: 38400,
	//baudrate: 19200,
	//baudrate: 9600,
	//debug: true
});
var matrix=[[1,2,3,'A'],
	    [4,5,6,'B'],
	    [7,8,9,'C'],
	    ['*',0,'#','D']]
var row=[37,35,33,31];
var col=[29,23,40,38];
for (var i = 0; i < 4; i++) {
      rpio.open(col[i], rpio.OUTPUT, rpio.HIGH);
}
for (var i = 0; i < 4; i++) {
      rpio.open(row[i], rpio.INPUT, rpio.PULL_UP);
}
lcd.on('ready', function() {
	lcd.setCursor(0, 0);
	lcd.print("Please Enter the");
	lcd.once('printed', function() {
	lcd.setCursor(0, 1);
	lcd.print("Passkey");
	});
	takeKeypadInput();
function takeKeypadInput(){
		var count=0;
		var passcode='';
		var interval=setInterval(function(){
		for (var j = 0; j < 4; j++) {
		rpio.write(col[j],rpio.LOW);
		for (var i = 0; i < 4; i++) {
			if(rpio.read(row[i])==0){
				count++;
				if(count==1)
					lcd.clear();//Clears the text Enter pass key
				console.log(matrix[i][j]);
				passcode=passcode+matrix[i][j];
				if(matrix[i][j]!='#'){
					lcd.print(matrix[i][j]);
				}
				if(matrix[i][j]=='#' && logout==0){
					console.log('If log 0 Value of logout '+logout);
					clearInterval(interval);
					passcode=passcode.substring(0,passcode.length-1);
					checkPassKey(passcode);
				//break;
				}
				else if(matrix[i][j]=='#' && logout==1){
					console.log('If log 1 Value of logout '+logout);
					clearInterval(interval);
					passcode=passcode.substring(0,passcode.length-1);
					signOut(passcode);
				}
				while(rpio.read(row[i])==0);
			}	
		}
		//if(comeout==1)
		rpio.write(col[j],rpio.HIGH);
		//break;
		//else
	}
	},50)//End of setInterval function
}

//end of keypad code 

//Input:Passkey entered by the professor
//It checks the passkey and tries to match it with the value stored in 
//amazon db for corresponing course. If it is successful then fingerprint scanning
//is started
function checkPassKey(passkey){
	KEY=passkey;
	var count=0;
	var count1=5;
	lcd.clear();
	lcd.setCursor(0, 0);
	lcd.print('Checking');
	var intervalDB=setInterval(function(){
		if(count==5){
			count=0;
			lcd.clear();
			lcd.setCursor(0, 0);
			lcd.print('Checking');
		}
		if(count<5){
			count++;
			lcd.print('.');
		}
		},500)
	var courseCode;
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
    console.log(passkey);
    var query1=connection.query('SELECT Coursecode FROM IOTSCHOOL.Course WHERE Passkey=?',[passkey]);
    query1.on("error",function (err) {
        console.log(err.message);
    })
    query1.on("result",function (row) {
        console.log("Result");
        console.log(row.Coursecode);
        courseCode=row.Coursecode;
        returned=true;
    });
    query1.on("end",function () {
	clearInterval(intervalDB);
        if(returned ===true){
            console.log("Successful");
	    startFingerScan(courseCode);
	    returned=false;
        }
        else{	
        lcd.clear();
	    lcd.setCursor(0, 0);
	    lcd.print("Try again");
	    takeKeypadInput();
        }
        //connection.end()
    })
}

function signOut(passkey){
	if(passkey==KEY){
		console.log('Inside signout function');
		clearInterval(durFingerScan);
		fps.ledONOFF(0);
		//fps.close();
		lcd.clear();
		lcd.print("Please Enter the");
		lcd.once('printed', function() {
		lcd.setCursor(0, 1);
		lcd.print("Passkey");
		logout=0;
		takeKeypadInput();
		});
	}
	else{
		takeKeypadInput();
	}
}

//This function constantly check for thumb impression.
//If there are no thumb impression, it will display the message 'Press the finger' 
//If the finger is pressed and it doesn't match it will show the error 
//If it successfully matches it displays the Roll No. of student on LCD and 
//It continue to look for next thumb impression
function startFingerScan(courseCode){
	console.log('Inside finger scan');
	lcd.clear();
	lcd.setCursor(0, 0);
	lcd.print("Ready for Finger");
	lcd.once('printed', function() {
	lcd.setCursor(0, 1);
	lcd.print("scanning");
	});
	if(isInit===false){
	fps.init().then(
	function() {
		isInit = true;
		console.log('init: OK!');
		console.log('firmware version: ' + fps.firmwareVersion);
		console.log('iso area max: ' + fps.isoAreaMaxSize);
		console.log('device serial number: ' + fps.deviceSerialNumber);
		takeAttendance(courseCode);
	},
	function(err) {
		console.log('init err: ' + fps.decodeError(err));
	});
	}
	else{
		takeAttendance(courseCode);
	}
}//End of startFingerScan function

function takeAttendance(courseCode){
	var fpsids=new Array();
	var studentId;
	var classval;
	var FPSID;
		fps.ledONOFF(1);
		var startTime = new Date();
		var seconds=0;
		logout=1;
		takeKeypadInput();//added
		durFingerScan=setInterval(function(){ 
		console.log(fpsids);
		var endTime=new Date();
		var timeDiff=endTime-startTime;
		console.log('In milisec:'+timeDiff);
		//seconds=(seconds<60)?Math.round(timeDiff%60):(seconds+Math.round(timeDiff%60));
		seconds=timeDiff/1000;
		console.log('Seconds:'+seconds);
		if(seconds>=30){
			logout=0;
			fps.ledONOFF(0);
			clearInterval(durFingerScan);
			//fps.close();
			lcd.clear();
			lcd.print("Please Enter the");
			lcd.once('printed', function() {
			lcd.setCursor(0, 1);
			lcd.print("Passkey");
			//takeKeypadInput();
			});
		}
		else{
		fps.captureFinger(0)
			.then(function() {
				return fps.identify();
			})
			.then(function(ID) {
				console.log("identify: ID = " + ID);
				if(fpsids.indexOf(ID)<0)//Record attendance only if the attendance has not already been recorded
				{
				lcd.clear();
				lcd.setCursor(0, 0);
				var query1=connection.query('SELECT Studentid,Class FROM IOTSCHOOL.Students WHERE FPSid=?',[ID]);
				query1.on("result",function (row) {
        				console.log("Result");
        				console.log(row);
					console.log(row.Studentid);
					console.log(row.Class);
					lcd.clear();
	    				lcd.setCursor(0, 0);
	    				lcd.print("RNo:" +row.Studentid );
	    				studentId=row.Studentid;
					classval=row.Class;
					FPSID=ID;
        				returned=true;
    				});
    				query1.on("end",function () {
        				if(returned ===true){
            				console.log("Query for Roll No. successful");
	    					returned=false;
						var stored;
	    					storeAttendance(ID,courseCode,studentId,classval,function(){
							if(returned===true){
								console.log(returned);
								fpsids.push(ID);
							}
						});
						
						
        				}
        				else{	
            					lcd.clear();
	    					lcd.setCursor(0, 0);
	    					lcd.print("Database issue");
        				}
        			//connection.end()
    				})
				}
				else{
					lcd.clear();
	    				lcd.setCursor(0, 0);
	    				lcd.print("Already recorded");
				}
			}, function(err) {
				console.log("identify err: " + fps.decodeError(err));
			});
		}//End of capture finger
		}
		,3000);//Endo of set interval function;
}//End of function takeAttendance

function storeAttendance(ID,courseCode,studentId,classval,cb){//cb is used for callback
	console.log("Inside Store attendance function");
	console.log(classval);
	var t = new Date();
	var YYYY = t.getFullYear();
	var MM = ((t.getMonth() + 1 < 10) ? '0' : '') + (t.getMonth() + 1);
	var DD = ((t.getDate() < 10) ? '0' : '') + t.getDate();
	var HH = ((t.getHours() < 10) ? '0' : '') + t.getHours();
	var mm = ((t.getMinutes() < 10) ? '0' : '') + t.getMinutes();
	var ss = ((t.getSeconds() < 10) ? '0' : '') + t.getSeconds();
	var dateval=YYYY+'-'+MM+'-'+DD;
	var timeval=HH+':'+mm+':'+ss;
	var query1=connection.query('INSERT INTO IOTSCHOOL.Attendance VALUES (?,?,?,?,?,?)',[ID,studentId,classval,courseCode,timeval,dateval]);
	query1.on("result",function (row) {
        		console.log("Insert:query executed");
        		returned=true;
			stored=true;
    	});
    	query1.on("end",function () {
        	if(returned ===true){
	    		//returned=false;
	  		lcd.clear();
	    		lcd.setCursor(0, 0);
	    		lcd.print("Record:"+studentId);
			console.log('Attendance recorded '+'course: '+courseCode+' studentid:'+studentId);
			cb();
        	}
        	else{	
            		lcd.clear();
	    		lcd.setCursor(0, 0);
	    		lcd.print("Cant Record");
			cb();
        	}
    	})
	
}//End of storeAttendance function
});//End of lcd on function

// If ctrl+c is hit, free resources and exit.
process.on('SIGINT', function() {
  lcd.clear();
  lcd.close();
  process.exit();
});
