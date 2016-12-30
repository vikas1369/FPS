var rpio = require('rpio');
 
rpio.open(3, rpio.OUTPUT, rpio.LOW);
 
/*
 * The sleep functions block, but rarely in these simple programs does one care
 * about that.  Use a setInterval()/setTimeout() loop instead if it matters.
 */
for (var i = 0; i < 5; i++) {
        /* On for 1 second */
        rpio.write(3, rpio.HIGH);
        rpio.sleep(1);
 
        /* Off for half a second (500ms) */
        rpio.write(3, rpio.LOW);
        rpio.msleep(500);
}