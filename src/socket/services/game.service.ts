import { Injectable } from '@nestjs/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { GameModel, RolePlayer } from '../models/game.model';

const initGame: GameModel = {
  buzzer: {
    mac: '0013a20041582fc1',
    isActive: false,
  },
  players: [
    // {
    //   name: 'Joueur 1',
    //   mac: '0013a20041a72956',
    //   role: RolePlayer.PLAYER,
    //   hasReport: false,
    //   isAlive: true,
    //   personalTasks: [],
    // },
    // {
    //   name: 'Joueur 2',
    //   mac: '0013a20041582fc0',
    //   role: RolePlayer.PLAYER,
    //   hasReport: false,
    //   isAlive: true,
    //   personalTasks: [],
    // },
    // {
    //   name: 'Joueur 3',
    //   mac: '0013a20041a72913',
    //   role: RolePlayer.PLAYER,
    //   hasReport: false,
    //   isAlive: true,
    //   personalTasks: [],
    // },
    // {
    //   name: 'Joueur 4',
    //   mac: '0013a20041e54aeb',
    //   role: RolePlayer.PLAYER,
    //   hasReport: false,
    //   isAlive: true,
    //   personalTasks: [],
    // },
    // {
    //   name: 'Joueur 5',
    //   mac: '0013a20041a72961',
    //   role: RolePlayer.PLAYER,
    //   hasReport: false,
    //   isAlive: true,
    //   personalTasks: [],
    // },
    // {
    //   name: 'Joueur 6',
    //   mac: '0013a20041c3475c',
    //   role: RolePlayer.PLAYER,
    //   hasReport: false,
    //   isAlive: true,
    //   personalTasks: [],
    // },
  ],
  globalTasks: [
    {
      name: 'Réparer ordinateur de Colombe',
      mac: '0013a20041582eee',
      accomplished: false,
    },
    {
      name: 'Supprimer les absences',
      mac: '0013a20041c34ac1',
      accomplished: false,
    },
    {
      name: 'Réparer le robinet',
      mac: '0013a20041c34b12',
      accomplished: false,
    },
    {
      name: 'Fermer le distributeur de papier',
      mac: '0013a20041a72946',
      accomplished: false,
    },
    {
      name: 'Réparer la machine à café',
      mac: '0013a20041a713bc',
      accomplished: false,
    },
    //puce fonctionne pas
    // { name: 'Effacer le tableau', mac: '0013a20041a7133c', task: false },
    {
      name: 'Ranger les affaires IOT',
      mac: '0013a20041582fb1',
      accomplished: false,
    },
    // { name: 'Réparer le ditributeur', mac: '', task: false },
  ],
  start: false,
  vote: [],
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

  public selectPlayer(name: string) {
    const player = {
      name,
      mac: '0013a20041c3475c' + Math.floor(Math.random() * 1000),
      role: RolePlayer.PLAYER,
      hasReport: false,
      isAlive: true,
      personalTasks: [
        // {
        //   name: 'Réparer ordinateur de Colombe',
        //   mac: '0013a20041582eee',
        //   accomplished: false,
        // },
        // {
        //   name: 'Réparer ordinateur de Colombe',
        //   mac: '0013a20041582eee',
        //   accomplished: false,
        // },
        // {
        //   name: 'Réparer ordinateur de Colombe',
        //   mac: '0013a20041582eee',
        //   accomplished: false,
        // },
        // {
        //   name: 'Réparer ordinateur de Colombe',
        //   mac: '0013a20041582eee',
        //   accomplished: false,
        // },
      ],
    };
    this.game.players.push(player);
    this.subjectGame.next(this.game);
    return { game: this.game, currentPlayer: player };
  }

  getIndexPlayer(name: string) {
    return this.game.players.findIndex((player) => player.name === name);
  }

  private getIndexRoom(mac: string) {
    return this.game.globalTasks.findIndex((room) => room.mac === mac);
  }

  private getIndexPlayerByMac(mac: string) {
    return this.game.players.findIndex((player) => player.mac === mac);
  }

  public getPlayerByMac(mac: string) {

    return this.game.players.find((player) => {
      console.log(player + '\n');
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
    accomplished: boolean;
  } {
    const index = this.getIndexRoom(mac);
    this.game.globalTasks[index].accomplished = status;
    this.subjectGame.next(this.game);
    return {
      name: this.game.globalTasks[index].name,
      mac: this.game.globalTasks[index].mac,
      accomplished: this.game.globalTasks[index].accomplished,
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
    this.game.players[index].hasReport = true;
    this.subjectGame.next(this.game);
    return this.game;
  }

  public resetReport() {
    this.game.players.forEach((player) => (player.hasReport = false));
    this.subjectGame.next(this.game);
  }

  public resetBuzzer() {
    this.game.buzzer.isActive = false;
    this.subjectGame.next(this.game);
  }

  public resetVote() {
    this.game.vote = [];
  }

  public resetGame(): GameModel {
    this.game = {
      buzzer: {
        mac: '0013a20041582fc1',
        isActive: false,
      },
      players: [
        // {
        //   name: 'Joueur 1',
        //   mac: '0013a20041a72956',
        //   role: RolePlayer.PLAYER,
        //   hasReport: false,
        //   isAlive: true,
        //   personalTasks: [],
        // },
        // {
        //   name: 'Joueur 2',
        //   mac: '0013a20041582fc0',
        //   role: RolePlayer.PLAYER,
        //   hasReport: false,
        //   isAlive: true,
        //   personalTasks: [],
        // },
        // {
        //   name: 'Joueur 3',
        //   mac: '0013a20041a72913',
        //   role: RolePlayer.PLAYER,
        //   hasReport: false,
        //   isAlive: true,
        //   personalTasks: [],
        // },
        // {
        //   name: 'Joueur 4',
        //   mac: '0013a20041e54aeb',
        //   role: RolePlayer.PLAYER,
        //   hasReport: false,
        //   isAlive: true,
        //   personalTasks: [],
        // },
        // {
        //   name: 'Joueur 5',
        //   mac: '0013a20041a72961',
        //   role: RolePlayer.PLAYER,
        //   hasReport: false,
        //   isAlive: true,
        //   personalTasks: [],
        // },
        // {
        //   name: 'Joueur 6',
        //   mac: '0013a20041c3475c',
        //   role: RolePlayer.PLAYER,
        //   hasReport: false,
        //   isAlive: true,
        //   personalTasks: [],
        // },
      ],
      globalTasks: [
        {
          name: 'Réparer ordinateur de Colombe',
          mac: '0013a20041582eee',
          accomplished: false,
        },
        {
          name: 'Supprimer les absences',
          mac: '0013a20041c34ac1',
          accomplished: false,
        },
        {
          name: 'Réparer le robinet',
          mac: '0013a20041c34b12',
          accomplished: false,
        },
        {
          name: 'Fermer le distributeur de papier',
          mac: '0013a20041a72946',
          accomplished: false,
        },
        {
          name: 'Réparer la machine à café',
          mac: '0013a20041a713bc',
          accomplished: false,
        },
        //puce fonctionne pas
        // { name: 'Effacer le tableau', mac: '0013a20041a7133c', task: false },
        {
          name: 'Ranger les affaires IOT',
          mac: '0013a20041582fb1',
          accomplished: false,
        },
        // { name: 'Réparer le ditributeur', mac: '', task: false },
      ],
      start: false,
      vote: [],
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
    return this.game.globalTasks.every((room) => room.accomplished);
  }

  public mostPlayerVote(vote) {
    if (vote.length == 0) return null;
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
}
