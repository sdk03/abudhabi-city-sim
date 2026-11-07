#!/data/data/com.termux/files/usr/bin/bash
cd "$(dirname "$0")"

# Detect local LAN IP address
LAN_IP=$(ip route get 1.1.1.1 2>/dev/null | awk '{print $7}')
if [ -z "$LAN_IP" ]; then
  LAN_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
fi
if [ -z "$LAN_IP" ]; then
  LAN_IP=$(ifconfig 2>/dev/null | awk '/inet / && !/127.0.0.1/ {print $2}' | head -n 1)
fi
if [ -z "$LAN_IP" ]; then
  LAN_IP="<your-device-ip>"
fi

echo "=========================================================="
echo "🇦🇪 Starting Abu Dhabi Web3 City Simulator on LAN"
echo "=========================================================="
echo "📱 Local access:   http://localhost:3000"
echo "🌐 LAN access:     http://${LAN_IP}:3000"
echo "=========================================================="
pnpm dev
