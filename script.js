const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
let bleCharacteristic;

// Initialize the 8 Buttons
const grid = document.getElementById('relayGrid');
for (let i = 1; i <= 8; i++) {
    grid.innerHTML += `
        <div class="relay-card">
            <h3>Relay ${i}</h3>
            <button class="toggle-btn" onclick="triggerRelay(${i})">TOGGLE</button>
        </div>`;
}

// Bluetooth Connection Logic
document.getElementById('btConnect').addEventListener('click', async () => {
    try {
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ name: 'ESP32-8Channel' }],
            optionalServices: [SERVICE_UUID]
        });
        const server = await device.gatt.connect();
        const service = await server.getPrimaryService(SERVICE_UUID);
        bleCharacteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);
        document.getElementById('status').innerText = "Status: Bluetooth Connected";
    } catch (error) {
        console.error(error);
        document.getElementById('status').innerText = "Status: BT Failed";
    }
});

// Wi-Fi Status Check
async function checkWifi() {
    const ip = document.getElementById('ipAddress').value;
    document.getElementById('status').innerText = "Status: Checking Wi-Fi...";
    try {
        // We use 'no-cors' because the ESP32 doesn't have an SSL certificate
        await fetch(`http://${ip}/status`, { mode: 'no-cors' });
        document.getElementById('status').innerText = "Status: Wi-Fi Reachable";
    } catch (e) {
        document.getElementById('status').innerText = "Status: Wi-Fi Unreachable";
    }
}

// Main Trigger Function (Dual Mode)
async function triggerRelay(id) {
    const ip = document.getElementById('ipAddress').value;
    
    // 1. Try Bluetooth First
    if (bleCharacteristic) {
        try {
            await bleCharacteristic.writeValue(new Uint8Array([id]));
            document.getElementById('status').innerText = `Status: Relay ${id} (BT)`;
            return;
        } catch (e) {
            console.log("BT disconnected, trying Wi-Fi...");
        }
    }

    // 2. Fallback to Wi-Fi
    try {
        await fetch(`http://${ip}/toggle?id=${id}`, { mode: 'no-cors' });
        document.getElementById('status').innerText = `Status: Relay ${id} (WiFi)`;
    } catch (e) {
        document.getElementById('status').innerText = "Status: Connection Failed";
    }
}

// Master Off Feature
async function allOff() {
    document.getElementById('status').innerText = "Status: Sending ALL OFF...";
    for (let i = 1; i <= 8; i++) {
        // Send command for each relay (sequential)
        await triggerRelay(i); 
        // Small delay to prevent flooding the ESP32
        await new Promise(r => setTimeout(r, 100));
    }
}