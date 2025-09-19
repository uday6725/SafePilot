# SafePilot – IoT Alcohol & Drowsiness Safety System

SafePilot is an IoT-enabled safety platform that authenticates drivers (RFID/Fingerprint), screens for alcohol and drowsiness, and empowers car owners/admins with real‑time controls, telemetry, and alerting. It integrates edge Python for drowsiness detection with a modern React web app and Appwrite for secure data storage.

## Features

- **Driver Authentication** via RFID or Fingerprint. Ignition is allowed only after successful verification.
- **Alcohol Screening** before and during drive. Critical detection enables owner remote control and raises emergency alerts.
- **Drowsiness Detection (Python)** with camera pipeline; raises warnings/critical alerts.
- **Real-time Telemetry** (heart rate, speed, proximity, location) over WebSockets.
- **Owner Portal** to manage cars, drivers, and assignments; view records/history.
- **Admin Utilities** for users and project management.
- **Emergency Flow** bundles alcohol + heartbeat + driver + car + location to the owner.

## Architecture

### Tech Stack

#### Hardware (Suggested)
- RFID reader (e.g., RC522) or Fingerprint sensor (e.g., R307)
- Alcohol sensor (MQ-3 / MQ-135)
- Heart-rate sensor (MAX30102)
- Ultrasonic proximity (HC-SR04)
- GPS (NEO‑6M), Motor controller/actuators
- Microcontroller: ESP32 or Raspberry Pi (depending on IO needs)

#### Edge Software (Python)
- Python 3.10+
- OpenCV, MediaPipe or dlib (for eye-aspect ratio or blink detection)
- asyncio + socket client (websocket or Socket.IO Python client)
- Requests/HTTP client (fallback)

#### Web Application
- React + Vite + React Router
- Socket.IO client
- Tailwind-style utility classes
- Appwrite Web SDK

#### BaaS / Database
- Appwrite Cloud (Auth, DB, Documents)

## Data Model (Appwrite Collections)

The system manages these data collections:

- `Alerts`: level, title, description, ts
- `Sensors`: heartRate, drowsiness, alcoholLevel, proximity, speed, location_lat/lng, ts
- `Locations`: lat, lng, ts
- `Contacts`
- `Users (App data)` (optional)
- `Cars`: ownerId, alias, plateNumber, vin, make, model, year (int), color
- `DriverProfiles`: ownerId, name, email, phone, licenseNo, notes, violations, lastMedicalCheck
- `Assignments`: ownerId, carId, driverProfileId, active (int 0/1), ts, endedAt
- `DriverRecords`: driverProfileId, type, level, title, description, ts

Permissions are configured for authenticated users with appropriate read/write access.

## Core Flows

1. **Verification → Ignition**: Edge verifies driver (RFID/Fingerprint). Web shows `auth_event` and sets ignition ready.
2. **Pre-drive Alcohol Check**: If alcohol detected, ignition is blocked and alert is sent.
3. **During Trip**: If alcohol suddenly spikes, emergency event is raised, remote control enables, and the car slows down (IoT side).
4. **Owner Controls**: Remote control panel is enabled only on critical events; actions are emitted over WebSockets.

## Drowsiness Detection (Python) – Overview

- Captures camera frames and computes eye-aspect ratio using MediaPipe Face Mesh
- Maintains scoring algorithms with time-window analysis
- Emits `warning` or `critical` alerts when thresholds are crossed
- Sends events and metrics to the web server via WebSocket/HTTP protocols

## Key System Components

- `WebSocketContext` – Real-time events and state management (ignition, remote-control, auth, emergency)
- `DataService` – Appwrite document operations (Cars, Drivers, Assignments, Records, Alerts)
- `Owner Management` – Vehicle and driver administration interface
- `Control Systems` – Remote control UI and emergency response
- `Mock Server` – Development and testing environment
- `Database Setup` – Collection creation with attributes, indexes, and permissions

## Project Aim

SafePilot addresses critical road safety challenges by creating an integrated IoT ecosystem that prevents impaired and drowsy driving through multi-layered verification and real-time monitoring. The system empowers vehicle owners with remote oversight capabilities while maintaining driver privacy and providing immediate emergency response protocols.

## Architecture (Figure)

![System Architecture](./public/architecture.png)

## UML Diagrams

### 1) Component Diagram

