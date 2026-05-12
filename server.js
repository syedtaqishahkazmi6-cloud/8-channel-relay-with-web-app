// server.js
import express from "express";
import fetch from "node-fetch";

const app = express();
const ESP32_IP = "http://192.168.4.1"; // ESP32 local IP

// Proxy relay toggle
app.get("/relay", async (req, res) => {
  const { id, state } = req.query;
  try {
    const r = await fetch(`${ESP32_IP}/relay?id=${id}&state=${state}`);
    const text = await r.text();
    res.send(text);
  } catch {
    res.status(500).send("ESP32 unreachable");
  }
});

// Proxy all off
app.post("/alloff", async (req, res) => {
  try {
    const r = await fetch(`${ESP32_IP}/alloff`, { method: "POST" });
    const text = await r.text();
    res.send(text);
  } catch {
    res.status(500).send("ESP32 unreachable");
  }
});

// Proxy WiFi scan
app.get("/scan-wifi", async (req, res) => {
  try {
    const r = await fetch(`${ESP32_IP}/scan-wifi`);
    const text = await r.text();
    res.send(text);
  } catch {
    res.status(500).send("ESP32 unreachable");
  }
});

app.listen(3000, () => console.log("Proxy running on port 3000"));
