const IP = "http://192.168.4.1"; // Your ESP32 IP

function updateStatus(online) {
    const s = document.getElementById('stat');
    s.innerHTML = online ? 'Status: <span class="status-on">ONLINE</span>' : 'Status: <span class="status-off">OFFLINE</span>';
}

// Clock
setInterval(() => {
    document.getElementById('clock').innerText = new Date().toLocaleTimeString();
}, 1000);

// WiFi Scanner with Error Handling
async function scanWiFi() {
    try {
        const r = await fetch(`${IP}/scan-wifi`, { mode: 'no-cors' });
        updateStatus(true);
        alert("WiFi Request Sent to Hardware.");
    } catch (e) {
        updateStatus(false);
        alert("WiFi Fail: 1. Connect to ESP32 WiFi. 2. Enable 'Insecure Content' in Site Settings.");
    }
}

// Bluetooth Request
async function scanBluetooth() {
    try {
        await navigator.bluetooth.requestDevice({ acceptAllDevices: true });
        updateStatus(true);
    } catch (e) {
        console.log("BLE Blocked/Cancelled");
    }
}

// Relay Toggles
function toggle(id, el) {
    const state = el.classList.toggle('on') ? '1' : '0';
    fetch(`${IP}/relay?id=${id}&state=${state}`, { mode: 'no-cors' })
        .catch(() => updateStatus(false));
}

// Master Kill Switch
function allOff() {
    document.querySelectorAll('.card').forEach(c => c.classList.remove('on'));
    fetch(`${IP}/alloff`, { mode: 'no-cors' }).catch(() => updateStatus(false));
}