// Function to update the clock
function updateTime() {
    const now = new Date();
    document.getElementById('timer').innerText = now.toLocaleString();
}
setInterval(updateTime, 1000);

// 1. Relay Toggle Logic
function toggleRelay(id, element) {
    const isActivating = !element.classList.contains('on');
    
    // Immediate Visual Feedback (Brighten/Dim)
    element.classList.toggle('on');
    
    // ESP32 Communication
    const state = isActivating ? '1' : '0';
    fetch(`/relay?id=${id}&state=${state}`)
        .then(res => console.log(`Relay ${id} toggled`))
        .catch(err => {
            console.error("Hardware Unreachable");
            // Optional: element.classList.remove('on'); // Revert if failed
        });
}

// 2. WiFi/BLE Toggle Logic
function toggleConnection(type) {
    const btn = document.getElementById(type + '-btn');
    const isConnecting = !btn.classList.contains('active');
    
    btn.classList.toggle('active');
    
    const endpoint = isConnecting ? `/${type}-on` : `/${type}-off`;
    fetch(endpoint).then(() => {
        document.querySelector('.status-text').innerText = isConnecting ? "Connected" : "Disconnect";
        document.querySelector('.status-text').style.color = isConnecting ? "#39FF14" : "red";
    });
}

// 3. Master Off Logic
function masterOff() {
    fetch('/alloff').then(() => {
        const cards = document.querySelectorAll('.relay-card');
        cards.forEach(card => card.classList.remove('on'));
        console.log("All systems dimmed.");
    });
}