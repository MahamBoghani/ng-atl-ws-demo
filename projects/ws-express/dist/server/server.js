"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const tracker_helper_1 = require("./tracker-helper");
const app = express();
exports.stats = {
    clearCount: 1,
    postCount: 1,
    randomAvatarCount: 0,
    postLikeCount: 0
};
exports.messages = [];
// initialize a simple http server
const server = http.createServer(app);
// initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });
wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ type: 'initial_stats', stats: exports.stats, posts: exports.messages }));
    // connection is up, let's add a simple event
    ws.on('message', (message) => {
        let reply = tracker_helper_1.temp.classifyTracker(message);
        console.log(`client count: ${wss.clients.size}`);
        wss.clients
            .forEach(client => {
            client.send(JSON.stringify(reply));
        });
    });
});
// start our server
server.listen(process.env.PORT || 8999, () => {
    const { port } = server.address();
    console.log(`Server started on port :)`, port);
});
//# sourceMappingURL=server.js.map