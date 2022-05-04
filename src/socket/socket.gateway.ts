import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { GameService } from './services/game.service';
import { GameModel, RolePlayer } from './models/game.model';

@WebSocketGateway()
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private game: GameModel;
  constructor(private readonly gameService: GameService) {
    this.gameService.observableGame.subscribe((game) => {
      this.game = game;
      if (this.gameService.winSaboteur() && game.start) {
        this.gameService.resetGame();
        this.handleVictory(RolePlayer.SABOTEUR);
      } else if (this.gameService.winPlayers() && game.start) {
        this.gameService.resetGame();
        this.handleVictory(RolePlayer.PLAYER);
      }
    });
  }

  @WebSocketServer()
  server: Server;
  private logger: Logger = new Logger('AppGateway');

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  @SubscribeMessage('initGame')
  handleInitGame(@MessageBody() data: any): WsResponse<GameModel> {
    console.log('Init Game');
    return { event: 'initGame', data: this.game };
  }

  handleVictory(role: RolePlayer) {
    this.server.emit('win', role);
  }
  @SubscribeMessage('selectPlayer')
  handleSelectPlayer(
    @MessageBody() data: { name: string },
  ): WsResponse<GameModel> {
    console.log('selectPlayer', data.name);
    return {
      event: 'selectPlayer',
      data: this.gameService.selectPlayer(data.name),
    };
  }

  @SubscribeMessage('startGame')
  handleStartGame(@MessageBody() data: any): WsResponse<GameModel> {
    console.log('startGame');
    this.gameService.startGame();
    return { event: 'startGame', data: this.game };
  }

  @SubscribeMessage('deathPlayer')
  handleDeathPlayer(@MessageBody() data: { mac: string }): WsResponse<{
    name: string;
    mac: string;
    isAlive: boolean;
  }> {
    console.log('deathPlayer', data);
    return {
      event: 'deathPlayer',
      data: this.gameService.deathPlayer(data.mac),
    };
  }

  @SubscribeMessage('task')
  handleTask(
    @MessageBody() data: { mac: string; status: boolean },
  ): WsResponse<{
    name: string;
    mac: string;
    task: boolean;
  }> {
    console.log('task', data);
    const task = this.gameService.accomplishedTask(data.mac, data.status);
    this.handleRefresh(this.gameService.getGame());
    return { event: 'task', data: task };
  }

  @SubscribeMessage('refresh')
  handleRefresh(game): WsResponse<GameModel> {
    console.log('refresh');
    return { event: 'refresh', data: game };
  }

  @SubscribeMessage('buzzer')
  handleBuzzer(
    @MessageBody() data: { mac: string; status: boolean },
  ): WsResponse<{
    mac: string;
    status: boolean;
  }> {
    const buzzer = this.gameService.buzzer(data.mac);
    this.handleRefresh(this.gameService.getGame());
    console.log('buzzer');
    this.countDownMeeting(buzzer.status);
    return { event: 'buzzer', data: buzzer };
  }

  countDownMeeting(status: boolean): { status: boolean; countDown: number } {
    let counter = 10;
    if (status) {
      const functionCounter = setInterval(() => {
        this.handleMeeting(counter, status);
        counter--;
        if (counter === 0) {
          this.handleMeeting(counter, false);
          this.gameService.resetBuzzer();
          this.gameService.resetReport();
          clearInterval(functionCounter);
        }
      }, 1000);
    } else {
      return { status: false, countDown: 0 };
    }
  }

  @SubscribeMessage('meeting')
  handleMeeting(counter: number, status: boolean) {
    console.log('meeting', { countDown: counter, status });
    this.server.emit('meeting', { countDown: counter, status });
  }

  @SubscribeMessage('report')
  handleReport(@MessageBody() data: { name: string }): WsResponse<GameModel> {
    console.log('data name = ', data.name);
    const report = this.gameService.report(data.name);
    this.countDownMeeting(true);
    return { event: 'report', data: report };
  }

  @SubscribeMessage('resetGame')
  handleResetGame(@MessageBody() data: any): WsResponse<GameModel> {
    console.log('resetGame');
    const resetGame = this.gameService.resetGame();
    return { event: 'resetGame', data: resetGame };
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }
}
