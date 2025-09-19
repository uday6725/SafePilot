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

  const interval = setInterval(() => {
    const heartRate = Math.floor(60 + Math.random() * 60);
    const drowsiness = Math.floor(Math.random() * 100);
    const alcoholLevel = Math.random() < 0.15 ? Math.floor(40 + Math.random() * 40) : Math.floor(Math.random() * 30);
    const proximity = Math.floor(10 + Math.random() * 90);
    const speed = Math.floor(Math.random() * 30);

    socket.emit('sensor_data', {
      heartRate,
      drowsiness,
      alcoholLevel,
      proximity,
      speed,
      location: { lat: 19.076 + Math.random() * 0.01, lng: 72.8777 + Math.random() * 0.01 },
    });

    if (alcoholLevel >= 60) {
      io.emit('new_alert', { level: 'critical', title: 'High Alcohol Level', description: `Detected alcohol ${alcoholLevel}%` });
    } else if (alcoholLevel > 0 && Math.random() < 0.3) {
      io.emit('new_alert', { level: 'warning', title: 'Alcohol Detected', description: `Detected alcohol ${alcoholLevel}%` });
    } else if (drowsiness > 80 && Math.random() < 0.5) {
      io.emit('new_alert', { level: 'warning', title: 'Drowsiness Detected', description: `Drowsiness score ${drowsiness}%` });
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
