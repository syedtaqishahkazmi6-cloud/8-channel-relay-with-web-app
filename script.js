const IP = "http://192.168.4.1"; 
let hasAlerted = false;

function updateStatus(online) {
    const s = document.getElementById('stat');
    s.innerHTML = online ? 'Status: <span class="status-on">ONLINE</span>' : 'Status: <span class="status-off">OFFLINE</span>';
}

// Clock
setInterval(() => {
    document.getElementById('clock').innerText = new Date().toLocaleTimeString();
}, 1000);

// WiFi Fix: No-cors and silent error
async function scanWiFi() {
    try {
        await fetch(`${IP}/scan-wifi`, { mode: 'no-cors' });
        updateStatus(true);
    } catch (e) {
        if (!hasAlerted) {
            alert("SECURITY: Click the Lock Icon -> Site Settings -> Allow Insecure Content.");
            hasAlerted = true;
        }
        updateStatus(false);
    }
}

// Bluetooth Fix
async function scanBluetooth() {
    try {
        const device = await navigator.bluetooth.requestDevice({ acceptAllDevices: true });
        updateStatus(true);
    } catch (e) { console.log("BLE Blocked"); }
}

// Compact Relay Toggle
function toggle(id, el) {
    const state = el.classList.toggle('on') ? '1' : '0';
    fetch(`${IP}/relay?id=${id}&state=${state}`, { mode: 'no-cors' })
        .then(() => updateStatus(true))
        .catch(() => updateStatus(false));
}

function allOff() {
    document.querySelectorAll('.card').forEach(c => c.classList.remove('on'));
    fetch(`${IP}/alloff`, { mode: 'no-cors' }).catch(() => updateStatus(false));
}