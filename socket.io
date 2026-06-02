const { Server } = require("socket.io");

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

let players={};
let bullets=[];

io.on("connection",socket=>{

  socket.on("join",data=>{
    players[socket.id]={x:0,y:0,angle:0};
  });

  socket.on("move",data=>{
    players[socket.id]=data;
  });

  socket.on("shoot",data=>{
    bullets.push({
      x:data.x,
      y:data.y,
      vx:Math.cos(data.angle)*10,
      vy:Math.sin(data.angle)*10
    });
  });

});

setInterval(()=>{

  bullets.forEach(b=>{
    b.x+=b.vx;
    b.y+=b.vy;
  });

  io.emit("state",{players,bullets});

},16);