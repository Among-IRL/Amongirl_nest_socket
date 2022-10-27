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
import { SimonService } from './services/simon.service';
import { DesabotageService } from './services/desabotage.service';

@WebSocketGateway()
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private game: GameModel;
  constructor(
    private readonly desabotageService: DesabotageService,
    private readonly gameService: GameService,
    private readonly simonService: SimonService,
  ) {
    setTimeout(() => {
      this.handleEnableDesabotage();
    }, 10000);
    this.simonService.observableLed.subscribe((led: string) => {
      if (led) {
        this.handleTaskLedSimon(led);
      }
    });
    this.simonService.observableTaskCompleted.subscribe(
      (isCompleted: boolean) => {
        if (isCompleted) {
          this.handleTaskCompletedSimon();
        }
      },
    );
    this.desabotageService.observableStatus.subscribe((status: string) => {
      if (this.server) {
        switch (status) {
          case 'red':
            this.handleEnableDesabotage();
            break;
          case 'yellow':
            this.handleDesabotageEngaged();
            break;
          case 'green':
            this.handleTaskCompletedDesabotage();
            break;
        }
      }
    });
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

  handleDisableDesabotage() {
    this.logger.log('disableDesabotage');
    this.server.emit('disableDesabotage');
  }

  handleTaskCompletedDesabotage() {
    this.logger.log('taskCompletedDesabotage');
    this.server.emit('taskCompletedDesabotage');
  }

  handleDesabotageEngaged() {
    this.logger.log('taskDesabotageEngaged');
    this.server.emit('taskDesabotageEngaged');
  }

  handleEnableDesabotage() {
    this.logger.log('enableDesabotage');
    this.server.emit('enableDesabotage');
  }

  @SubscribeMessage('taskDesabotage1')
  handleDesabotage1(@MessageBody() data: { isPressed: boolean }) {
    this.logger.log('desabotage1', data);
    this.desabotageService.onPressedDesabotage1(data.isPressed);
  }

  @SubscribeMessage('taskDesabotage2')
  handleDesabotage2(@MessageBody() data: { isPressed: boolean }) {
    this.logger.log('desabotage2', data);
    this.desabotageService.onPressedDesabotage2(data.isPressed);
  }

  handleTaskSimonEnable() {
    this.logger.log('enableTaskSimon');
    this.server.emit('enableTaskSimon');
    setTimeout(() => {
      this.simonService.startSimon();
    }, 2000);
  }

  handleDisableTaskSimon() {
    this.logger.log('disableTaskSimon');
    this.server.emit('disableTaskSimon');
  }

  handleTaskCompletedSimon() {
    this.logger.log('taskCompletedSimon');
    this.server.emit('taskCompletedSimon');
  }

  handleTaskLedSimon(led: string) {
    this.logger.log('taskLedSimon', { led: led });
    this.server.emit('taskLedSimon', { led: led });
  }

  @SubscribeMessage('taskSimon')
  handleChoiceHumanSimon(@MessageBody() data: { led: string }) {
    this.logger.log('taskSimon', data);
    if (data) {
      this.simonService.choiceHuman(data.led);
    }
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

  @SubscribeMessage('refresh')
  handleRefresh(game) {
    this.logger.log('refresh');
    this.server.emit('refresh', game);
  }

  @SubscribeMessage('buzzer')
  handleBuzzer(@MessageBody() data: { status: boolean }) {
    const buzzer = this.gameService.buzzer();
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
          if (mostPlayerVote !== '') {
            const index = this.gameService.getIndexPlayer(mostPlayerVote);
            const player = this.game.players[index];
            this.handleDeathPlayer({ mac: player.mac });
          }
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

  countDownTasks(status: boolean) {
    let counter = 15;
    if (status) {
      const functionCounter = setInterval(() => {
        this.handleCountDownTask(counter, status);
        counter--;
        if (counter === 0) {
          this.handleCountDownTask(counter, status);
          clearInterval(functionCounter);
        }
      }, 1000);
    } else {
      return false;
    }
  }

  @SubscribeMessage('countDownTask')
  handleCountDownTask(counter: number, status: boolean) {
    this.server.emit('countDownTask', {
      counter,
      status,
    });
  }

  @SubscribeMessage('nearTask')
  handleNearTask(@MessageBody() data: { status: boolean; mac: string }) {
    this.countDownTasks(data.status);
    this.server.emit('nearTask', { status: data.status, mac: data.mac });
  }

  @SubscribeMessage('accomplishedTask')
  handleAccomplishedTask(
    @MessageBody()
    data: {
      macTask: string;
      accomplished: boolean;
    },
  ) {
    this.logger.log('task', data);
    this.server.emit('task', {
      mac: data.macTask,
      accomplished: data.accomplished,
    });
  }

  @SubscribeMessage('accomplishedTask')
  handleDoneTask(
    @MessageBody()
    data: {
      macPlayer: string;
      macTask: string;
      accomplished: boolean;
    },
  ) {
    this.logger.log('task', data);
    const task = this.gameService.doneTask(
      data.macPlayer,
      data.macTask,
      data.accomplished,
    );
    this.server.emit('task', task);
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
