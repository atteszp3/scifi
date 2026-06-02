import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const socket = io();

// 🌌 SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// 🎥 CAMERA
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth/window.innerHeight,
    0.1,
    1000
);
camera.position.z = 10;

// 🎮 RENDERER
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);

// 🌠 LIGHT
const light = new THREE.PointLight(0xffffff,1);
light.position.set(10,10,10);
scene.add(light);

// 🧊 PLAYER CUBE (you)
const playerMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,2),
    new THREE.MeshStandardMaterial({color:0x00ffff})
);
scene.add(playerMesh);

// 🌍 OTHER PLAYERS
let remotePlayers = {};
let bullets = [];

// 🚀 MOVEMENT STATE
let me = {
    x:0,y:0,z:0,
    rotY:0
};

// ---------------- INPUT ----------------
document.addEventListener("mousemove",(e)=>{
    me.rotY = (e.clientX/window.innerWidth - 0.5) * Math.PI * 2;
});

document.addEventListener("keydown",(e)=>{
    let speed=0.3;
    if(e.key==="w") me.z -= speed;
    if(e.key==="s") me.z += speed;
    if(e.key==="a") me.x -= speed;
    if(e.key==="d") me.x += speed;
});

// SHOOT
document.addEventListener("click",()=>{
    const dir = new THREE.Vector3(
        Math.sin(me.rotY),
        0,
        Math.cos(me.rotY)
    );

    socket.emit("shoot",{
        x:me.x,
        y:me.y,
        z:me.z,
        vx:dir.x*0.5,
        vy:0,
        vz:dir.z*0.5
    });
});

// ---------------- SOCKET ----------------
socket.on("state",(data)=>{
    remotePlayers = data.players;
    bullets = data.bullets;
});

// ---------------- UPDATE ----------------
function update(){

    playerMesh.position.set(me.x,me.y,me.z);
    playerMesh.rotation.y = me.rotY;

    socket.emit("move",me);

    // update remote players
    Object.keys(remotePlayers).forEach(id=>{
        if(!remotePlayers[id].mesh){
            const m = new THREE.Mesh(
                new THREE.BoxGeometry(1,1,2),
                new THREE.MeshStandardMaterial({color:0xff0000})
            );
            scene.add(m);
            remotePlayers[id].mesh = m;
        }

        let p = remotePlayers[id];
        p.mesh.position.set(p.x,p.y,p.z);
        p.mesh.rotation.y = p.rotY;
    });

    // bullets
    bullets.forEach(b=>{
        if(!b.mesh){
            const m = new THREE.Mesh(
                new THREE.SphereGeometry(0.2),
                new THREE.MeshBasicMaterial({color:0xffff00})
            );
            scene.add(m);
            b.mesh = m;
        }

        b.mesh.position.set(b.x,b.y,b.z);
    });
}

// ---------------- LOOP ----------------
function animate(){
    requestAnimationFrame(animate);
    update();
    renderer.render(scene,camera);
}
animate();
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";