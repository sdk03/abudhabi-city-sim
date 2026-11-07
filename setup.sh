#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "=========================================================="
echo "🇦🇪 Abu Dhabi Web3 City Simulator - Automated Setup Script"
echo "=========================================================="
echo ""

# 1. Check or install Node.js in Termux
if ! command -v node &> /dev/null; then
    echo "📦 Node.js not detected. Installing nodejs-lts via Termux pkg manager..."
    pkg update -y
    pkg install -y nodejs-lts
else
    echo "✅ Node.js detected: $(node -v)"
fi

# 2. Check or install pnpm
if ! command -v pnpm &> /dev/null; then
    echo "📦 pnpm not detected. Installing pnpm globally via npm..."
    npm install -g pnpm
else
    echo "✅ pnpm detected: $(pnpm -v)"
fi

# 3. Install project dependencies
echo "🚀 Installing dependencies using pnpm..."
cd "$(dirname "$0")"
pnpm install

echo ""
echo "=========================================================="
echo "🎉 Setup complete! To launch the game, run:"
echo "   ./start.sh"
echo "   or"
echo "   pnpm dev"
echo "=========================================================="
