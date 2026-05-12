const ESP_IP = "http://192.168.4.1"; // Change to your ESP IP if needed

function updateStatus(isOnline) {
    const stat = document.getElementById('conn-stat');
    if(isOnline) {
        stat.innerText = "ONLINE";
        stat.className = "status-on";
    } else {
        stat.innerText = "OFFLINE";
        stat.className = "status-off";
    }
}

// Timer
setInterval(() => {
    document.getElementById('clock').innerText = new Date().toLocaleTimeString();
}, 1000);

async function scanWiFi() {
    try {
        const response = await fetch(`${ESP_IP}/scan-wifi`);
        if(response.ok) {
            updateStatus(true);
            alert("ESP32 Found!");
        }
    } catch (e) {
        updateStatus(false);
        alert("SECURITY BLOCK: Since you are on GitHub (HTTPS), you must allow 'Insecure Content' in site settings to talk to ESP32 (HTTP).");
    }
}

function toggle(id, el) {
    const state = el.classList.toggle('on') ? '1' : '0';
    fetch(`${ESP_IP}/relay?id=${id}&state=${state}`).catch(() => updateStatus(false));
}

function allOff() {
    console.log("Master Kill Switch Activated");
    document.querySelectorAll('.card').forEach(c => c.classList.remove('on'));
    fetch(`${ESP_IP}/alloff`).catch(() => updateStatus(false));
}

// Standard Bluetooth Request
async function scanBluetooth() {
    try {
        await navigator.bluetooth.requestDevice({ acceptAllDevices: true });
        updateStatus(true);
    } catch (e) { console.log("BLE Cancelled"); }
}