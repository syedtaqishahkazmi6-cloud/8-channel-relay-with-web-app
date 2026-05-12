// Clock Function
setInterval(() => {
    document.getElementById('clock').innerText = new Date().toLocaleString();
}, 1000);

// 1. Bluetooth Scan (Native Browser Scanner)
async function scanBluetooth() {
    try {
        const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true
        });
        document.getElementById('ble-btn').style.borderColor = "#39FF14";
        document.querySelector('.status-red').innerText = "Connected (BLE)";
        document.querySelector('.status-red').style.color = "#39FF14";
    } catch (err) {
        console.log("User cancelled scan or browser lacks BLE support");
    }
}

// 2. WiFi Scan (Triggers ESP32 to scan networks)
function scanWiFi() {
    fetch('/scan-wifi')
    .then(res => res.json())
    .then(networks => {
        alert("Found " + networks.length + " WiFi Networks. Check ESP32 Serial.");
        document.getElementById('wifi-btn').style.borderColor = "#39FF14";
    })
    .catch(() => alert("Connect to ESP32 Hotspot first!"));
}

// 3. Relay Toggles
function toggle(id, el) {
    el.classList.toggle('on');
    const state = el.classList.contains('on') ? '1' : '0';
    fetch(`/relay?id=${id}&state=${state}`).catch(e => console.log("Offline"));
}

// 4. All Off
function allOff() {
    fetch('/alloff').then(() => {
        document.querySelectorAll('.card').forEach(c => c.classList.remove('on'));
    });
}