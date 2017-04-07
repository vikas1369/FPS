var address = 'iot.cqsrh7cmen98.us-west-2.rds.amazonaws.com';//amazon database instance address
var rootPwd = 'indica108';
var db = 'IOTSCHOOL';
var root = 'vikas1369';
var instanceUrl = 'jdbc:mysql://' + address;//Using JDBC service on top of mysql 
var dbUrl = instanceUrl + '/' + db;
//instnaceUrl is connection string

function retrieveData() {
  var ss1 = SpreadsheetApp.openById('1qZr8cTXJoIjc5jooZwl90BeiiRsgI3E5O5sY7DrFTXA');//Open the spreadsheet for operations
  var sheet1=ss1.getSheets()[0];//Get the first sheet
  var cell1=sheet1.getRange('a2');//
  var conn = Jdbc.getConnection(dbUrl, root, rootPwd);//Connection string
  stmt = conn.createStatement();
  var date=new Date();//Get the Date object used for generating the attendance for current date
  var year=date.getYear();
  var month=(date.getMonth()+1)>9?(date.getMonth()+1):('0'+(date.getMonth()+1))//Month starts from 0, Append 0 if it is less than 10
  var date=date.getDate()>9?(date.getDate()):('0'+date.getDate());//append 0 to date if it is less than 0
  var finalDate=year+'-'+month+'-'+date;//date variable that can be used in sql query
  var createNew=true;
  //finalDate='2017-03-01'
  Logger.log(finalDate);
  //var sql = ;
  var rs=stmt.executeQuery('SELECT * from Attendance where ADate="'+finalDate+'"');//Get all the attendance record for current date
  var attendance=new Array();
  var colnum=sheet1.getLastColumn()+1;//getting the column number of the next empty column so that we can put attendance for current date and put total values
  if(colnum>=4){
    colnum-=1;//Reduce the colnum by 1 if we have made already one entry for attendance. So total will be replaced by attendace of that day
              //and total will be calculated in the next empty column
    var dateHeader=sheet1.getRange(1,colnum-1);
    var dateILC=dateHeader.getValue();//Date in Last Column
    year=dateILC.getYear();
    month=(dateILC.getMonth()+1)>9?(dateILC.getMonth()+1):('0'+(dateILC.getMonth()+1))//Month starts from 0, Append 0 if it is less than 10
    date=dateILC.getDate()>9?(dateILC.getDate()):('0'+dateILC.getDate());//append 0 to date if it is less than 0
    var dateInCell=year+'-'+month+'-'+date;
    var hours=dateILC.getHours();
    var minutes=dateILC.getMinutes();
    var seconds=dateILC.getSeconds();
    var time=hours+":"+minutes+":"+seconds;
    Logger.log(time);
    Logger.log(dateInCell);
    if(finalDate==dateInCell){
      Logger.log("True");
      rs=stmt.executeQuery('SELECT * from Attendance where ADate="'+dateInCell+'" and ATime>"'+time+'"');//Get all the attendance record for current date
      var rownum=sheet1.getLastRow()-1;//total number of rows which contains attendance
      var range = sheet1.getRange(2, 1, rownum);//select the rollnumber column
      var rollnumbers=range.getValues();//get the roll numbers in rollnumbers var
      while(rs.next()){
        attendance.push(rs.getString("Studentid"));//Get the roll numbers of students who have marked their attendance today and store it in attendance array. This is retrieved from database
        Logger.log("ATIME"+rs.getString("ATime"));
      }
      if(attendance.length>=1){
      Logger.log("Yes latest attendances");
      rs.close();
      var count=2;//This is for second row where can put the attendance data
      //This for loop check for every rollno in spreadsheet against the roll nos recorded in the database
      for (var row in rollnumbers) {//for each row in rollnumber column
        for (var col in rollnumbers[row]) {//for each values in the row i.e. for each rollnumber from spreadsheet
          var cell=sheet1.getRange(count,colnum-1);
          var countRoll=cell.getValue();//Count of attendance for an individual rollno
          sheetRoll=rollnumbers[row][col].toString();//get the individual rollno from spreadsheet
          for(var roll in attendance){//for each rollno of today's attendance
            if(attendance[roll]===sheetRoll){//Check if spreadsheet rollno is matching with roll no retrieved from database
              //Logger.log("Element Found");
              countRoll++;//increase the count of attendance for the spreadsheet roll no if the match is found
            } 
          }
          var cell3=sheet1.getRange(count, colnum-1);//Get the first cell under date header where we can put the attendance for respective roll no
          cell3.setValue(countRoll);//put the value of the cell to be count of attendance retrieved from database
          var cell4=sheet1.getRange(count,colnum);//Get the first cell under total header where we can put the total attendance for respective roll no
          cell4.setValue(calsum(sheet1,count,colnum-2));//put the values of the cell to be total sum of attendance for that rollno
          count++;//Next row ie for next roll no
        }
      }
      var d=new Date();
      dateHeader.setValue(d); 
      }
      createNew=false;
    }
  }
  if(createNew==true){
    Logger.log("Creating new Columns");
    var newDateHeader=sheet1.getRange(1,colnum);
    var d=new Date();
    newDateHeader.setValue(d);//Set the date value in the date column header
    var colnum1=sheet1.getLastColumn()+1;//for total header
    var totalHeader=sheet1.getRange(1,colnum1);//for getting the cell where we can put the total header
    totalHeader.setValue("Total");//Set the column header as total
    var rownum=sheet1.getLastRow()-1;//total number of rows which contains attendance
    var range = sheet1.getRange(2, 1, rownum);//select the rollnumber column
    var rollnumbers=range.getValues();//get the roll numbers in rollnumbers var
    while(rs.next()){
      attendance.push(rs.getString("Studentid"));//Get the roll numbers of students who have marked their attendance today and store it in attendance array. This is retrieved from database
    }
    rs.close();
    var count=2;//This is for second row where can put the attendance data
    //This for loop check for every rollno in spreadsheet against the roll nos recorded in the database
    for (var row in rollnumbers) {//for each row in rollnumber column
      for (var col in rollnumbers[row]) {//for each values in the row i.e. for each rollnumber from spreadsheet
        var countRoll=0;//Count of attendance for an individual rollno
        sheetRoll=rollnumbers[row][col].toString();//get the individual rollno from spreadsheet
        for(var roll in attendance){//for each rollno of today's attendance
           if(attendance[roll]===sheetRoll){//Check if spreadsheet rollno is matching with roll no retrieved from database
             //Logger.log("Element Found");
             countRoll++;//increase the count of attendance for the spreadsheet roll no if the match is found
           } 
        }
       var cell3=sheet1.getRange(count, colnum);//Get the first cell under date header where we can put the attendance for respective roll no
       cell3.setValue(countRoll);//put the value of the cell to be count of attendance retrieved from database
       var cell4=sheet1.getRange(count,colnum+1);//Get the first cell under total header where we can put the total attendance for respective roll no
       cell4.setValue(calsum(sheet1,count,colnum));//put the values of the cell to be total sum of attendance for that rollno
       count++;//Next row ie for next roll no
      }
    }
  }
}
 function calsum(sheet1, count,coln){
   var sum=0;
   var values = sheet1.getRange(count,2,1,coln).getValues();//count,2 is for cell no then 1 is for the no of rows and then colnum is for number of columns. So it selects all the the cells corresponding to a roll no
   for(var i in values[0]){
     sum += values[0][i];//Get the sum
   }
   return sum;
 }
