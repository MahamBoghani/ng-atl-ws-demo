import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import {AddressInfo} from 'ws';
import { temp } from './tracker-helper';

const app = express();

interface message {
  id: number,
  icon: string,
  likes: number,
  name: string,
  post: string,
  date: string
}

export let stats = {
  clearCount: 1,
  postCount: 0,
  randomAvatarCount: 0,
  postLikeCount: 0
};

export let messages: message[] = [];
// initialize a simple http server
const server = http.createServer(app);

// initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws: WebSocket) => {
  ws.send(JSON.stringify({type: 'initial_stats', stats: stats, posts: messages}));
  // connection is up, let's add a simple event
  ws.on('message', (message: string) => {
    let reply = temp.classifyTracker(message);
    console.log(`client count: ${wss.clients.size}`);

    wss.clients
      .forEach(client => {
        client.send(JSON.stringify(reply));
      });
  });
});

// start our server
server.listen(process.env.PORT || 8999, () => {
  const { port } = server.address() as AddressInfo;
  console.log(`Server started on port :)`, port);
});
