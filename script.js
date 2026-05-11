function toggleRelay(id) {
    const btn = document.getElementById(`relay${id}`);
    
    // Call the ESP32 endpoint
    fetch(`/toggle?id=${id}`)
    .then(response => {
        if (response.ok) {
            btn.classList.toggle('active');
        }
    })
    .catch(err => console.log("Communication error: ", err));
}

function allOff() {
    fetch('/alloff')
    .then(response => {
        if (response.ok) {
            // Remove 'active' class from all buttons to dim them
            const buttons = document.querySelectorAll('.control-btn');
            buttons.forEach(btn => btn.classList.remove('active'));
        }
    });
}