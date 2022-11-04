import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { GameService } from './services/game.service';
import { GameModel, MAC, Player, RolePlayer, Task } from './models/game.model';
import { SimonService } from './services/simon.service';
import { DesabotageService } from './services/desabotage.service';
import { QrCodeService } from './services/qr-code.service';
import { CardSwipService } from './services/card-swip.service';
import { KeyCodeService } from './services/key-code.service';
import { SocleService } from './services/socle.service';

@WebSocketGateway()
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private game: GameModel;

  constructor(
    private readonly desabotageService: DesabotageService,
    private readonly qrCodeService: QrCodeService,
    private readonly gameService: GameService,
    private readonly simonService: SimonService,
    private readonly cardSwipService: CardSwipService,
    private readonly keycodeService: KeyCodeService,
    private readonly socleService: SocleService,
  ) {}

  @WebSocketServer()
  server: Server;
  private logger: Logger = new Logger('AppGateway');

  afterInit(server: Server) {
    this.logger.log('Init');

    this.gameService.observableTaskNotComplete.subscribe((task: string) => {
      this.handleTaskNotComplete(task);
    });

    this.gameService.observableReset.subscribe((reset: boolean) => {
      this.handleDisableTaskSocle();
      this.socleService.endTask();
      this.handleDisableTaskQrCode();
      this.qrCodeService.endTask();
      this.handleDisableTaskSimon();
      this.simonService.stopSimon();
      this.handleDisableDesabotage();
      this.handleDisableTaskCardSwip();
      this.cardSwipService.endTask();
      this.handleDisableTaskKeyCode();
      this.keycodeService.endTask();
      this.handleDisablePlayers();
    });
    this.keycodeService.observableCodeToFound.subscribe((code: string[]) => {
      this.handleTaskCodeToFound(code);
    });
    this.keycodeService.observableKeyPressed.subscribe((key: string) => {
      this.handleTaskKeyPressed(key);
    });

    this.simonService.observableLed.subscribe((led: string) => {
      if (led) {
        this.handleTaskLedSimon(led);
      }
    });

    this.simonService.observableScoreSimon.subscribe((score: string) => {
      this.handleScoreSimon(score);
    });

    this.desabotageService.observableStatus.subscribe((status: string) => {
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
    });

    this.socleService.observableLed.subscribe((led: string) => {
      this.handleTaskLedSocle(led);
    });

    this.gameService.observableTaskComplete.subscribe((task: string) => {
      switch (task) {
        case MAC.QRCODE:
          this.handleTaskCompletedQrCode();
          break;

        case MAC.CARDSWIPE:
          this.handleTaskCompletedTaskCardSwip();
          break;

        case MAC.KEYCODE:
          this.handleTaskCompletedKeyCode();
          break;

        case MAC.SIMON:
          this.handleTaskCompletedSimon();
          break;

        case MAC.SOCLE:
          this.handleTaskCompletedSocle();
          break;
      }
    });

    this.gameService.observableGame.subscribe((game) => {
      this.game = game;
      if (game.sabotage) {
        this.handleOnSabotage();
      }
    });
  }

  win(game: GameModel) {
    if (this.gameService.winSaboteur() && game.start) {
      this.handleVictory(RolePlayer.SABOTEUR);
    } else if (this.gameService.winPlayers() && game.start) {
      this.handleVictory(RolePlayer.PLAYER);
    }
  }
  @SubscribeMessage('getGameData')
  handleInitGame(@MessageBody() data: any) {
    this.logger.log('getGameData');
    this.server.emit('getGameData', this.game);
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

  handleEnablePlayers() {
    this.logger.log('enablePlayer', true);
    this.server.emit('enablePlayer', true);
  }

  handleDisablePlayers() {
    this.logger.log('disablePlayer', true);
    this.server.emit('disablePlayer', true);
  }

  handleDisableDesabotage() {
    this.logger.log('disableDesabotage');
    this.server.emit('disableDesabotage');
  }

  handleTaskCompletedDesabotage() {
    this.logger.log('taskCompletedDesabotage');
    this.server.emit('taskCompletedDesabotage');
    this.gameService.onDesabotage();
    setTimeout(() => {
      this.handleDisableDesabotage();
    }, 3000);
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

  @SubscribeMessage('connectionDesabotage2')
  handleConnectionDesabotage2(@MessageBody() data: { isConnect: boolean }) {
    this.logger.log('connectionDesabotage2', data);
  }

  handleTaskSimonEnable() {
    this.logger.log('enableTaskSimon');
    this.server.emit('enableTaskSimon');
  }

  handleDisableTaskSimon() {
    this.logger.log('disableTaskSimon');
    this.server.emit('disableTaskSimon');
  }

  handleTaskCompletedSimon() {
    this.logger.log('taskCompletedSimon');
    this.server.emit('taskCompletedSimon', {
      game: this.game,
      macPlayer: this.simonService.getMacPlayer(),
    });
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

  handleEnableTaskQrCode() {
    this.logger.log('enableTaskQrCode');
    this.server.emit('enableTaskQrCode');
  }

  handleDisableTaskQrCode() {
    this.logger.log('disableTaskQrCode');
    this.server.emit('disableTaskQrCode');
  }

  handleTaskCompletedQrCode() {
    this.logger.log('taskCompletedQrCode');
    this.server.emit('taskCompletedQrCode', {
      game: this.game,
      macPlayer: this.qrCodeService.getMacPlayer(),
    });
  }

  @SubscribeMessage('qrCodeScan')
  handleQrCodeScan(
    @MessageBody() data: { player: Player; accomplished: boolean },
  ) {
    this.logger.log('qrCodeScan', data);
    this.qrCodeService.onDetectQrCode(data.accomplished);
  }

  handleEnableTaskCardSwip() {
    this.logger.log('enableTaskCardSwip');
    this.server.emit('enableTaskCardSwip');
  }

  handleDisableTaskCardSwip() {
    this.logger.log('disableTaskCardSwip');
    this.server.emit('disableTaskCardSwip');
  }

  handleTaskCompletedTaskCardSwip() {
    this.logger.log('taskCompletedTaskCardSwip');
    this.server.emit('taskCompletedTaskCardSwip', {
      game: this.game,
      macPlayer: this.cardSwipService.getMacPlayer(),
    });
  }

  @SubscribeMessage('taskCardSwip')
  handleTaskCardSwip(@MessageBody() data: { isDetected: boolean }) {
    this.logger.log('taskCardSwip', data);
    this.cardSwipService.onDetectedCard(data.isDetected);
  }

  @SubscribeMessage('startTask')
  handleStartTask(@MessageBody() data: { task: Task; player: Player }) {
    this.logger.log('startTask', data);
    switch (data.task.mac) {
      case MAC.CARDSWIPE:
        if (this.gameService.taskActivateByPlayer(data.task, data.player)) {
          this.handleEnableTaskCardSwip();
          this.cardSwipService.startTask(data.player.mac);
        } else {
          this.server.emit('startTask', {
            CARDSWIPE: `${MAC.CARDSWIPE} is pending`,
          });
        }
        break;
      case MAC.KEYCODE:
        if (this.gameService.taskActivateByPlayer(data.task, data.player)) {
          this.handleEnableTaskKeyCode();
          this.keycodeService.startKeyCode(data.player.mac);
        } else {
          this.server.emit('startTask', {
            KEYCODE: `${MAC.KEYCODE} is pending`,
          });
        }
        break;
      case MAC.SIMON:
        if (this.gameService.taskActivateByPlayer(data.task, data.player)) {
          this.handleTaskSimonEnable();
          this.simonService.startSimon(data.player.mac);
        } else {
          this.server.emit('startTask', { SIMON: `${MAC.SIMON} is pending` });
        }
        break;
      case MAC.QRCODE:
        if (this.gameService.taskActivateByPlayer(data.task, data.player)) {
          this.handleEnableTaskQrCode();
          this.qrCodeService.startTask(data.player.mac);
        } else {
          this.server.emit('startTask', { QRCODE: `${MAC.QRCODE} is pending` });
        }
        break;
      case MAC.SOCLE:
        if (this.gameService.taskActivateByPlayer(data.task, data.player)) {
          this.handleEnableTaskSocle();
          this.socleService.startSocle(data.player.mac);
        } else {
          this.server.emit('startTask', { SOCLE: `${MAC.SOCLE} is pending` });
        }
        break;
    }
  }

  @SubscribeMessage('stopTask')
  handleStopTask(@MessageBody() data: { task: Task; player: Player }) {
    this.logger.log('stopTask', data);
    this.gameService.taskDesactivateByPlayer(data.task, data.player);
    switch (data.task.mac) {
      case MAC.CARDSWIPE:
        this.handleDisableTaskCardSwip();
        this.cardSwipService.endTask();
        break;
      case MAC.KEYCODE:
        this.handleDisableTaskKeyCode();
        this.keycodeService.endTask();
        break;
      case MAC.SIMON:
        this.handleDisableTaskSimon();
        this.simonService.stopSimon();
        break;
      case MAC.QRCODE:
        this.handleDisableTaskQrCode();
        this.qrCodeService.endTask();
        break;
      case MAC.SOCLE:
        this.handleDisableTaskSocle();
        this.socleService.endTask();
        break;
    }
    this.win(this.game);
  }

  handleEnableTaskKeyCode() {
    this.logger.log('enableTaskKeyCode');
    this.server.emit('enableTaskKeyCode');
  }

  handleDisableTaskKeyCode() {
    this.logger.log('disableTaskKeyCode');
    this.server.emit('disableTaskKeyCode');
  }

  handleTaskCompletedKeyCode() {
    this.logger.log('taskCompletedTaskKeyCode');
    this.server.emit('taskCompletedTaskKeyCode', {
      game: this.game,
      macPlayer: this.cardSwipService.getMacPlayer(),
    });
  }

  @SubscribeMessage('taskKeyCode')
  handleTaskKeyCode(@MessageBody() data: { keyPressed: string }) {
    this.keycodeService.onKeyPressed(data.keyPressed);
  }

  @SubscribeMessage('startGame')
  handleStartGame(@MessageBody() data: any) {
    this.logger.log('startGame');
    this.gameService.startGame();
    this.server.emit('startGame', this.game);
    this.handleEnablePlayers();
  }

  @SubscribeMessage('deathPlayer')
  handleDeathPlayer(@MessageBody() data: { mac: string }) {
    this.logger.log('deathPlayer', data);
    this.server.emit('deathPlayer', this.gameService.deathPlayer(data.mac));
    this.win(this.game);
  }

  @SubscribeMessage('refresh')
  handleRefresh(game) {
    this.logger.log('refresh');
    this.server.emit('refresh', game);
  }

  @SubscribeMessage('buzzer')
  handleBuzzer(@MessageBody() data: { status: boolean }) {
    this.gameService.buzzer();
    this.handleRefresh(this.gameService.getGame());
    this.logger.log('buzzer');
    this.countDownMeeting(true);
    this.server.emit('buzzer', this.game);
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
          const vote = this.gameService.mostPlayerVote(this.game.vote);
          if (vote.mostPlayerVote !== '') {
            const index = this.gameService.getIndexPlayer(vote.mostPlayerVote);
            const player = this.game.players[index];
            this.handleDeathPlayer({ mac: player.mac });
          }
          this.gameService.resetVote();
          this.game.players.forEach((playerCheck) => {
            if (!playerCheck.isAlive) {
              this.logger.log('deadReport', playerCheck.mac);
              this.server.emit('deadReport', {
                macDeadPlayer: playerCheck.mac,
              });
            }
          });
          this.handleMeeting(counter, false, vote.mostPlayerVote, vote.count);
          this.win(this.game);
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

  @SubscribeMessage('timerTaskDone')
  handletimerTaskDone(
    @MessageBody()
    data: {
      macPlayer: string;
      macTask: string;
      accomplished: boolean;
    },
  ) {
    this.logger.log('timerTaskDone', data);
    this.gameService.timeDownTask(data.macTask, data.macPlayer);
    this.win(this.game);
  }

  @SubscribeMessage('meeting')
  handleMeeting(counter: number, status: boolean, vote: string, count: number) {
    this.logger.log('meeting, { countDown: counter, status }');
    this.server.emit('meeting', {
      game: this.game,
      countDown: counter,
      status,
      vote: vote,
      count: count,
    });
  }

  @SubscribeMessage('report')
  handleReport(@MessageBody() data: { name: string; macDeadPlayer: string }) {
    this.logger.log('data name = ', data.name);
    const report = this.gameService.report(data.name);
    this.countDownMeeting(true);
    this.server.emit('report', report);
  }

  @SubscribeMessage('sabotage')
  handleSabotage(@MessageBody() data: { isSabotage: boolean }) {
    this.logger.log('sabotage', data);
    this.gameService.onSabotage(data.isSabotage);
  }

  handleOnSabotage() {
    this.logger.log('onSabotage', this.game.sabotage);
    this.handleEnableDesabotage();
    this.server.emit('sabotage', this.game.sabotage);
  }

  @SubscribeMessage('vote')
  handleVote(@MessageBody() data: { macFrom: string; macTo: string }) {
    const playerFrom: Player = this.gameService.getPlayerByMac(data.macFrom);
    if (data.macTo) {
      const playerTo: Player = this.gameService.getPlayerByMac(data.macTo);
      this.logger.log(playerFrom.name + ' vote for ' + playerTo.name);
      this.game.vote.push(playerTo.name);
    } else {
      this.logger.log(playerFrom.name + ' vote for nobody');
    }
  }

  @SubscribeMessage('resetGame')
  handleResetGame(@MessageBody() data: any) {
    this.logger.log('resetGame ');
    const resetGame = this.gameService.resetGame();
    this.server.emit('resetGame', resetGame);
  }

  @SubscribeMessage('connectEsp')
  handleConnectEsp(@MessageBody() data: { module: string }) {
    this.logger.log('connectEsp', data.module);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  private handleTaskCodeToFound(code: string[]) {
    this.logger.log('CodeToFound', code);
    this.server.emit('taskCodeToFound', code);
  }

  private handleTaskKeyPressed(key: string) {
    this.logger.log('taskKeyPressed', key);
    this.server.emit('taskKeyPressed', key);
  }

  private handleScoreSimon(score: string) {
    this.logger.log('scoreSimon', score);
    this.server.emit('scoreSimon', score);
  }

  private handleDisableTaskSocle() {
    this.logger.log('disableTaskSocle');
    this.server.emit('disableTaskSocle');
  }

  private handleEnableTaskSocle() {
    this.logger.log('enableTaskSocle');
    this.server.emit('enableTaskSocle');
  }

  private handleTaskCompletedSocle() {
    this.logger.log('taskCompletedSocle');
    this.server.emit('taskCompletedSocle', {
      game: this.game,
      macPlayer: this.socleService.getMacPlayer(),
    });
  }

  @SubscribeMessage('taskSocle')
  handleTaskSocle(@MessageBody() data: { button: number }) {
    this.logger.log('taskSocle', data);
    if (data) {
      this.socleService.positionPiece(data.button);
    }
  }

  private handleTaskLedSocle(led: string) {
    this.logger.log('taskLedSocle', { led });
    this.server.emit('taskLedSocle', { led });
  }

  private handleTaskNotComplete(task: string) {
    this.logger.log('taskNotComplete', task);
    this.server.emit('taskNotComplete', { task, game: this.game });
  }
}
