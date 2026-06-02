class Joystick {

 constructor(container, stick, playerRef){
  this.container = container;
  this.stick = stick;
  this.player = playerRef;

  this.active = false;
  this.dx = 0;
  this.dy = 0;
  this.max = 40;

  this.init();
 }

 init(){
  this.container.addEventListener("mousedown", e=>this.start(e));
  this.container.addEventListener("touchstart", e=>this.start(e.touches[0]));

  document.addEventListener("mousemove", e=>this.move(e));
  document.addEventListener("touchmove", e=>this.move(e.touches[0]));

  document.addEventListener("mouseup", ()=>this.end());
  document.addEventListener("touchend", ()=>this.end());
 }

 start(e){
  this.active = true;
  this.move(e);
 }

 move(e){
  if(!this.active) return;

  const r = this.container.getBoundingClientRect();

  let x = e.clientX - r.left - r.width/2;
  let y = e.clientY - r.top - r.height/2;

  let len = Math.hypot(x,y);

  if(len > this.max){
   x = x/len * this.max;
   y = y/len * this.max;
  }

  this.dx = x / this.max;
  this.dy = y / this.max;

  this.stick.style.transform = `translate(${x}px,${y}px)`;

  /* 👉 IRÁNY */
  this.player.angle = Math.atan2(this.dy, this.dx);
 }

 end(){
  this.active = false;
  this.dx = 0;
  this.dy = 0;
  this.stick.style.transform = "translate(0px,0px)";
 }

 update(player){
  player.x += this.dx * 4;
  player.y += this.dy * 4;
 }

}