// Production Socket.IO server for SafePilot IoT system
import http from 'http';
import { Server } from 'socket.io';

const port = process.env.PORT || 3001;
const server = http.createServer();
const io = new Server(server, {
  cors: { origin: '*'}
});

io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  // Handle authentication events from IoT devices
  socket.on('auth_event', (data) => {
    console.log('🔐 Auth event received:', data);
    io.emit('auth_event', data);
  });

  // Handle ignition status from IoT devices
  socket.on('ignition_status', (data) => {
    console.log('🔑 Ignition status:', data);
    io.emit('ignition_status', data);
  });

  // Handle sensor data from IoT devices
  socket.on('sensor_data', (data) => {
    console.log('📊 Sensor data:', data);
    socket.emit('sensor_data', data);
  });

  // Handle alerts from IoT devices
  socket.on('new_alert', (data) => {
    console.log('⚠️ New alert:', data);
    io.emit('new_alert', data);
  });

  // Handle remote control status
  socket.on('remote_control', (data) => {
    console.log('🎮 Remote control status:', data);
    io.emit('remote_control', data);
  });

  // Handle emergency events
  socket.on('emergency_event', (data) => {
    console.log('🚨 Emergency event:', data);
    io.emit('emergency_event', data);
  });

  // Handle control commands from web clients
  socket.on('control_command', (payload) => {
    console.log('🎛️ Control command:', payload);
    // Broadcast to IoT devices
    socket.broadcast.emit('control_command', payload);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

server.listen(port, () => {
  console.log(`🚀 SafePilot Socket.IO server running on http://localhost:${port}`);
  console.log('📡 Ready to receive real-time IoT data');
});
