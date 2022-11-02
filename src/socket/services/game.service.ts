import { Injectable } from '@nestjs/common';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  GameModel,
  initGame,
  MAC,
  personalTask,
  Player,
  RolePlayer,
  Task,
} from '../models/game.model';
import { QrCodeService } from './qr-code.service';
import { CardSwipService } from './card-swip.service';
import { KeyCodeService } from './key-code.service';
import { SimonService } from './simon.service';
import { SocleService } from './socle.service';

@Injectable()
export class GameService {
  constructor(
    private readonly qrCodeService: QrCodeService,
    private readonly cardSwipeService: CardSwipService,
    private readonly keyCodeService: KeyCodeService,
    private readonly simonService: SimonService,
    private readonly socleService: SocleService,
  ) {
    this.qrCodeService.observableTaskCompleted.subscribe(
      (isComplete: boolean) => {
        if (isComplete) {
          this.taskCompleted(MAC.QRCODE);
          this.subjectTaskComplete.next(MAC.QRCODE);
        }
      },
    );

    this.cardSwipeService.observableTaskCompleted.subscribe(
      (isCompleted: boolean) => {
        if (isCompleted) {
          this.taskCompleted(MAC.CARDSWIPE);
          this.subjectTaskComplete.next(MAC.CARDSWIPE);
        }
      },
    );

    this.keyCodeService.observableTaskCompleted.subscribe(
      (isCompleted: boolean) => {
        if (isCompleted) {
          this.taskCompleted(MAC.KEYCODE);
          this.subjectTaskComplete.next(MAC.KEYCODE);
        }
      },
    );

    this.simonService.observableTaskCompleted.subscribe(
      (isCompleted: boolean) => {
        if (isCompleted) {
          this.taskCompleted(MAC.SIMON);
          this.subjectTaskComplete.next(MAC.SIMON);
        }
      },
    );

    this.socleService.observableTaskCompleted.subscribe(
      (isCompleted: boolean) => {
        if (isCompleted) {
          this.taskCompleted(MAC.SOCLE);
          this.subjectTaskComplete.next(MAC.SOCLE);
        }
      },
    );
  }

  game: GameModel = JSON.parse(JSON.stringify(initGame));
  private subjectGame: BehaviorSubject<GameModel> =
    new BehaviorSubject<GameModel>(JSON.parse(JSON.stringify(initGame)));
  public observableGame: Observable<GameModel> =
    this.subjectGame.asObservable();
  private subjectTaskComplete: BehaviorSubject<string> =
    new BehaviorSubject<string>('');
  public observableTaskComplete: Observable<string> =
    this.subjectTaskComplete.asObservable();

  public startGame() {
    this.game.players[this.random(this.game.players.length)].role =
      RolePlayer.SABOTEUR;
    this.game.start = true;
    this.subjectGame.next(this.game);
  }

  private random(max: number): number {
    return Math.floor(Math.random() * max);
  }

  public selectPlayer(name: string) {
    const player = {
      name,
      mac: 'JOUEUR' + (this.game.players.length + 1),
      role: RolePlayer.PLAYER,
      hasReport: false,
      isAlive: true,
      personalTasks: JSON.parse(JSON.stringify(personalTask)),
    };
    this.game.players.push(player);
    this.subjectGame.next(this.game);
    return { game: this.game, currentPlayer: player };
  }

  getIndexPlayer(name: string) {
    return this.game.players.findIndex((player) => player.name === name);
  }

  // private getIndexGlobalTasks(mac: string) {
  //   return this.game.globalTasks.findIndex((task) => task.mac === mac);
  // }
  private getPersonalTasksByPlayer(macTask: string, index: number) {
    return this.game.players[index].personalTasks.findIndex(
      (task) => task.mac === macTask,
    );
  }

  private getIndexPlayerByMac(mac: string) {
    return this.game.players.findIndex((player) => player.mac === mac);
  }

  public getPlayerByMac(mac: string) {
    return this.game.players.find((player) => {
      return player.mac === mac;
    });
  }

