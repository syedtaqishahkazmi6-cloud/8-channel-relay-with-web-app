// script.js
const IP = "http://192.168.4.1"; // ESP32 default AP IP when using WiFiManager or similar
let hasAlerted = false;

function updateStatus(online) {
  const s = document.getElementById('stat');
  s.innerHTML = online ? 'Status: <span class="status-on">ONLINE</span>' : 'Status: <span class="status-off">OFFLINE</span>';
}

/* Clock */
setInterval(() => {
  const el = document.getElementById('clock');
  if (el) el.innerText = new Date().toLocaleTimeString();
}, 1000);

/* Utility: fetch with timeout */
function fetchWithTimeout(url, options = {}, timeout = 3000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), timeout);
    fetch(url, options).then(res => {
      clearTimeout(timer);
      resolve(res);
    }).catch(err => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

/* Ping fallback using Image object (works around some CORS issues for simple reachability) */
function pingHost(host, timeout = 2500) {
  return new Promise((resolve) => {
    const img = new Image();
    let done = false;
    const timer = setTimeout(() => {
      if (!done) { done = true; resolve(false); }
    }, timeout);
    img.onload = img.onerror = () => {
      if (!done) { done = true; clearTimeout(timer); resolve(true); }
    };
    // add cache buster
    img.src = `${host}/favicon.ico?cb=${Date.now()}`;
  });
}

/* WiFi scan attempt
   - Try a CORS fetch first (recommended: enable CORS on the ESP32 server)
   - If that fails, fallback to a ping (image) to detect reachability
   - Update UI accordingly and show a one-time hint about CORS/insecure content
*/
async function scanWiFi() {
  updateStatus(false);
  try {
    // Try CORS-enabled endpoint first
    await fetchWithTimeout(`${IP}/scan-wifi`, { method: 'GET', mode: 'cors' }, 2500);
    updateStatus(true);
  } catch (e) {
    // Fallback: try no-cors (opaque) request then ping
    try {
      await fetchWithTimeout(`${IP}/scan-wifi`, { method: 'GET', mode: 'no-cors' }, 2500);
      // no-cors gives opaque response; assume success if no network error
      updateStatus(true);
    } catch (e2) {
      // final fallback: ping host with image
      const reachable = await pingHost(IP);
      updateStatus(reachable);
      if (!reachable && !hasAlerted) {
        // One-time guidance for the user
        alert("Cannot reach the ESP32 at " + IP + ". If your device is connected to the ESP32 AP, ensure the ESP32 serves CORS headers or open the IP in the browser to accept insecure content.");
        hasAlerted = true;
      }
    }
  }
}

/* Bluetooth scan
   - Use filters when possible to prefer ESP32 devices (change namePrefix to match your device)
   - Must be called from a user gesture (button click)
*/
async function scanBluetooth() {
  updateStatus(false);
  if (!navigator.bluetooth) {
    alert("Bluetooth API not available in this browser. Use Chrome on Android or a supported browser.");
    return;
  }

  try {
    // Prefer devices whose name contains "ESP" or "ESP32" but allow acceptAllDevices as fallback
    const filters = [{ namePrefix: 'ESP' }, { namePrefix: 'ESP32' }];
    let device;
    try {
      device = await navigator.bluetooth.requestDevice({ filters, optionalServices: [] });
    } catch (err) {
      // If user cancels or no filtered device found, allow acceptAllDevices as fallback
      device = await navigator.bluetooth.requestDevice({ acceptAllDevices: true });
    }
    if (device) {
      updateStatus(true);
      // You can connect and use GATT here if your ESP32 exposes BLE services
      // Example: const server = await device.gatt.connect();
    }
  } catch (err) {
    console.log('Bluetooth error', err);
    // keep status as offline if user cancels or error occurs
  }
}

/* Toggle relay
   - UI toggles immediately for snappy feedback
   - Try CORS fetch first; fallback to no-cors or ping
*/
async function toggle(id, el) {
  const isOn = el.classList.toggle('on');
  const state = isOn ? '1' : '0';
  updateStatus(false);

  const url = `${IP}/relay?id=${encodeURIComponent(id)}&state=${encodeURIComponent(state)}`;

  try {
    await fetchWithTimeout(url, { method: 'GET', mode: 'cors' }, 2500);
    updateStatus(true);
  } catch (e) {
    try {
      await fetchWithTimeout(url, { method: 'GET', mode: 'no-cors' }, 2500);
      updateStatus(true);
    } catch (e2) {
      // If network unreachable, revert UI toggle to reflect actual state unknown
      const reachable = await pingHost(IP);
      updateStatus(reachable);
      if (!reachable) {
        // revert toggle because command likely didn't reach device
        el.classList.toggle('on');
      } else {
        // reachable but request failed; keep UI state but notify once
        if (!hasAlerted) {
          alert('Device reachable but request failed. Ensure the ESP32 server accepts CORS or supports the requested endpoint.');
          hasAlerted = true;
        }
      }
    }
  }
}

/* All off */
async function allOff() {
  document.querySelectorAll('.card.on').forEach(c => c.classList.remove('on'));
  updateStatus(false);
  const url = `${IP}/alloff`;
  try {
    await fetchWithTimeout(url, { method: 'POST', mode: 'cors' }, 3000);
    updateStatus(true);
  } catch (e) {
    try {
      await fetchWithTimeout(url, { method: 'POST', mode: 'no-cors' }, 3000);
      updateStatus(true);
    } catch (e2) {
      const reachable = await pingHost(IP);
      updateStatus(reachable);
      if (!reachable && !hasAlerted) {
        alert('Could not send ALL OFF. Check connection to ESP32 and CORS settings.');
        hasAlerted = true;
      }
    }
  }
}

/* Attach event listeners */
document.addEventListener('DOMContentLoaded', () => {
  // wire up card clicks
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      if (!id) return;
      toggle(id, card);
    });
  });

  // connection buttons
  document.getElementById('wifi-btn').addEventListener('click', scanWiFi);
  document.getElementById('ble-btn').addEventListener('click', scanBluetooth);
  document.getElementById('masterOffBtn').addEventListener('click', allOff);

  // initial ping to set status
  pingHost(IP).then(reachable => updateStatus(reachable));
});
