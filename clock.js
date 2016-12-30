//Demo of LCD module to show current time
var Lcd = require('lcd'),
  lcd = new Lcd({
    rs: 18,
    e: 23,
    data: [24, 17, 27, 22],
    cols: 8,
    rows: 2
  });
 
lcd.on('ready', function() {
  setInterval(function() {
    lcd.setCursor(0, 0);
    lcd.print(new Date().toString().substring(16, 24));
  }, 1000);
});
 
// If ctrl+c is hit, free resources and exit.
process.on('SIGINT', function() {
  lcd.clear();
  lcd.close();
  process.exit();
});