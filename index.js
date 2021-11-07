
let aus = true;
let i = 0;
let nexttime = 5000;

let bla = () => {
    if (aus) {
        console.log("ein " + Math.floor((i/2)+1));
        nexttime = 3000;
    } else {
        console.log("aus");
        nexttime = 5000;
    }
    if (i < 10) {
        setTimeout(bla, nexttime);
    }
    aus = !aus;
    i++;
}

setTimeout(bla, nexttime);