#include <WiFi.h>
#include <WebServer.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// WiFi Configuration
const char* ssid = "ESP32-8Channel";
const char* password = "12345678";
WebServer server(80);

// BLE Configuration
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"
BLEServer* pServer = NULL;
BLECharacteristic* pCharacteristic = NULL;
bool deviceConnected = false;

// Relay Configuration
const int relayPins[8] = {2, 4, 5, 13, 14, 15, 16, 17}; // Adjust pins based on your ESP32 board
bool relayStates[8] = {false, false, false, false, false, false, false, false};

// BLE Callbacks
class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
        deviceConnected = true;
    };
    void onDisconnect(BLEServer* pServer) {
        deviceConnected = false;
    }
};

class MyCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
        std::string value = pCharacteristic->getValue();
        if (value.length() > 0) {
            uint8_t relayId = value[0];
            if (relayId >= 1 && relayId <= 8) {
                toggleRelay(relayId);
            }
        }
    }
};

void setup() {
    Serial.begin(115200);
    
    // Initialize Relay Pins
    for (int i = 0; i < 8; i++) {
        pinMode(relayPins[i], OUTPUT);
        digitalWrite(relayPins[i], LOW);
    }
    
    // Setup WiFi Access Point
    WiFi.softAP(ssid, password);
    Serial.println("WiFi AP started");
    Serial.print("IP Address: ");
    Serial.println(WiFi.softAPIP());
    
    // Setup Web Server Routes
    server.on("/status", HTTP_GET, handleStatus);
    server.on("/toggle", HTTP_GET, handleToggle);
    server.begin();
    Serial.println("HTTP server started");
    
    // Setup BLE
    BLEDevice::init("ESP32-8Channel");
    pServer = BLEDevice::createServer();
    pServer->setCallbacks(new MyServerCallbacks());
    
    BLEService *pService = pServer->createService(SERVICE_UUID);
    pCharacteristic = pService->createCharacteristic(
        CHARACTERISTIC_UUID,
        BLECharacteristic::PROPERTY_READ |
        BLECharacteristic::PROPERTY_WRITE
    );
    pCharacteristic->setCallbacks(new MyCallbacks());
    pCharacteristic->setValue("ESP32 Relay Controller");
    pService->start();
    
    BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
    pAdvertising->addServiceUUID(SERVICE_UUID);
    pAdvertising->setScanResponse(true);
    pAdvertising->setMinPreferred(0x06);
    pAdvertising->setMinPreferred(0x12);
    BLEDevice::startAdvertising();
    Serial.println("BLE started");
    
    Serial.println("System ready!");
}

void loop() {
    server.handleClient();
    delay(10);
}

void handleStatus() {
    String json = "{\"status\":\"ok\"}";
    server.send(200, "application/json", json);
}

void handleToggle() {
    if (server.hasArg("id")) {
        int id = server.arg("id").toInt();
        if (id >= 1 && id <= 8) {
            toggleRelay(id);
            String json = "{\"relay\":" + String(id) + ",\"state\":" + String(relayStates[id-1] ? "true" : "false") + "}";
            server.send(200, "application/json", json);
            return;
        }
    }
    server.send(400, "application/json", "{\"error\":\"Invalid relay ID\"}");
}

void toggleRelay(int id) {
    int index = id - 1;
    relayStates[index] = !relayStates[index];
    digitalWrite(relayPins[index], relayStates[index] ? HIGH : LOW);
    Serial.print("Relay ");
    Serial.print(id);
    Serial.print(" toggled to ");
    Serial.println(relayStates[index] ? "ON" : "OFF");
}
