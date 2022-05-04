import { Injectable } from '@nestjs/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { GameModel, RolePlayer } from '../models/game.model';

const initGame: GameModel = {
  buzzer: {
    mac: '',
    isActive: false,
  },
  players: [
    {
      name: 'Antony',
      mac: '',
      role: RolePlayer.PLAYER,
      report: false,
      isAlive: true,
      selected: true,
    },
    {
      name: 'Jonathan',
      mac: '',
      role: RolePlayer.PLAYER,
      report: false,
      isAlive: true,
      selected: true,
    },
    {
      name: 'Sarah',
      mac: '',
      role: RolePlayer.PLAYER,
      report: false,
      isAlive: true,
      selected: false,
    },
    {
      name: 'Brian',
      mac: '',
      role: RolePlayer.PLAYER,
      report: false,
      isAlive: true,
      selected: true,
    },
  ],
  rooms: [
    { name: 'ROOM 1', mac: '0013A20041A72956', task: false },
    { name: 'ROOM 2', mac: '0013A20041A72957', task: false },
    { name: 'ROOM 3', mac: '0013A20041A72958', task: false },
    { name: 'ROOM 4', mac: '0013A20041A72959', task: false },
  ],
  start: false,
};
@Injectable()
export class GameService {
  game: GameModel = { ...initGame };
  private subjectGame: BehaviorSubject<GameModel> =
    new BehaviorSubject<GameModel>({ ...initGame });
  public observableGame: Observable<GameModel> =
    this.subjectGame.asObservable();

  public startGame() {
    this.game.players[this.random(3)].role = RolePlayer.SABOTEUR;
    this.game.start = true;
    this.subjectGame.next(this.game);
  }

  private random(max: number): number {
    return Math.floor(Math.random() * max);
  }

  public selectPlayer(name: string): GameModel {
    const index = this.getIndexPlayer(name);
    this.game.players[index].selected = true;
    this.subjectGame.next(this.game);
    return this.game;
  }

  private getIndexPlayer(name: string) {
    return this.game.players.findIndex((player) => player.name === name);
  }

  private getIndexRoom(mac: string) {
    return this.game.rooms.findIndex((room) => room.mac === mac);
  }

  private getIndexPlayerByMac(mac: string) {
    return this.game.players.findIndex((player) => player.mac === mac);
  }

  public deathPlayer(mac: string): {
    name: string;
    mac: string;
    isAlive: boolean;
  } {
    const index = this.getIndexPlayerByMac(mac);
    this.game.players[index].isAlive = false;
    this.subjectGame.next(this.game);
    return {
      name: this.game.players[index].name,
      mac: this.game.players[index].mac,
      isAlive: this.game.players[index].isAlive,
    };
  }

  public accomplishedTask(
    mac: string,
    status: boolean,
  ): {
    name: string;
    mac: string;
    task: boolean;
  } {
    const index = this.getIndexRoom(mac);
    this.game.rooms[index].task = status;
    this.subjectGame.next(this.game);
    return {
      name: this.game.rooms[index].name,
      mac: this.game.rooms[index].mac,
      task: this.game.rooms[index].task,
    };
  }

  public getGame(): GameModel {
    return this.game;
  }

  public buzzer(mac: string) {
    this.game.buzzer.isActive = true;
    return { mac: this.game.buzzer.mac, status: this.game.buzzer.isActive };
  }

  public report(name: string): GameModel {
    const index = this.getIndexPlayer(name);
    this.game.players[index].report = true;
    this.subjectGame.next(this.game);
    return this.game;
  }

  public resetReport() {
    this.game.players[0].report = false;
    this.game.players[1].report = false;
    this.game.players[3].report = false;
    this.game.players[2].report = false;
    this.subjectGame.next(this.game);
  }

  public resetBuzzer() {
    this.game.buzzer.isActive = false;
    this.subjectGame.next(this.game);
  }

  public resetGame(): GameModel {
    this.game = {
      buzzer: {
        mac: '',
        isActive: false,
      },
      players: [
        {
          name: 'Antony',
          mac: '',
          role: RolePlayer.PLAYER,
          report: false,
          isAlive: true,
          selected: true,
        },
        {
          name: 'Jonathan',
          mac: '',
          role: RolePlayer.PLAYER,
          report: false,
          isAlive: true,
          selected: true,
        },
        {
          name: 'Sarah',
          mac: '',
          role: RolePlayer.PLAYER,
          report: false,
          isAlive: true,
          selected: false,
        },
        {
          name: 'Brian',
          mac: '',
          role: RolePlayer.PLAYER,
          report: false,
          isAlive: true,
          selected: true,
        },
      ],
      rooms: [
        { name: 'ROOM 1', mac: '0013A20041A72956', task: false },
        { name: 'ROOM 2', mac: '0013A20041A72957', task: false },
        { name: 'ROOM 3', mac: '0013A20041A72958', task: false },
        { name: 'ROOM 4', mac: '0013A20041A72959', task: false },
      ],
      start: false,
    };
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
    return this.game.rooms.every((room) => room.task);
  }
}
