// Function to update status text
function updateStatus(msg, color) {
    const status = document.querySelector('.status-text');
    status.innerText = msg;
    status.style.color = color;
}

// Clock
setInterval(() => {
    document.getElementById('clock').innerText = new Date().toLocaleString();
}, 1000);

// WiFi Scanner Fix
function scanWiFi() {
    updateStatus("Connecting...", "#aaa");
    
    // Replace '192.168.4.1' with your ESP32's IP if it's different
    fetch('http://192.168.4.1/scan-wifi') 
    .then(res => res.json())
    .then(data => {
        updateStatus("WiFi Active", "#39FF14");
        document.getElementById('wifi-btn').style.borderColor = "#39FF14";
    })
    .catch(err => {
        updateStatus("Offline", "red");
        console.error(err);
        // This is the trigger for your image_e1e455.png popup
        alert("Check your connection: Phone must be on ESP32 WiFi.");
    });
}

async function scanBluetooth() {
    try {
        const device = await navigator.bluetooth.requestDevice({ acceptAllDevices: true });
        updateStatus("BLE: " + device.name, "#39FF14");
    } catch (e) {
        updateStatus("BLE Cancelled", "orange");
    }
}

function toggle(id, el) {
    el.classList.toggle('on');
    const state = el.classList.contains('on') ? '1' : '0';
    fetch(`http://192.168.4.1/relay?id=${id}&state=${state}`).catch(() => {});
}

function allOff() {
    document.querySelectorAll('.card').forEach(c => c.classList.remove('on'));
    fetch(`http://192.168.4.1/alloff`).catch(() => {});
}