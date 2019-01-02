import { SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@WebSocketGateway(2000, { transports: ['websocket'] })
export class ChatGateway {
  @WebSocketServer() server;

  @SubscribeMessage('events')
  findAll(client, data): any {
    console.log('in findAll');
    return from([1, 2, 3]).pipe(map(item => ({ event: 'events', data: item })));
  }
}

// @WebSocketGateway({ namespace: 'chat', transports: ['websocket'] }){
//   @SubscribeMessage('chat')
//   onEvent(client, data: string): string {
//     return data;
//   }
// }
