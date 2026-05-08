const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
let bleChar;

// Generate 8 buttons automatically
const grid = document.getElementById('buttonGrid');
for (let i = 1; i <= 8; i++) {
    grid.innerHTML += `
        <div class="card">
            <h3>Relay ${i}</h3>
            <button class="toggle-btn" onclick="triggerRelay(${i})">TOGGLE</button>
        </div>`;
}

// Bluetooth Connection
document.getElementById('btConnect').addEventListener('click', async () => {
    const device = await navigator.bluetooth.requestDevice({
        filters: [{ name: 'ESP32-8Channel' }],
        optionalServices: [SERVICE_UUID]
    });
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(SERVICE_UUID);
    bleChar = await service.getCharacteristic(CHARACTERISTIC_UUID);
    document.getElementById('status').innerText = "Status: Bluetooth Connected";
});

// Trigger Function (Sends to both BLE and Wi-Fi)
async function triggerRelay(id) {
    // 1. Try Bluetooth
    if (bleChar) {
        await bleChar.writeValue(new Uint8Array([id]));
    } 
    // 2. Try Wi-Fi (Assumes ESP32 is at this local IP)
    fetch(`http://192.168.4.1/toggle?id=${id}`).catch(() => console.log("Wi-Fi not reachable"));
}