var rpio = require('rpio');
 
rpio.open(3, rpio.OUTPUT, rpio.LOW);
//This program takes the input from the keypad & displays the text on the terminal
/*
 * The sleep functions block, but rarely in these simple programs does one care
 * about that.  Use a setInterval()/setTimeout() loop instead if it matters.
 */
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
var code="";
var comeout=0;
while(true){
	for (var j = 0; j < 4; j++) {
		rpio.write(col[j],rpio.LOW);
		for (var i = 0; i < 4; i++) {
			if(rpio.read(row[i])==0){
			//console.log("Yes");
			code=code+matrix[i][j];
			console.log(matrix[i][j]);
			//console.log("Code entered till now "+code);
			if(matrix[i][j]=='#'){
				comeout=1;
				break;
			}
			while(rpio.read(row[i])==0);
			}	
		}
		if(comeout==1)
			break;
		else
			rpio.write(col[j],rpio.HIGH);
	}
	if(comeout==1)
		break;
}
console.log("Code entered "+code);
