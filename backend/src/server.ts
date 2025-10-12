import express from 'express';
import type { Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { Channel, Message, User } from './types/chat.ts';
import type { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from './types/event.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const users: User[] = JSON.parse(
  readFileSync(join(__dirname, "users.json"), "utf-8")
);

const channels: Record<string, Channel> = {};

const app = express();
app.use(express.json());

// --- REST API
app.get("/api/users", (req: Request, res: Response) => {
  const q = (req.query.q as string | undefined)?.toLowerCase() ?? "";
  const filtered = q
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q)
      )
    : users;
  res.json(filtered);
});

app.get("/api/channels", (_req: Request, res: Response) => {
  res.json(
    Object.values(channels).map(({ id, name, creatorId }) => ({
      id,
      name,
      creatorId,
    }))
  );
});

const server = http.createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
  server,
  { cors: { origin: "*" } }
);

io.on("connection", (socket) => {
  console.log("New socket connected:", socket.id);

  socket.on("create-channel", ({ name, creator }) => {
    const id = `chan_${Date.now()}`;
    channels[id] = {
      id,
      name,
      creatorId: creator.id,
      participants: new Set([creator.id]),
      messages: [],
    };

    io.emit(
      "channels-updated",
      Object.values(channels).map((c) => ({
        id: c.id,
        name: c.name,
        creatorId: c.creatorId,
      }))
    );
  });

  socket.on("join-channel", ({ channelId, user }) => {
    const ch = channels[channelId];
    if (!ch) {
      socket.emit("error", "Channel not found");
      return;
    }

    ch.participants.add(user.id);
    socket.join(channelId);

    io.to(channelId).emit("participants-updated", Array.from(ch.participants));
    socket.emit("channel-history", ch.messages);
  });

  socket.on("leave-channel", ({ channelId, userId }) => {
    const ch = channels[channelId];
    if (!ch) return;

    ch.participants.delete(userId);
    socket.leave(channelId);
    io.to(channelId).emit("participants-updated", Array.from(ch.participants));
  });

  socket.on("message", ({ channelId, message }) => {
    const ch = channels[channelId];
    if (!ch) return;

    ch.messages.push(message);
    io.to(channelId).emit("message", message);
  });

  socket.on("kick-user", ({ channelId, targetId, requesterId }) => {
    const ch = channels[channelId];
    if (!ch) return;

    if (ch.creatorId !== requesterId) {
      socket.emit("error", "No permission");
      return;
    }

    ch.participants.delete(targetId);
    io.to(channelId).emit("participants-updated", Array.from(ch.participants));

    // notify kicked user
    for (const [_, s] of io.sockets.sockets) {
      if (s.data.userId === targetId) {
        s.emit("kicked", { channelId });
      }
    }
  });

  socket.on("identify", (userId) => {
    socket.data.userId = userId;
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
