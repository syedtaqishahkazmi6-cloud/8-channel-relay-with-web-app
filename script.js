const IP = "http://192.168.4.1"; // Your ESP32 IP

function updateStatus(online) {
    const s = document.getElementById('stat');
    s.innerHTML = online ? 'Status: <span class="status-on">ONLINE</span>' : 'Status: <span class="status-off">OFFLINE</span>';
}

// Clock
setInterval(() => {
    document.getElementById('clock').innerText = new Date().toLocaleTimeString();
}, 1000);

// WiFi Scanner with CORS Bypass
async function scanWiFi() {
    updateStatus(false);
    try {
        await fetch(`${IP}/scan-wifi`, { mode: 'no-cors' });
        updateStatus(true);
        alert("WiFi Request Sent. Hardware responding.");
    } catch (e) {
        alert("SECURITY: Open Site Settings -> Allow Insecure Content.");
    }
}

// Bluetooth Fix
async function scanBluetooth() {
    try {
        const device = await navigator.bluetooth.requestDevice({ acceptAllDevices: true });
        updateStatus(true);
        console.log("Connected to: " + device.name);
    } catch (e) {
        console.log("BLE cancelled or browser unsupported.");
    }
}

// Relay Toggles
function toggle(id, el) {
    const state = el.classList.toggle('on') ? '1' : '0';
    fetch(`${IP}/relay?id=${id}&state=${state}`, { mode: 'no-cors' })
        .then(() => updateStatus(true))
        .catch(() => updateStatus(false));
}

// Master Kill Switch
function allOff() {
    document.querySelectorAll('.card').forEach(c => c.classList.remove('on'));
    fetch(`${IP}/alloff`, { mode: 'no-cors' }).catch(() => updateStatus(false));
}