```mermaid
flowchart TD
  subgraph Edge[IoT Edge (Vehicle)]
    RFID[RFID / Fingerprint]
    Alcohol[Alcohol Sensor (MQ-3)]
    HR[Heart Rate (MAX30102)]
    Prox[Proximity (HC-SR04)]
    Cam[Camera]
    Python[Python Drowsiness Engine]
    MCU[ESP32 / RPi Controller]

    RFID --> MCU
    Alcohol --> MCU
    HR --> MCU
    Prox --> MCU
    Cam --> Python
    Python --> MCU
  end

  subgraph Backend[Realtime + Data]
    Socket[Socket.IO Server]
    Appwrite[(Appwrite Cloud)]
  end

  subgraph Web[Web Application]
    React[React + Vite]
    Context[WebSocketContext.jsx]
    DataSvc[dataService.js]
    OwnerUI[Owner Garage/Drivers]
    Controls[Remote Controls]
    Dashboard[Dashboards]
  end

  MCU -- sensor_data/auth_event/emergency_event --> Socket
  Socket -- WebSocket --> Context
  Context --> Dashboard
  Context --> Controls
  Context --> OwnerUI
  DataSvc <---> Appwrite
  React --> DataSvc
```

### 2) End-to-End Flow (Sequence)

```mermaid
sequenceDiagram
  participant Owner as Owner (Web)
  participant Web as React App
  participant WS as Socket.IO Server
  participant Edge as MCU/Python (IoT)
  participant DB as Appwrite DB

  Owner->>Web: Add Driver Profile
  Web->>DB: create DriverProfiles(ownerId, name, ...)
  DB-->>Web: 201 Created

  Owner->>Web: Add Car
  Web->>DB: create Cars(ownerId, plate, vin, year:int, ...)
  DB-->>Web: 201 Created

  Owner->>Web: Assign Driver -> Car
  Web->>DB: create Assignments(ownerId, carId, driverProfileId, active:1, ts)
  DB-->>Web: 201 Created

  Edge->>WS: auth_event{ verified, method, driver, car, ts }
  WS-->>Web: auth_event
  Web->>Web: ignition.ready = verified

  Edge->>WS: sensor_data{ heartRate, alcoholLevel, drowsiness, ... }
  WS-->>Web: sensor_data
  Web->>DB: (optional) add DriverRecords if thresholds crossed

  alt Alcohol >= 60 or Drowsiness Critical
    Edge->>WS: emergency_event{ alcoholLevel, heartRate, driver, car, location, ts }
    WS-->>Web: emergency_event (also new_alert)
    Web->>Web: remoteControl.enabled = true
    Owner->>Web: Send remote commands (park/lock/hazard)
    Web->>WS: control_command{ command, speed? }
    WS-->>Edge: control_command
  end
```

### 3) Data Model (Class Diagram)

```mermaid
classDiagram
  class Cars {
    string $id
    string ownerId
    string alias
    string plateNumber
    string vin
    string make
    string model
    int    year
    string color
    datetime createdAt
  }

  class DriverProfiles {
    string $id
    string ownerId
    string name
    string email
    string phone
    string licenseNo
    string backgroundNotes
    int    violations
    datetime lastMedicalCheck
    datetime createdAt
  }

  class Assignments {
    string $id
    string ownerId
    string carId
    string driverProfileId
    int    active  // 0 or 1
    datetime ts
    datetime endedAt
  }

  class DriverRecords {
    string $id
    string driverProfileId
    string type
    string level
    string title
    string description
    datetime ts
  }

  Cars "1" <-- "0..*" Assignments
  DriverProfiles "1" <-- "0..*" Assignments
  DriverProfiles "1" <-- "0..*" DriverRecords
```

### 4) Runtime States (State Machine)

```mermaid
stateDiagram-v2
  [*] --> AwaitVerification
  AwaitVerification --> IgnitionReady: auth_event{ verified: true }
  AwaitVerification --> IgnitionBlocked: auth_event{ verified: false }

  IgnitionReady --> Normal
  IgnitionBlocked --> [*]

  Normal --> Warning: alcohol>0 || drowsiness>60
  Warning --> Critical: alcohol>=60 || drowsiness>=80
  Critical --> RemoteControlEnabled: emergency_event
  RemoteControlEnabled --> Normal: conditions_normal