  public deathPlayer(mac: string): {
    name: string;
    mac: string;
    isAlive: boolean;
  } {
    const index = this.getIndexPlayerByMac(mac);
    this.game.players[index].isAlive = false;
    console.log('before', this.game.players);
    this.subjectGame.next(this.game);
    console.log('after', this.game.players);

    return {
      name: this.game.players[index].name,
      mac: this.game.players[index].mac,
      isAlive: this.game.players[index].isAlive,
    };
  }

  public getGame(): GameModel {
    return this.game;
  }

  public buzzer() {
    this.game.buzzer.isActive = true;
    return { mac: this.game.buzzer.mac, status: this.game.buzzer.isActive };
  }

  public report(name: string): GameModel {
    const index = this.getIndexPlayer(name);
    this.game.players[index].hasReport = true;
    this.subjectGame.next(this.game);
    return this.game;
  }

  public resetVote() {
    this.game.players.forEach((player) => (player.hasReport = false));
    this.game.buzzer.isActive = false;
    this.game.vote = [];
  }

  public resetGame(): GameModel {
    this.game = JSON.parse(JSON.stringify(initGame));
    this.subjectGame.next(this.game);
    return this.game;
  }

  public winSaboteur(): boolean {
    const playersAlive = this.game.players.filter((player) => player.isAlive);
    if (playersAlive.length <= 2) {
      if (
        playersAlive.some(
          (playerAlive) => playerAlive.role === RolePlayer.SABOTEUR,
        )
      ) {
        return true;
      }
    }
    return false;
  }

  public winPlayers(): boolean {
    if (
      this.game.players.some(
        (player) => !player.isAlive && player.role === RolePlayer.SABOTEUR,
      )
    ) {
      return true;
    }
    return this.game.players.every((player: Player) =>
      player.personalTasks.every((task: Task) => task.accomplished),
    );
  }

  public mostPlayerVote(vote) {
    if (vote.length == 0) return { mostPlayerVote: '', count: 0 };
    const modeMap = {};
    let maxEl = vote[0];
    let maxCount = 0;
    for (let i = 0; i < vote.length; i++) {
      const el = vote[i];
      if (modeMap[el] == null) modeMap[el] = 1;
      else modeMap[el]++;

      if (modeMap[el] > maxCount) {
        maxEl = el;
        maxCount = modeMap[el];
      }
      for (const nom in modeMap) {
        if (modeMap[nom] == modeMap[maxEl] && nom != maxEl) {
          maxEl = '';
          maxCount = modeMap[el];
        }
      }
    }
    return { mostPlayerVote: maxEl, count: maxCount };
  }

  onSabotage(isSabotage: boolean) {
    this.game.sabotage = isSabotage;
    this.game.desabotage = 2;
    this.subjectGame.next(this.game);
  }

  taskActivateByPlayer(task: Task, player: Player): boolean {
    if (!this.game.tasks[task.mac].isPendingBy) {
      this.game.tasks[task.mac].isPendingBy = player.mac;
      this.subjectGame.next(this.game);
      return true;
    }
  }

  taskCompleted(task: string) {
    const indexPlayer = this.game.players.findIndex(
      (player: Player) => player.mac === this.game.tasks[task].isPendingBy,
    );
    if (indexPlayer > 0) {
      const indexTask = this.game.players[indexPlayer].personalTasks.findIndex(
        (taskPlayer: Task) => taskPlayer.mac === task,
      );
      this.game.players[indexPlayer].personalTasks[indexTask].accomplished =
        true;
      this.game.tasks[task].isPendingBy = '';
      this.game.tasks[task].accomplished++;
      this.subjectGame.next(this.game);
    }
  }

  timeDownTask(task: string) {
    this.game.tasks[task].isPendingBy = '';
    this.subjectGame.next(this.game);
  }

  onDesabotage() {
    this.game.desabotage = 0;
    this.game.sabotage = false;
    this.subjectGame.next(this.game);
  }
}
