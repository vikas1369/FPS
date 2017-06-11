var mysql      = require('mysql');
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
connection.query('SELECT * FROM IOTSCHOOL.Attendance WHERE FPSid=199 and ADate=CURDATE();',function(error,result){
if(error){
	console.log("Database error");
}
else if(result.length>0){
	console.log("Record exist checking if time last attendance was added was before more than 1 hours");
	connection.query('SELECT * FROM IOTSCHOOL.Attendance WHERE FPSid=199 and ADate=CURDATE() and HOUR(TIMEDIFF(CURTIME(),ATime))<1',function(error,result){
	if(error){
	console.log("error");
	}
	else if(result.length>0){
	console.log("Don't add");
	}
	else{
	console.log("Record added more than 1 hour before add record");
	connection.query("SELECT * FROM IOTSCHOOL.Course WHERE Coursecode='C0001' AND LDate=CURDATE() AND HOUR(TIMEDIFF(CURTIME(),LTime))<1",function(error,result){
	if(error)
	console.log('error');
	else if(result.length>0){
	console.log("Dont update the count");
	}
	else{
	console.log("Update the count");
	connection.query("UPDATE IOTSCHOOL.Course SET Numclass=Numclass+1,LTime=CURTIME(),LDate=CURDATE() WHERE Coursecode='C0001'",function(error,result){
	if(error){
		console.log("Database error");
	}
	console.log("updated the count");		
	});
	}
	});
	}
	});
}
else{
	console.log("Record doesn't exist just add");
	connection.query("SELECT * FROM IOTSCHOOL.Course WHERE Coursecode='C0001' AND LDate=CURDATE() AND HOUR(TIMEDIFF(CURTIME(),LTime))<1",function(error,result){
	if(error){
	throw error;
	}
	else if(result.length>0){
	console.log("Dont update the count");
	}
	else{
	console.log("Update the count");
	connection.query("UPDATE IOTSCHOOL.Course SET Numclass=Numclass+1,LTime=CURTIME(),LDate=CURDATE() WHERE Coursecode='C0001'",function(error,result){
	if(error){
		console.log("Database error");
	}
	console.log("updated the count");	
	});
	}
	});
}
});