// Dynamic Clock
setInterval(() => {
    document.getElementById('clock').innerText = new Date().toLocaleString();
}, 1000);

// 1. Bluetooth Connection Logic
async function scanBluetooth() {
    try {
        const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ['battery_service'] // Example service
        });
        updateStatus("Connected (BLE)", "#39FF14");
        document.getElementById('ble-btn').style.borderColor = "#39FF14";
    } catch (err) {
        updateStatus("BLE Denied", "orange");
    }
}

// 2. WiFi Scanning Logic
function scanWiFi() {
    updateStatus("Scanning WiFi...", "white");
    fetch('/scan-wifi')
    .then(res => res.json())
    .then(data => {
        updateStatus("WiFi Active", "#39FF14");
        document.getElementById('wifi-btn').style.borderColor = "#39FF14";
        alert("Found " + data.length + " networks. Check Serial Monitor.");
    })
    .catch(() => {
        updateStatus("ESP32 Offline", "red");
        alert("Please connect to the ESP32 Access Point first.");
    });
}

function updateStatus(text, color) {
    const status = document.querySelector('.status-text');
    status.innerText = text;
    status.style.color = color;
}

// 3. Relay Toggles
function toggle(id, el) {
    const isActivating = el.classList.toggle('on');
    const state = isActivating ? '1' : '0';
    
    // Send command to ESP32
    fetch(`/relay?id=${id}&state=${state}`)
        .then(() => console.log(`Relay ${id} -> ${state}`))
        .catch(() => console.log("Hardware not responding"));
}

// 4. Master Off
function allOff() {
    fetch('/alloff').then(() => {
        document.querySelectorAll('.card').forEach(c => c.classList.remove('on'));
    });
}