// Simple Socket.IO mock server for local testing
import http from 'http';
import { Server } from 'socket.io';

const port = process.env.PORT || 3001;
const server = http.createServer();
const io = new Server(server, {
  cors: { origin: '*'}
});

io.on('connection', (socket) => {
  console.log('client connected', socket.id);

  // simple mock entities for demo
  const driver = { id: 'drv_001', name: 'Demo Driver', email: 'driver@example.com' };
  const car = { id: 'car_001', plate: 'MH-01-AB-1234', vin: 'VINDEMO123456789' };

  // Simulate driver verification via RFID/Fingerprint on connect
  setTimeout(() => {
    const verified = Math.random() < 0.85; // mostly verified
    const method = Math.random() < 0.5 ? 'rfid' : 'fingerprint';
    const ts = new Date().toISOString();
    io.emit('auth_event', { verified, method, driver, car, ts });
    io.emit('ignition_status', { ready: verified, reason: verified ? 'verified' : 'verification_failed' });
  }, 1000);

  let last = { heartRate: 80, alcoholLevel: 0, drowsiness: 10, proximity: 30, speed: 0, location: {lat: 19.076, lng: 72.8777} };
  let remoteEnabled = false;

  const interval = setInterval(() => {
    const heartRate = Math.floor(60 + Math.random() * 60);
    const drowsiness = Math.floor(Math.random() * 100);
    const alcoholSpike = Math.random() < 0.18;
    const alcoholLevel = alcoholSpike ? Math.floor(60 + Math.random() * 40) : Math.floor(Math.random() * 30);
    const proximity = Math.floor(10 + Math.random() * 90);
    const speed = Math.floor(Math.random() * 30);
    const location = { lat: 19.076 + Math.random() * 0.01, lng: 72.8777 + Math.random() * 0.01 };

    last = { heartRate, drowsiness, alcoholLevel, proximity, speed, location };

    socket.emit('sensor_data', { ...last });

    if (alcoholLevel >= 60) {
      io.emit('new_alert', { level: 'critical', title: 'High Alcohol Level', description: `Detected alcohol ${alcoholLevel}%` });
      if (!remoteEnabled) {
        remoteEnabled = true;
        io.emit('remote_control', { enabled: true, reason: 'alcohol_detected' });
      }
      // Emergency bundle for owner
      io.emit('emergency_event', { alcoholLevel, heartRate, driver, car, location, ts: new Date().toISOString(), note: 'Alcohol detected while driving. Auto-slow and stop engaged.' });
    } else if (alcoholLevel > 0 && Math.random() < 0.3) {
      io.emit('new_alert', { level: 'warning', title: 'Alcohol Detected', description: `Detected alcohol ${alcoholLevel}%` });
    } else if (drowsiness > 80 && Math.random() < 0.5) {
      io.emit('new_alert', { level: 'warning', title: 'Drowsiness Detected', description: `Drowsiness score ${drowsiness}%` });
    } else {
      // if conditions normal for a while, disable remote control
      if (remoteEnabled && Math.random() < 0.2) {
        remoteEnabled = false;
        io.emit('remote_control', { enabled: false, reason: 'conditions_normal' });
      }
    }
  }, 2000);

  socket.on('control_command', (payload) => {
    console.log('control_command', payload);
  });

  socket.on('disconnect', () => {
    clearInterval(interval);
    console.log('client disconnected', socket.id);
  });
});

server.listen(port, () => {
  console.log(`Mock Socket.IO server listening on http://localhost:${port}`);
});
