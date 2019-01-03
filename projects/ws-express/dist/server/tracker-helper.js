"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
class temp {
    static classifyTracker(message) {
        let parsedMessage = JSON.parse(message);
        let reply;
        switch (parsedMessage.type) {
            case 'clear_post':
                ++server_1.stats.clearCount;
                reply = { type: 'updated_clear_stats', stats: { clearCount: server_1.stats.clearCount } };
                break;
            case 'message_post':
                ++server_1.stats.postCount;
                server_1.messages.push(parsedMessage.data);
                reply = { type: 'message_post', stats: { postCount: server_1.stats.postCount }, message: parsedMessage.data };
                break;
            case 'random_avatar':
                ++server_1.stats.randomAvatarCount;
                reply = { type: 'updated_avatar_stats', stats: { randomAvatarCount: server_1.stats.randomAvatarCount } };
                break;
            case 'post_like':
                ++server_1.stats.postLikeCount;
                console.log('post like: ', server_1.messages);
                // let messIndex = messages.findIndex(mess => mess.id === message.id);
                // messages[messIndex].likes++;
                reply = { type: 'updated_post_like_stats', stats: { postLikeCount: server_1.stats.postLikeCount }, likedMessage: {} };
                break;
            default:
                reply = { type: 'wip' };
        }
        return reply;
    }
}
exports.temp = temp;
//# sourceMappingURL=tracker-helper.js.map