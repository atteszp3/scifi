# Sci-Fi Warzone

A browser-based sci-fi space shooter game with single player wave combat and real-time multiplayer.

## Architecture

- **Backend**: Node.js + Express + Socket.io (`server.js`) on port 5000
- **Frontend**: Vanilla JS + HTML5 Canvas (`public/index.html`)
- **Assets**: Sprites in `img/` (alien, player ships, bullet, galaxy, planets)

## Gameplay Features

### Single Player
- Wave-based alien enemy spawning (waves increase in difficulty)
- 3 enemy types: Chaser, Shooter (ranged), Zigzag
- 3 difficulty modes: Rookie, Veteran, Nightmare
- Powerups: HP repair, Shield, Rapid Fire
- Particle effects, explosions, screen shake
- Scrolling galaxy background with parallax planets

### Multiplayer
- Real-time via Socket.io (connects to same server)
- See other players on screen and on radar
- Shared shooting (bullets synced via server)

### Controls
- **WASD / Arrow Keys**: Move
- **Mouse**: Aim
- **Left Click / Hold**: Shoot
- **Space / Enter**: Shoot
- **Escape**: Pause
- **Mobile**: Virtual joystick (left) + FIRE button (right)

### HUD
- HP bar, score, wave counter, pilot name, mode
- Radar with enemy/ally blips + sweep animation
- Kill feed notifications
- Wave announcements

## Ship Selection
- **VIPER**: Fast, light armor
- **CRUISER**: Slower, heavy armor

## Running

```bash
npm install
node server.js
```

Server runs on port 5000.
