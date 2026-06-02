let bg=new Audio("./sounds/bg.mp3");
bg.loop=true;
bg.volume=0.5;

export function startMusic(){
 if(localStorage.getItem("sound")==="on"){
  bg.play();
 }
}

export function stopAllSounds(){
 bg.pause();
 bg.currentTime=0;
}

export function playEngine(){
 if(localStorage.getItem("sound")!=="on") return;

 let s=new Audio("./sounds/engine.mp3");
 s.volume=0.3;
 s.play();
}