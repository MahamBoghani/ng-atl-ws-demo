import { messages, stats } from './server';
export class temp {
  static classifyTracker(message: any) {
    let parsedMessage = JSON.parse(message);
    let reply;

    switch (parsedMessage.type) {
      case 'clear_post':
        ++stats.clearCount;
        reply = {type: 'updated_clear_stats', stats: { clearCount: stats.clearCount } };
        break;
      case 'message_post':
        ++stats.postCount;
        messages.push(parsedMessage.data);
        reply = {type: 'message_post', stats: {postCount: stats.postCount}, message: parsedMessage.data };
        break;
      case 'random_avatar':
        ++stats.randomAvatarCount;
        reply = {type: 'updated_avatar_stats', stats: { randomAvatarCount: stats.randomAvatarCount } };
        break;
      case 'post_like':
        ++stats.postLikeCount;
        reply = {type: 'updated_post_like_stats', stats: { postLikeCount: stats.postLikeCount }, likedMessage: {} };
        break;
      case 'donate':
        ++stats.donationCount;
        reply = {type: 'donate_stat', stats: { donateCount: stats.donationCount } };
        break;
      default:
        reply = {type: 'wip'};
    }
    return reply;
  }
}