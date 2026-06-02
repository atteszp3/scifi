const express = require("express");
const http    = require("http");
const { Server } = require("socket.io");

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: "*" } });

app.use(express.static("public"));
app.use("/img", express.static("img"));
app.get("/healthz", (_, res) => res.send("OK"));

// ─── World state ──────────────────────────────────────
const TICK   = 1000 / 30;
const BULLET_SPEED   = 13;
const BULLET_LIFE    = 70;         // ticks ≈ 2.3 s
const BULLET_DMG     = 25;
const BULLET_DMG_CRUISER = 35;     // cruiser hits harder
const COLLIDE_RADIUS = 26;         // px, player hitbox
const RESPAWN_TIME   = 4000;       // ms
const MAX_HP         = 100;
const WORLD_BOUND    = 3000;       // soft boundary

let world = {
  players: {},   // id → player record
  bullets: []    // active bullets
};

// ─── Helpers ──────────────────────────────────────────
function dist2(ax, ay, bx, by) {
  const dx = ax - bx, dy = ay - by;
  return dx*dx + dy*dy;
}
function randSpawn() {
  return { x: (Math.random() - 0.5) * 600, y: (Math.random() - 0.5) * 600 };
}
function makePlayer(id) {
  const pos = randSpawn();
  return {
    id,
    x: pos.x, y: pos.y,
    angle: 0,
    ship: "player1",
    name: "PILOT",
    hp: MAX_HP, maxHp: MAX_HP,
    alive: true,
    kills: 0, deaths: 0, score: 0,
    respawnAt: 0,
    invincible: 0   // ticks
  };
}

// ─── Connection ───────────────────────────────────────
io.on("connection", socket => {
  const p = makePlayer(socket.id);
  world.players[socket.id] = p;

  // Send current players to newcomer
  socket.emit("welcome", {
    id: socket.id,
    players: world.players
  });

  // Tell everyone else a new player joined
  socket.broadcast.emit("playerJoined", { id: socket.id, player: p });

  // ── join ─────────────────────────────────────────
  socket.on("join", data => {
    const pl = world.players[socket.id];
    if (!pl) return;
    pl.name = (data.name || "PILOT").slice(0, 16);
    pl.ship = data.ship || "player1";
    pl.maxHp = data.ship === "player2" ? 130 : 100;
    pl.hp    = pl.maxHp;
    io.emit("scoreUpdate", buildScoreboard());
  });

  // ── move ─────────────────────────────────────────
  socket.on("move", d => {
    const pl = world.players[socket.id];
    if (!pl || !pl.alive) return;
    pl.x     = clampBound(+d.x || 0);
    pl.y     = clampBound(+d.y || 0);
    pl.angle = +d.angle || 0;
    pl.ship  = d.ship  || pl.ship;
  });

  // ── shoot ─────────────────────────────────────────
  socket.on("shoot", d => {
    const pl = world.players[socket.id];
    if (!pl || !pl.alive) return;

    const spd  = BULLET_SPEED;
    const ang  = +d.angle || 0;
    const dmg  = pl.ship === "player2" ? BULLET_DMG_CRUISER : BULLET_DMG;
    const offsets = pl.ship === "player2" ? [-0.07, 0, 0.07] : [0];

    offsets.forEach(off => {
      world.bullets.push({
        x:     +d.x || pl.x,
        y:     +d.y || pl.y,
        vx:    Math.cos(ang + off) * spd,
        vy:    Math.sin(ang + off) * spd,
        owner: socket.id,
        ownerName: pl.name,
        dmg,
        life:  BULLET_LIFE
      });
    });
  });

  // ── respawn request ───────────────────────────────
  socket.on("respawn", () => {
    const pl = world.players[socket.id];
    if (!pl || pl.alive) return;
    if (Date.now() < pl.respawnAt) return;
    const pos = randSpawn();
    pl.x = pos.x; pl.y = pos.y;
    pl.hp = pl.maxHp;
    pl.alive = true;
    pl.invincible = 90; // 3 s of grace
    socket.emit("respawned", { x: pl.x, y: pl.y, hp: pl.maxHp });
    io.emit("scoreUpdate", buildScoreboard());
  });

  // ── chat ─────────────────────────────────────────
  socket.on("chat", msg => {
    const pl = world.players[socket.id];
    if (!pl) return;
    const text = String(msg).slice(0, 100);
    io.emit("chat", { name: pl.name, text, id: socket.id });
  });

  // ── disconnect ────────────────────────────────────
  socket.on("disconnect", () => {
    delete world.players[socket.id];
    world.bullets = world.bullets.filter(b => b.owner !== socket.id);
    io.emit("playerLeft", socket.id);
    io.emit("scoreUpdate", buildScoreboard());
  });
});

// ─── Helpers ──────────────────────────────────────────
function clampBound(v) {
  return Math.max(-WORLD_BOUND, Math.min(WORLD_BOUND, v));
}

function buildScoreboard() {
  return Object.values(world.players)
    .map(p => ({ id:p.id, name:p.name, kills:p.kills, deaths:p.deaths, score:p.score, alive:p.alive }))
    .sort((a, b) => b.score - a.score);
}

// ─── Game loop ────────────────────────────────────────
setInterval(() => {
  const players = world.players;

  // Move bullets & check PvP collisions
  world.bullets = world.bullets.filter(b => {
    b.x += b.vx;
    b.y += b.vy;
    b.life--;
    if (b.life <= 0) return false;

    // Check against every living player except shooter
    for (const id in players) {
      const target = players[id];
      if (id === b.owner)   continue;  // don't hit yourself
      if (!target.alive)    continue;
      if (target.invincible > 0) continue;

      if (dist2(b.x, b.y, target.x, target.y) < COLLIDE_RADIUS * COLLIDE_RADIUS) {
        // Hit!
        target.hp -= b.dmg;

        // Notify the hit player
        io.to(id).emit("hit", {
          dmg:         b.dmg,
          hp:          Math.max(0, target.hp),
          shooterName: b.ownerName
        });

        if (target.hp <= 0) {
          target.alive    = false;
          target.deaths  += 1;
          target.respawnAt = Date.now() + RESPAWN_TIME;

          // Credit the killer
          const killer = players[b.owner];
          if (killer) {
            killer.kills += 1;
            killer.score += 100;
            io.to(b.owner).emit("killConfirm", { victimName: target.name });
          }

          // Broadcast the kill
          io.emit("playerKilled", {
            killerId:   b.owner,
            killerName: b.ownerName,
            victimId:   id,
            victimName: target.name,
            respawnIn:  RESPAWN_TIME
          });

          io.emit("scoreUpdate", buildScoreboard());
        }
        return false; // bullet consumed
      }
    }
    return true;
  });

  // Tick invincibility
  for (const id in players) {
    const p = players[id];
    if (p.invincible > 0) p.invincible--;
  }

  // Broadcast world state (position/angle/hp visible to all)
  const statePlayers = {};
  for (const id in players) {
    const p = players[id];
    statePlayers[id] = {
      id:    p.id,
      x:     p.x,    y:    p.y,
      angle: p.angle,
      ship:  p.ship,
      name:  p.name,
      hp:    p.hp,   maxHp: p.maxHp,
      alive: p.alive,
      invincible: p.invincible > 0
    };
  }

  io.emit("state", {
    players: statePlayers,
    bullets: world.bullets.map(b => ({
      x: b.x, y: b.y, vx: b.vx, vy: b.vy,
      owner: b.owner, life: b.life
    }))
  });

}, TICK);

// ─── Start ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () =>
  console.log(`SCI-FI WARZONE — PvP server running on :${PORT}`)
);
