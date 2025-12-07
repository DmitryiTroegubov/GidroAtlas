#define WATER_PIN 34
#define RELAY_PIN 25
#define SERVO_PIN 26
#define WATER_THRESHOLD 800

Servo servoMotor;

int remoteControl = -1;   // -1 = AUTO, 0 = OFF, 1 = ON
int waterValue = 0;
float temperature = 0.0;
float humidity = 0.0;

unsigned long lastSend = 0;
unsigned long lastGet = 0;
unsigned long lastDHT = 0;

void setup() {
  Serial.begin(115200);
  dht.begin();

  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);

  servoMotor.attach(SERVO_PIN);
  servoMotor.write(0);

  WiFi.begin(SSID, PASSWORD);
  Serial.print("WiFi Connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected");
}

void loop() {
  unsigned long now = millis();

  // Read water level
  waterValue = analogRead(WATER_PIN);
  Serial.println("Water: " + String(waterValue));

  // Read DHT every 3 sec
  if (now - lastDHT > 3000) {
    lastDHT = now;
    temperature = dht.readTemperature();
    humidity = dht.readHumidity();
    if (isnan(temperature) || isnan(humidity)) {
      Serial.println("DHT11 Error!");
    }
  }

  controlHardware();

  if (now - lastSend > 5000) {
    lastSend = now;
    sendData();
  }

  if (now - lastGet > 7000) {
    lastGet = now;
    getRemoteControl();
  }
}

// ======================================================
void controlHardware() {
  bool state = false;

  if (remoteControl == 1) state = true;
  else if (remoteControl == -1 && waterValue > WATER_THRESHOLD) state = true;

  if (state) {
    digitalWrite(RELAY_PIN, HIGH);
    servoMotor.write(90);
  } else {
    digitalWrite(RELAY_PIN, LOW);
    servoMotor.write(0);
  }
}

// ======================================================
void sendData() {
  HTTPClient http;
  StaticJsonDocument<300> doc;

  doc["water"] = waterValue;
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;

  String body;
  serializeJson(doc, body);

  String endpoint = String(supabaseUrl) + "/rest/v1/" + tableName + "?id=eq.1";

  http.begin(endpoint);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", supabaseKey);
  http.addHeader("Authorization", "Bearer " + String(supabaseKey));

  http.PATCH(body);
  http.end();
}

// ======================================================
void getRemoteControl() {
  HTTPClient http;
  String endpoint = String(supabaseUrl) + "/rest/v1/" + tableName + "?id=eq.1&select=remote_control";

  http.begin(endpoint);
  http.addHeader("apikey", supabaseKey);
  http.addHeader("Authorization", "Bearer " + String(supabaseKey));

  int code = http.GET();
  if (code > 0) {
    String payload = http.getString();
    Serial.println("Supabase: " + payload);

    StaticJsonDocument<300> doc;
    deserializeJson(doc, payload);

    remoteControl = doc[0]["remote_control"] | -1;
  }
  http.end();
}
