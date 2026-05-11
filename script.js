// 1. Relay Control Logic
function toggleRelay(id, element) {
    // Toggle UI state immediately for better HCI feel
    const isOn = element.classList.toggle('on');
    
    // Command the ESP32
    // Assuming your ESP32 handles /relay?id=1&state=on
    const state = isOn ? 'on' : 'off';
    
    fetch(`/relay?id=${id}&state=${state}`)
        .then(response => {
            if (!response.ok) throw new Error('Hardware Unreachable');
            console.log(`Relay ${id} is now ${state}`);
        })
        .catch(error => {
            console.error("Connection failed. Check ESP32 status.");
            // Optional: Revert UI if hardware fails
            // element.classList.toggle('on'); 
        });
}

// 2. WiFi & Bluetooth Connection Logic
function handleStatusConnect(type) {
    const button = document.getElementById(type + '-btn');
    const isConnecting = !button.classList.contains('connected');
    
    // UI Update
    if(isConnecting) {
        button.innerText = (type === 'wifi' ? "📶 Connecting..." : "ᛒ Pairing...");
        
        // Call ESP32 Connection Route
        fetch(`/${type}-connect`)
            .then(res => {
                if(res.ok) {
                    button.classList.add('connected');
                    button.innerText = (type === 'wifi' ? "📶 WiFi" : "ᛒ Bluetooth");
                }
            })
            .catch(err => {
                button.classList.remove('connected');
                button.innerText = (type === 'wifi' ? "📶 WiFi Error" : "ᛒ BLE Error");
            });
    } else {
        // Disconnect logic
        fetch(`/${type}-disconnect`).then(() => {
            button.classList.remove('connected');
        });
    }
}

// 3. Global Master Off
function allOff() {
    fetch('/alloff')
        .then(response => {
            if(response.ok) {
                // Dim all buttons in the UI
                const buttons = document.querySelectorAll('.relay-btn');
                buttons.forEach(btn => btn.classList.remove('on'));
                console.log("All systems deactivated.");
            }
        })
        .catch(err => alert("Communication Error: Could not turn off devices."));
}

// Initialize: Set your Header Image via JS if needed
document.addEventListener('DOMContentLoaded', () => {
    // You can dynamically change the lab image here
    // document.querySelector('.header-section').style.backgroundImage = "url('your_link_here')";
});