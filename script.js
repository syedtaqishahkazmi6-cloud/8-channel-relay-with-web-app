const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
let bleChar;

// Device configurations
const devices = [
    { id: 1, name: "Light", icon: '<path d="M9 21h6v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/>' },
    { id: 2, name: "Fan", icon: '<path d="M12 12c0-3 2.5-5.5 5.5-5.5S23 9 23 12H12zm0 0c0 3-2.5 5.5-5.5 5.5S1 15 1 12h11zm0 0c-3 0-5.5-2.5-5.5-5.5S9 1 12 1v11zm0 0c3 0 5.5 2.5 5.5 5.5S15 23 12 23V12z"/>' },
    { id: 3, name: "Hardware", icon: '<path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>' },
    { id: 4, name: "Studio", icon: '<path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>' },
    { id: 5, name: "ClassRoom", icon: '<path d="M5 4v11h14V4H5zm16 13c0 .55-.45 1-1 1h-2l-2-2h-8l-2 2H4c-.55 0-1-.45-1-1v-1h18v1z"/>' },
    { id: 6, name: "Light", icon: '<path d="M9 21h6v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/>' },
    { id: 7, name: "Printer", icon: '<path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>' },
    { id: 8, name: "LED Name", icon: '<path d="M7 19h10v2H7zM5 3h14c1.1 0 2 .9 2 2v11c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2z"/>' }
];

const grid = document.getElementById('relayGrid');
devices.forEach(d => {
    const btn = document.createElement('div');
    btn.className = 'relay-node';
    btn.id = `r-${d.id}`;
    btn.onclick = () => sendCommand(d.id);
    btn.innerHTML = `<svg viewBox="0 0 24 24">${d.icon}</svg><span>${d.name}</span>`;
    grid.appendChild(btn);
});

// Bluetooth Handshake
document.getElementById('btConnect').onclick = async () => {
    try {
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ name: 'ESP32-8Channel' }],
            optionalServices: [SERVICE_UUID]
        });
        const server = await device.gatt.connect();
        const service = await server.getPrimaryService(SERVICE_UUID);
        bleChar = await service.getCharacteristic(CHARACTERISTIC_UUID);
        
        document.getElementById('bt-status').classList.add('bt-on');
        document.getElementById('main-status').innerHTML = 'System: <span style="color:lime">BT Connected</span>';
    } catch (e) { console.log("BT Connection Cancelled/Failed"); }
};

// Wi-Fi Verification Logic
async function connectToESP32Wifi() {
    const statusText = document.getElementById('main-status');
    const wifiNode = document.getElementById('wifi-status');
    statusText.innerHTML = 'System: <span style="color:orange">Pinging ESP32...</span>';

    try {
        await fetch(`http://192.168.4.1/status`, { mode: 'no-cors', cache: 'no-cache' });
        wifiNode.classList.add('wifi-on');
        statusText.innerHTML = 'System: <span style="color:cyan">Wi-Fi Verified</span>';
    } catch (error) {
        wifiNode.classList.remove('wifi-on');
        statusText.innerHTML = 'System: <span style="color:red">Connect to ESP32-AP first</span>';
        alert("Please ensure your phone is connected to the ESP32 Wi-Fi network in your settings.");
    }
}

async function sendCommand(id) {
    const el = document.getElementById(`r-${id}`);
    el.classList.toggle('active');
    
    if (bleChar) await bleChar.writeValue(new Uint8Array([id]));
    fetch(`http://192.168.4.1/toggle?id=${id}`).catch(() => {});
}

function allOff() {
    for(let i=1; i<=8; i++) {
        const el = document.getElementById(`r-${i}`);
        if(el.classList.contains('active')) sendCommand(i);
    }
}

setInterval(() => { document.getElementById('clock').innerText = new Date().toLocaleTimeString(); }, 1000);