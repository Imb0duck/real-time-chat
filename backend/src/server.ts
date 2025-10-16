import express from 'express';
import type { Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { Channel, User } from './types/chat.ts';
import type { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from './types/event.ts';
import { Events, Routes } from './consts.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load mock users
const usersPath = join(__dirname, "users.json");
if (!fs.existsSync(usersPath)) {
  throw new Error(`users.json not found at ${usersPath}`);
}
const users: User[] = JSON.parse(fs.readFileSync(usersPath, "utf-8"));

// In-memory data structures
const channels: Record<string, Channel> = {};
const userToSocket = new Map<number, string>();

const app = express();
app.use(express.json());
app.use(cors());

// Get short user info by ID
const getUserShort = (id: number) => {
  const u = users.find((usr) => usr.id === id);
  return u
    ? { id: u.id, name: u.name, username: u.username, avatar: u.avatar }
    : null;
};

// Map participant IDs to UserShortInfo[]
const mapParticipants = (ids: Iterable<number>) =>
  Array.from(ids)
    .map(getUserShort)
    .filter((u): u is NonNullable<typeof u> => !!u);

// REST API
// GET /api/users?q=
app.get(Routes.Users, (req: Request, res: Response) => {
  const qParam = req.query.q;
  const q = typeof qParam === "string" ? qParam.toLowerCase() : "";
  const filtered = q
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q)
      )
    : users;
  const result = filtered.map(({ id, username, name, avatar }) => ({
    id,
    username,
    name,
    avatar
  }));
  res.json(result);
});

// GET /api/users/:id
app.get(`${Routes.Users}/:id`, (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = users.find((u) => u.id === id);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

// GET /api/channels?userId=
app.get(Routes.Channels, (req, res) => {
  const userId = Number(req.query.userId);
  const list = Object.values(channels)
    .filter((ch) => !userId || ch.participants.has(userId))
    .map(({ id, name, participants }) => ({
      id,
      name,
      participants: mapParticipants(participants)
    }));
  res.json(list);
});

// GET /api/channels/:id
app.get(`${Routes.Channels}/:id`, (req, res) => {
  const ch = channels[req.params.id];
  if (!ch) return res.status(404).json({ error: "Not found" });
  res.json({
    id: ch.id,
    name: ch.name,
    creatorId: ch.creatorId,
    participants: mapParticipants(ch.participants),
    messages: ch.messages
  });
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
      creatorId,
      participants: new Set([creatorId]),
      messages: []
    };

    socket.join(id);

    // Notify all clients with channel list
    io.emit(Events.Update, Object.values(channels).map((ch) => ({
        id: ch.id,
        name: ch.name,
        participants: mapParticipants(ch.participants)
      }))
    );
  });


  // Join existing channel
  socket.on(Events.Join, ({ channelId, userId }) => {
    const ch = channels[channelId];
    if (!ch) {
      socket.emit(Events.Error, "Channel not found");
      return;
    }

    ch.participants.add(userId);
    socket.join(channelId);

    // Notify members inside channel
    io.to(channelId).emit(Events.Participants, mapParticipants(ch.participants));

    // Notify all clients with global channel update
    io.emit(Events.Update, Object.values(channels).map(({ id, name, participants }) => ({
        id,
        name,
        participants: mapParticipants(participants)
      }))
    );
  });


  // Leave channel
  socket.on(Events.Leave, ({ channelId, userId }) => {
    const ch = channels[channelId];
    if (!ch) return;

    ch.participants.delete(userId);
    socket.leave(channelId);

    io.to(channelId).emit(Events.Participants, mapParticipants(ch.participants));

    io.emit(Events.Update, Object.values(channels).map(({ id, name, participants }) => ({
        id,
        name,
        participants: mapParticipants(participants)
      }))
    );
  });


  // Delete channel (only creator)
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

    // Notify participants before removal
    io.to(channelId).emit(Events.Deleted, channelId);

    // Force all connected sockets to leave the room
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
        participants: mapParticipants(ch.participants)
      }))
    );
  });


  // Handle chat message
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


  // Kick user from channel
  socket.on(Events.Kick, ({ channelId, targetId, requesterId }) => {
    const ch = channels[channelId];
    if (!ch) return;

    if (ch.creatorId !== requesterId) {
      socket.emit(Events.Error, "No permission");
      return;
    }

    ch.participants.delete(targetId);
    io.to(channelId).emit(Events.Participants, mapParticipants(ch.participants));

    // Notify kicked user
    const targetSocketId = userToSocket.get(targetId);
    if (targetSocketId) {
      io.to(targetSocketId).emit(Events.Kicked, channelId);
    }

    io.emit(Events.Update, Object.values(channels).map(({ id, name, participants }) => ({
        id,
        name,
        participants: mapParticipants(participants)
      }))
    );
  });


  // Identify user (socket <-> user binding)
  socket.on(Events.Identify, (userId) => {
    socket.data.userId = userId;
    userToSocket.set(userId, socket.id);
  });


  // Handle disconnect
  socket.on(Events.Disconnect, () => {
    const userId = socket.data.userId;
    if (!userId) return;

  // Remove user from all channels
    for (const ch of Object.values(channels)) {
      if (ch.participants.has(userId)) {
        ch.participants.delete(userId);
        io.to(ch.id).emit(Events.Participants, mapParticipants(ch.participants));
      }
    }

    userToSocket.delete(userId);
    console.log("Socket disconnected:", socket.id);
  });
});

// Start HTTP + Socket server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
