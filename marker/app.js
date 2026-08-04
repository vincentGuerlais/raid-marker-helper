const SYMBOLS4=[
"square_blue",
"cross_red",
"circle_orange",
"triangle_green"
];

const SYMBOLS8=[
"square_blue",
"cross_red",
"circle_orange",
"triangle_green",
"diamond_purple",
"moon_grey",
"skull_white",
"star_yellow"
];

let currentSequence=[];

let currentSymbols=[];

let mode=localStorage.getItem("mode")||"4";

function buildButtons(){

    const zone=document.getElementById("buttons");

    zone.innerHTML="";

    zone.className="buttons";

    zone.classList.add(mode==="4"?"mode4":"mode8");

    currentSymbols=(mode==="4")?SYMBOLS4:SYMBOLS8;

    currentSymbols.forEach(symbol=>{

        const button=document.createElement("button");

        button.onclick=()=>addSymbol(symbol);

        const img=document.createElement("img");

        img.src="../assets/"+symbol+".png";

        button.appendChild(img);

        zone.appendChild(button);

    });

    document.getElementById("modeButton").textContent=
        mode==="4"?"4️⃣":"8️⃣";
}

function addSymbol(symbol){

    currentSequence.push(symbol);

    displaySequence();

}

function displaySequence(){

    const zone=document.getElementById("inputSequence");

    zone.innerHTML="";

    currentSequence.forEach(symbol=>{

        const img=document.createElement("img");

        img.src="../assets/"+symbol+".png";

        zone.appendChild(img);

    });

}

function resetSequence(){

    currentSequence=[];

    displaySequence();

}

document.getElementById("reset").onclick=resetSequence;

document.getElementById("modeButton").onclick=()=>{

    mode=(mode==="4")?"8":"4";

    localStorage.setItem("mode",mode);

    buildButtons();

};

let pressTimer;

const sequence=document.getElementById("inputSequence");

sequence.addEventListener("touchstart",()=>{

    sequence.classList.add("longpress");

    pressTimer=setTimeout(()=>{

        resetSequence();

        sequence.classList.remove("longpress");

    },700);

});

sequence.addEventListener("touchend",()=>{

    clearTimeout(pressTimer);

    sequence.classList.remove("longpress");

});

sequence.addEventListener("touchcancel",()=>{

    clearTimeout(pressTimer);

    sequence.classList.remove("longpress");

});

let wakeLock=null;

async function keepScreenAwake(){

    if(!("wakeLock" in navigator))
        return;

    try{

        wakeLock=await navigator.wakeLock.request("screen");

        wakeLock.addEventListener("release",()=>{

            wakeLock=null;

        });

    }
    catch(e){}

}

document.addEventListener("visibilitychange",()=>{

    if(document.visibilityState==="visible" && wakeLock===null){

        keepScreenAwake();

    }

});

keepScreenAwake();

buildButtons();