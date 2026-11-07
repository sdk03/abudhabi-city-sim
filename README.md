# 🇦🇪 Abu Dhabi Oasis & Metropolis: Web3 City Simulator

A Next.js 14 Web3 city building simulator set in Abu Dhabi, United Arab Emirates. Built with **web3.js**, modern React, TypeScript, Tailwind CSS, an interactive 2.5D isometric canvas engine, dynamic simulation loop, and zero-dependency Web Audio synthesizer.

---

## 🌟 Key Features

### 🏛️ Authentic Abu Dhabi Districts & Landmarks
- **Sheikh Zayed Grand Mosque (جامع الشيخ زايد الكبير)**: 82 pure white marble domes, 24-carat golden minarets, and reflective blue pools.
- **Louvre Abu Dhabi (متحف اللوفر أبوظبي)**: Silvery geometric lattice dome generating the iconic "rain of light" over the Arabian Gulf.
- **Etihad Towers Complex (أبراج الاتحاد)**: Crystalline skyscrapers with sea views and panoramic observation decks.
- **Yas Marina F1 Circuit (حلبة مرسى ياس)**: Twilight Grand Prix track with animated race cars and marina superyachts.
- **Masdar Zero-Carbon City (مدينة مصدر المستدامة)**: Bifacial solar PV array producing 100% clean energy surplus.
- **Jubail Mangrove Sanctuary (محمية قرم الجبيل)**: Tidal waterways protecting blue carbon and coastal biodiversity.
- **Liwa Oasis & Falaj (واحة ليوا وقنوات الفلج)**: Ancient date palm groves fed by subterranean irrigation channels.
- **ADGM Financial Free Zone & ADNOC Tower**: Sovereign wealth, crypto capital, and energy transition hubs.

### ⛓️ Web3 & Web3.js Integration
- **Web3.js v4 Architecture**: Direct integration with EVM providers (`window.ethereum`) and automatic fallback to an on-device Sovereign Sandbox account for offline play.
- **$ADX ERC-20 City Token**: Faucet claiming, balance queries (`contract.methods.balanceOf`), and converting tokens into city treasury liquidity.
- **Land Parcel NFT Deeds (ERC-721)**: Mint district deeds on-chain to unlock sovereign development grants.
- **Mayoral Executive Decrees**: Cryptographically sign municipal policies via `web3.eth.personal.sign`.

### 🎮 City Simulation Mechanics
- **Resource Economy**: Treasury ($ADX), Population, Clean Electricity (MW produced vs consumed), Desalinated Water (m³), Citizen Happiness (%), and Vision 2030 Sustainability Rating.
- **Dynamic Events**: Abu Dhabi Grand Prix Weekend (+50% commercial boost), Masdar Energy Summit (+40% solar yield), Saadiyat Art Biennale, and ADGM Web3 Week.
- **Atmospheric Time-of-Day**: Switch between Bright Arabian Day, Golden Hour Desert Sunset, and Starlit Night with illuminated skyscrapers.
- **Built-in Audio Synthesizer**: Zero external audio downloads; leverages HTML5 Web Audio API to synthesize construction chimes, coin collection, demolish thuds, and Web3 success fanfares.

---

## 🚀 Quick Start (Termux / Linux)

### 1. Run the Automated Installer
From your Termux terminal, run:

```bash
cd /data/data/com.termux/files/home/gdg7nov/abudhabi-city-sim
chmod +x setup.sh start.sh
./setup.sh
```

This will automatically:
1. Update packages and install `nodejs-lts` via Termux's `pkg` package manager.
2. Install `pnpm` globally via npm (`npm install -g pnpm`).
3. Install all project dependencies via `pnpm install`.

### 2. Start the Development Server

```bash
./start.sh
# or
pnpm dev
```

The server binds to `0.0.0.0` so you can access it across your local network (LAN):
- **Local:** `http://localhost:3000`
- **On LAN (Phones, Laptops, Tablets on same Wi-Fi):** `http://<your-device-ip>:3000` (The exact URL is shown in the terminal when launching `./start.sh` or `pnpm dev`)

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Web3**: `web3` (v4.x)
- **Icons**: `lucide-react`
- **Audio**: Web Audio API (native browser synthesizer)
- **Engine**: HTML5 2D Canvas Isometric Renderer
- **Package Manager**: `pnpm`

---

## 📁 Directory Structure

```
abudhabi-city-sim/
├── app/
│   ├── globals.css         # Tailwind & custom typography
│   ├── layout.tsx          # Root HTML metadata & viewport
│   └── page.tsx            # Main game controller & simulation loop
├── components/
│   ├── CityCanvas.tsx      # Isometric 2.5D rendering engine
│   ├── Header.tsx          # Top navigation, time cycle & wallet badge
│   ├── StatsBar.tsx        # Resources, treasury, speed controls
│   ├── BuildMenu.tsx       # Construction palette & bulldozer
│   ├── Web3Modal.tsx       # Web3.js EVM wallet & NFT deeds
│   ├── TokenFaucetModal.tsx# Free $ADX testnet faucet
│   ├── AchievementsModal.tsx # Vision 2030 milestones
│   ├── EventsBanner.tsx    # Live municipal news ticker
│   └── DistrictSelector.tsx# Island & district switcher
├── lib/
│   ├── audioSynth.ts       # Web Audio API sound synthesizer
│   ├── buildingsData.ts    # Abu Dhabi landmarks & stats definitions
│   ├── gameEngine.ts       # Economy math & random events
│   ├── utils.ts            # Formatting & class helpers
│   └── web3.ts             # Web3.js contract interfaces & mock fallback
├── package.json
├── setup.sh                # Node.js + pnpm automated installer
├── start.sh                # Dev server launcher
├── tsconfig.json
└── tailwind.config.ts
```

---

*Built with ❤️ for Abu Dhabi and the UAE Web3 Developer Community.*
