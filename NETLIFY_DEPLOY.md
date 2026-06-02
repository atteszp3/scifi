# Netlify Deploy Guide for Sci-Fi Warzone

## 1. Upload ZIP
1. Go to [netlify.com](https://netlify.com) and log in (or sign up with GitHub)
2. Click **"Add new site"** -> **"Deploy manually"**
3. Drag and drop the `sci-fi-warzone.zip` file
4. Wait for the build to complete

## 2. Settings (after deploy)
1. Go to **Site settings** -> **Build & deploy**
2. Set **Publish directory** to: `public`
3. Set **Build command** to: (leave empty)

## 3. Custom Domain
1. Go to **Site settings** -> **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain name (e.g. `yourgame.com`)
4. Follow the DNS instructions to point your domain to Netlify

## 4. Environment Variables
If you need the Socket.io backend:
1. Go to **Site settings** -> **Environment variables**
2. Add `NODE_ENV` = `production`

## 5. Chat Feature (Multiplayer)
The chat works **automatically** in **PvP Multiplayer** mode.
- Open the chat panel by clicking the chat box at the bottom-right
- Type a message and press Enter or click **SEND**
- All connected players receive the message in real-time

## 6. For Backend (Node.js + Socket.io)
If you want the multiplayer server too:
1. Use **Netlify Functions** (serverless)
2. Or deploy to **Render.com** instead (supports Node.js always-running)

## Alternative: Render.com (Recommended for Backend + Chat)
1. Go to [render.com](https://render.com)
2. Create a **Web Service**
3. Upload your project or connect GitHub
4. Set **Start command**: `node server.js`
5. Set **Environment**: `Node`
6. The chat will work automatically with all multiplayer features

## Free Tier Limits
- **Netlify**: 100GB/month, 125k requests/month
- **Render**: 512MB RAM, sleeps after 15min idle
