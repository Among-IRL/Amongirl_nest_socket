import { Injectable } from '@nestjs/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { GameModel, Player, RolePlayer, Task } from '../models/game.model';

const personalTask: Task[] = [
  {
    name: 'Swiper la carte',
    mac: 'CARDSWIPE',
    accomplished: false,
  },
  {
    name: 'Code à rentrer',
    mac: 'KEYCODE',
    accomplished: false,
  },
  {
    name: 'Scanner le QR-CODE',
    mac: 'QRCODE',
    accomplished: false,
  },
  {
    name: 'Réussir le Simone',
    mac: 'SIMON',
    accomplished: false,
  },
  {
    name: 'Brancher les câbles',
    mac: 'CABLE',
    accomplished: false,
  },
];

const initGame: GameModel = {
  buzzer: {
    mac: '0013a20041582fc1',
    isActive: false,
  },
  players: [
    {
      name: 'Joueur 1',
      mac: 'JOUEUR1',
      role: RolePlayer.PLAYER,
      hasReport: false,
      isAlive: true,
      personalTasks: personalTask,
    },
    {
      name: 'Joueur 2',
      mac: 'JOUEUR2',
      role: RolePlayer.PLAYER,
      hasReport: false,
      isAlive: true,
      personalTasks: personalTask,
    },
    {
      name: 'Joueur 3',
      mac: 'JOUEUR3',
      role: RolePlayer.PLAYER,
      hasReport: false,
      isAlive: true,
      personalTasks: personalTask,
    },
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
  start: false,
  vote: [],
  sabotage: false,
  desabotage: 0,
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
      mac: 'JOUEUR' + (this.game.players.length + 1),
      role: RolePlayer.PLAYER,
      hasReport: false,
      isAlive: true,
      personalTasks: personalTask,
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
    console.log('before', this.game.players);
    this.subjectGame.next(this.game);
    console.log('after', this.game.players);

    return {
      name: this.game.players[index].name,
      mac: this.game.players[index].mac,
      isAlive: this.game.players[index].isAlive,
    };
  }

  // public doneTask(
  //   macPlayer: string,
  //   macTask: string,
  //   status: boolean,
  // ): {
  //   name: string;
  //   mac: string;
  //   accomplished: boolean;
  // } {
  //   const index = this.getIndexGlobalTasks(macTask);
  //
  //   if (this.game.globalTasks[index].mac === macTask) {
  //     this.game.globalTasks[index].accomplished = status;
  //   } else {
  //     this.getPersonalTasksByPlayer(macTask, index);
  //   }
  //
  //   this.subjectGame.next(this.game);
  //   return {
  //     name: this.game.globalTasks[index].name,
  //     mac: this.game.globalTasks[index].mac,
  //     accomplished: this.game.globalTasks[index].accomplished,
  //   };
  // }

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
        {
          name: 'Joueur 1',
          mac: 'JOUEUR1',
          role: RolePlayer.PLAYER,
          hasReport: false,
          isAlive: true,
          personalTasks: [
            {
              name: 'Swiper la carte',
              mac: 'CARDSWIPE',
              accomplished: false,
            },
            {
              name: 'Code à rentrer',
              mac: 'KEYCODE',
              accomplished: false,
            },
            {
              name: 'Scanner le QR-CODE',
              mac: 'QRCODE',
              accomplished: false,
            },
            {
              name: 'Réussir le Simone',
              mac: 'SIMON',
              accomplished: false,
            },
            {
              name: 'Brancher les câbles',
              mac: 'CABLE',
              accomplished: false,
            },
          ],
        },
        {
          name: 'Joueur 2',
          mac: 'JOUEUR2',
          role: RolePlayer.PLAYER,
          hasReport: false,
          isAlive: true,
          personalTasks: [
            {
              name: 'Swiper la carte',
              mac: 'CARDSWIPE',
              accomplished: false,
            },
            {
              name: 'Code à rentrer',
              mac: 'KEYCODE',
              accomplished: false,
            },
            {
              name: 'Scanner le QR-CODE',
              mac: 'QRCODE',
              accomplished: false,
            },
            {
              name: 'Réussir le Simone',
              mac: 'SIMON',
              accomplished: false,
            },
            {
              name: 'Brancher les câbles',
              mac: 'CABLE',
              accomplished: false,
            },
          ],
        },
        {
          name: 'Joueur 3',
          mac: 'JOUEUR3',
          role: RolePlayer.PLAYER,
          hasReport: false,
          isAlive: true,
          personalTasks: [
            {
              name: 'Swiper la carte',
              mac: 'CARDSWIPE',
              accomplished: false,
            },
            {
              name: 'Code à rentrer',
              mac: 'KEYCODE',
              accomplished: false,
            },
            {
              name: 'Scanner le QR-CODE',
              mac: 'QRCODE',
              accomplished: false,
            },
            {
              name: 'Réussir le Simone',
              mac: 'SIMON',
              accomplished: false,
            },
            {
              name: 'Brancher les câbles',
              mac: 'CABLE',
              accomplished: false,
            },
          ],
        },
      ],
      start: false,
      vote: [],
      sabotage: false,
      desabotage: 0,
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
    this.subjectGame.next(this.game);
  }
}
