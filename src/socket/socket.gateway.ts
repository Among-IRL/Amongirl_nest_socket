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
import { GameModel, Players, RolePlayer } from './models/game.model';

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
  handleInitGame(@MessageBody() data: any) {
    this.logger.log('Init Game');
    this.server.emit('initGame', this.game);
  }

  handleVictory(role: RolePlayer) {
    this.logger.log('win', role);
    this.server.emit('win', role);
  }
  @SubscribeMessage('selectPlayer')
  handleSelectPlayer(@MessageBody() data: { name: string }) {
    this.logger.log('selectPlayer', data.name);
    this.server.emit('selectPlayer', this.gameService.selectPlayer(data.name));
  }

  @SubscribeMessage('startGame')
  handleStartGame(@MessageBody() data: any) {
    this.logger.log('startGame');
    this.gameService.startGame();
    this.server.emit('startGame', this.game);
  }

  @SubscribeMessage('deathPlayer')
  handleDeathPlayer(@MessageBody() data: { mac: string }) {
    this.logger.log('deathPlayer', data);
    this.server.emit('deathPlayer', this.gameService.deathPlayer(data.mac));
  }

  @SubscribeMessage('task')
  handleTask(@MessageBody() data: { mac: string; status: boolean }) {
    this.logger.log('task', data);
    const task = this.gameService.accomplishedTask(data.mac, data.status);
    this.handleRefresh(this.gameService.getGame());
    this.server.emit('task', task);
  }

  @SubscribeMessage('refresh')
  handleRefresh(game) {
    this.logger.log('refresh');
    this.server.emit('refresh', game);
  }

  @SubscribeMessage('buzzer')
  handleBuzzer(@MessageBody() data: { mac: string; status: boolean }) {
    const buzzer = this.gameService.buzzer(data.mac);
    this.handleRefresh(this.gameService.getGame());
    this.logger.log('buzzer');
    this.countDownMeeting(buzzer.status);
    this.server.emit('buzzer', buzzer);
  }

  countDownMeeting(status: boolean): {
    status: boolean;
    countDown: number;
    vote: string;
  } {
    let counter = 15;
    if (status) {
      const functionCounter = setInterval(() => {
        this.handleMeeting(counter, status, '', 0);
        counter--;
        if (counter === 0) {
          const mostPlayerVote = this.gameService.mostPlayerVote(
            this.game.vote,
          ).mostPlayerVote;
          const count = this.gameService.mostPlayerVote(this.game.vote).count;
          this.handleMeeting(counter, false, mostPlayerVote, count);
          const index = this.gameService.getIndexPlayer(mostPlayerVote);
          this.game.players[index].isAlive = false;
          this.gameService.resetBuzzer();
          this.gameService.resetReport();
          this.gameService.resetVote();
          clearInterval(functionCounter);
        }
      }, 1000);
    } else {
      return {
        status: false,
        countDown: 0,
        vote: '',
      };
    }
  }

  @SubscribeMessage('meeting')
  handleMeeting(counter: number, status: boolean, vote: string, count: number) {
    this.logger.log('meeting, { countDown: counter, status }');
    this.server.emit('meeting', {
      countDown: counter,
      status,
      vote: vote,
      count: count,
    });
  }

  @SubscribeMessage('report')
  handleReport(@MessageBody() data: { name: string }) {
    this.logger.log('data name = ', data.name);
    const report = this.gameService.report(data.name);
    this.countDownMeeting(true);
    this.server.emit('report', report);
  }

  @SubscribeMessage('sabotage')
  handleSabotage(@MessageBody() data: { isSabotage: boolean }) {
    this.logger.log('sabotage');
    this.server.emit('sabotage', data.isSabotage);
  }

  @SubscribeMessage('vote')
  handleVote(@MessageBody() data: { macFrom: string; macTo: string }) {
    const playerFrom: Players = this.gameService.getPlayerByMac(data.macFrom);
    const playerTo: Players = this.gameService.getPlayerByMac(data.macTo);
    this.logger.log(playerFrom.name + ' vote for ' + playerTo.name);
    this.game.vote.push(playerTo.name);
  }

  @SubscribeMessage('resetGame')
  handleResetGame(@MessageBody() data: any) {
    this.logger.log('resetGame ');
    const resetGame = this.gameService.resetGame();
    this.server.emit('resetGame', resetGame);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }
}
