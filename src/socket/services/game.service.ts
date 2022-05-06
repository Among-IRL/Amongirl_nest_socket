import { Injectable } from '@nestjs/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { GameModel, RolePlayer } from '../models/game.model';

const initGame: GameModel = {
  buzzer: {
    mac: '0013a20041582fc1',
    isActive: false,
  },
  players: [
    {
      name: 'Joueur 1',
      mac: '0013a20041a72956',
      role: RolePlayer.PLAYER,
      report: false,
      isAlive: true,
      selected: false,
    },
    {
      name: 'Joueur 2',
      mac: '0013a20041582fc0',
      role: RolePlayer.PLAYER,
      report: false,
      isAlive: true,
      selected: false,
    },
    {
      name: 'Joueur 3',
      mac: '0013a20041a72913',
      role: RolePlayer.PLAYER,
      report: false,
      isAlive: true,
      selected: false,
    },
    {
      name: 'Joueur 4',
      mac: '0013a20041e54aeb',
      role: RolePlayer.PLAYER,
      report: false,
      isAlive: true,
      selected: false,
    },
    {
      name: 'Joueur 5',
      mac: '0013a20041a72961',
      role: RolePlayer.PLAYER,
      report: false,
      isAlive: true,
      selected: false,
    },
    {
      name: 'Joueur 6',
      mac: '0013a20041c3475c',
      role: RolePlayer.PLAYER,
      report: false,
      isAlive: true,
      selected: false,
    },
  ],
  rooms: [
    {
      name: 'Réparer ordinateur de Colombe',
      mac: '0013a20041582eee',
      task: false,
    },
    { name: 'Supprimer les absences', mac: '0013a20041c34ac1', task: false },
    { name: 'Réparer le robinet', mac: '0013a20041c34b12', task: false },
    { name: 'Fermer le distributeur de papier', mac: '0013a20041a72946', task: false },
    { name: 'Réparer la machine à café', mac: '0013a20041a713bc', task: false },
    //puce fonctionne pas
    // { name: 'Effacer le tableau', mac: '0013a20041a7133c', task: false },
    { name: 'Ranger les affaires IOT', mac: '0013a20041582fb1', task: false },
    // { name: 'Réparer le ditributeur', mac: '', task: false },
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
    this.game.players[this.random(this.game.players.length)].role =
      RolePlayer.SABOTEUR;
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
    this.game.players.forEach((player) => (player.report = false));
    this.subjectGame.next(this.game);
  }

  public resetBuzzer() {
    this.game.buzzer.isActive = false;
    this.subjectGame.next(this.game);
  }

  public resetGame(): GameModel {
    this.game = {
      buzzer: {
        mac: '0013a20041582fc1',
        isActive: false,
      },
      players: [
        {
          name: 'Joueur 1',
          mac: '0013a20041a72956',
          role: RolePlayer.PLAYER,
          report: false,
          isAlive: true,
          selected: false,
        },
        {
          name: 'Joueur 2',
          mac: '0013a20041582fc0',
          role: RolePlayer.PLAYER,
          report: false,
          isAlive: true,
          selected: false,
        },
        {
          name: 'Joueur 3',
          mac: '0013a20041a72913',
          role: RolePlayer.PLAYER,
          report: false,
          isAlive: true,
          selected: false,
        },
        {
          name: 'Joueur 4',
          mac: '0013a20041e54aeb',
          role: RolePlayer.PLAYER,
          report: false,
          isAlive: true,
          selected: false,
        },
        {
          name: 'Joueur 5',
          mac: '0013a20041a72961',
          role: RolePlayer.PLAYER,
          report: false,
          isAlive: true,
          selected: false,
        },
        {
          name: 'Joueur 6',
          mac: '0013a20041c3475c',
          role: RolePlayer.PLAYER,
          report: false,
          isAlive: true,
          selected: false,
        },
      ],
      rooms: [
        {
          name: 'Réparer ordinateur de Colombe',
          mac: '0013a20041582eee',
          task: false,
        },
        {
          name: 'Supprimer les absences',
          mac: '0013a20041c34ac1',
          task: false,
        },
        { name: 'Réparer le robinet', mac: '0013a20041c34b12', task: false },
        {
          name: 'Fermer le distributeur de papier',
          mac: '0013a20041a72946',
          task: false,
        },
        { name: 'Réparer la machine à café', mac: '0013a20041a713bc', task: false },
        //puce fonctionne pas
        // { name: 'Effacer le tableau', mac: '0013a20041a7133c', task: false },
        { name: 'Ranger les affaires IOT', mac: '0013a20041582fb1', task: false },
        // { name: 'Réparer le ditributeur', mac: '', task: false },
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
