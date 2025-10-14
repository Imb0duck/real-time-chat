import express from 'express';
import type { Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { Channel, User } from './types/chat.ts';
import type { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from './types/event.ts';
import { Events, Routes } from './consts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load mock users
const users: User[] = JSON.parse(
  readFileSync(join(__dirname, "users.json"), "utf-8")
);

const channels: Record<string, Channel> = {}; // In-memory channels
const userToSocket = new Map<number, string>(); //In-memory connections

const app = express();
app.use(express.json());

//API routes
app.get(Routes.Users, (req: Request, res: Response) => {
  const qParam = req.query.q;
  const q = (typeof qParam === "string") ? qParam.toLowerCase() : '';
  const filtered = q ? users.filter((u) => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)) : users;
  res.json(filtered);
});

app.get(`${Routes.Users}/:id`, (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = users.find(u => u.id === id);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

app.get(Routes.Channels, (req, res) => {
  const userId = Number(req.query.userId);
  const list = Object.values(channels).filter((ch) => !userId || ch.participants.has(userId)).map(({ id, name, participants }) => ({
      id,
      name,
      participants: Array.from(participants),
    }));
  res.json(list);
});

app.get(`${Routes.Channels}/:id`, (req, res) => {
  const ch = channels[req.params.id];
  if (!ch) return res.status(404).json({ error: "Not found" });
  res.json({ id: ch.id, name: ch.name, creatorId: ch.creatorId, participants: Array.from(ch.participants), messages: ch.messages });
});

// HTTP + Socket.IO
const server = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
  server,
  { cors: { origin: "*" } }
);

io.on(Events.Connect, (socket) => {
  console.log("New socket connected:", socket.id);

  // Create channel
  socket.on(Events.Create, ({ name, creatorId }) => {
    const id = `chan_${Date.now()}`;
    channels[id] = {
      id,
      name,
      creatorId: creatorId,
      participants: new Set([creatorId]),
      messages: [],
    };
    
    socket.join(id);
    io.emit(Events.Update, Object.values(channels).map((ch) => ({
        id: ch.id,
        name: ch.name,
        participants: Array.from(ch.participants),
      }))
    );
  });

  // Join channel
  socket.on(Events.Join, ({ channelId, userId }) => {
    const ch = channels[channelId];
    if (!ch) {
      socket.emit(Events.Error, "Channel not found");
      return;
    }

    ch.participants.add(userId);
    socket.join(channelId);

    io.to(channelId).emit(Events.Participants, Array.from(ch.participants));
    io.emit(Events.Update, Object.values(channels).map(({ id, name, participants }) => ({
      id,
      name,
      participants: Array.from(participants),
    })));
  });

  // Leave channel
  socket.on(Events.Leave, ({ channelId, userId }) => {
    const ch = channels[channelId];
    if (!ch) return;

    ch.participants.delete(userId);
    socket.leave(channelId);
    io.to(channelId).emit(Events.Participants, Array.from(ch.participants));

    io.emit(Events.Update, Object.values(channels).map(({ id, name, participants }) => ({
      id,
      name,
      participants: Array.from(participants),
    })));
  });

  // Delete channel
  socket.on(Events.Delete, ({ channelId, userId }) => {
    const ch = channels[channelId];
    if (!ch) {
      socket.emit(Events.Error, "Channel not found");
      return;
    }

    if (ch.creatorId !== userId) {
      socket.emit(Events.Error, "No permission");
      return;
    }

    io.to(channelId).emit(Events.Deleted, channelId);
    const room = io.sockets.adapter.rooms.get(channelId);
    if (room) {
      for (const socketId of room) {
        const s = io.sockets.sockets.get(socketId);
        if (s) s.leave(channelId);
      }
    }

    delete channels[channelId];
    io.emit(Events.Update, Object.values(channels).map((ch) => ({
      id: ch.id,
      name: ch.name,
      participants: Array.from(ch.participants),
    })));
  });

  // Send message
  socket.on(Events.Message, ({ channelId, message }) => {
    const ch = channels[channelId];
    if (!ch) return;

    const serverMessage = {
      ...message,
      timestamp: Date.now()
    };

    ch.messages.push(serverMessage);
    io.to(channelId).emit(Events.Message, serverMessage);
  });

  // Kick user
  socket.on(Events.Kick, ({ channelId, targetId, requesterId }) => {
    const ch = channels[channelId];
    if (!ch) return;
    if (ch.creatorId !== requesterId) {
      socket.emit(Events.Error, "No permission");
      return;
    }

    ch.participants.delete(targetId);
    io.to(channelId).emit(Events.Participants, Array.from(ch.participants));

    // notify kicked user
    const targetSocketId = userToSocket.get(targetId);
    if (targetSocketId) {
      io.to(targetSocketId).emit(Events.Kicked, channelId);
    }
  });

  socket.on(Events.Identify, (userId) => {
    socket.data.userId = userId;
    userToSocket.set(userId, socket.id);
  });

  socket.on(Events.Disconnect, () => {
    const userId = socket.data.userId;
    if (!userId) return;

    for (const ch of Object.values(channels)) {
      if (ch.participants.has(userId)) {
        ch.participants.delete(userId);
        io.to(ch.id).emit(Events.Participants, Array.from(ch.participants));
      }
    }

    userToSocket.delete(userId);
    console.log("Socket disconnected:", socket.id);
  });
});

// Start server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
