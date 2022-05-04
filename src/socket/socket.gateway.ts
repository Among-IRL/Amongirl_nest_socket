import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { GameService } from './services/game.service';
import { GameModel } from './models/game.model';

@WebSocketGateway()
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private game: GameModel;
  constructor(private readonly gameService: GameService) {
    this.gameService.observableGame.subscribe((game) => {
      this.game = game;
    });
  }

  @WebSocketServer()
  server: Server;
  private logger: Logger = new Logger('AppGateway');

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  @SubscribeMessage('initGame')
  handleInitGame(@MessageBody() data: any): GameModel {
    return this.game;
  }

  @SubscribeMessage('selectPlayer')
  handleSelectPlayer(@MessageBody() data: { name: string }): GameModel {
    return this.gameService.selectPlayer(data.name);
  }

  @SubscribeMessage('startGame')
  handleStartGame(@MessageBody() data: any): GameModel {
    this.gameService.startGame();
    return this.game;
  }

  @SubscribeMessage('deathPlayer')
  handleDeathPlayer(@MessageBody() data: { name: string }): {
    name: string;
    mac: string;
  } {
    return this.gameService.deathPlayer(data.name);
  }

  @SubscribeMessage('task')
  handleTask(@MessageBody() data: { name: string; status: boolean }): {
    name: string;
    mac: string;
    task: boolean;
  } {
    const task = this.gameService.accomplishedTask(data.name, data.status);
    this.handleRefresh(this.gameService.getGame());
    return task;
  }

  @SubscribeMessage('refresh')
  handleRefresh(game): GameModel {
    return game;
  }

  @SubscribeMessage('buzzer')
  handleBuzzer(@MessageBody() data: { mac: string; status: boolean }): {
    mac: string;
    status: boolean;
  } {
    const buzzer = this.gameService.buzzer(data.mac, data.status);
    this.handleRefresh(this.gameService.getGame());
    this.countDownMeeting(data.status);
    return buzzer;
  }

  countDownMeeting(status: boolean): { status: boolean; countDown: number } {
    let counter = 60;
    if (status) {
      const functionCounter = setInterval(() => {
        this.handleMeeting(counter, status);
        counter--;
        if (counter === 0) {
          this.handleMeeting(counter, false);
          this.gameService.resetReport();
          clearInterval(functionCounter);
        }
      }, 1000);
    } else {
      return { status: false, countDown: 0 };
    }
  }

  @SubscribeMessage('meeting')
  handleMeeting(
    counter: number,
    status: boolean,
  ): { status: boolean; countDown: number } {
    return { countDown: counter, status };
  }

  @SubscribeMessage('report')
  handleReport(@MessageBody() data: { name: string }) {
    const report = this.gameService.report(data.name);
    this.countDownMeeting(true);
    return report;
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }
}
