export enum RolePlayer {
  PLAYER = 'player',
  SABOTEUR = 'saboteur',
}

export interface Task {
  name: string;
  mac: string;
  accomplished: boolean;
}

export interface Player {
  name: string;
  mac: string;
  isAlive: boolean;
  role: RolePlayer;
  hasReport: boolean;
  personalTasks: Task[];
}

export interface Tasks {
  CARDSWIPE: TasksGame;
  KEYCODE: TasksGame;
  QRCODE: TasksGame;
  SIMON: TasksGame;
  CABLE: TasksGame;
}

export interface TasksGame {
  accomplished: number;
  isPendingBy: string;
}

export interface GameModel {
  buzzer: {
    mac: string;
    isActive: boolean;
  };
  players: Player[];
  start: boolean;
  vote: string[];
  sabotage: boolean;
  desabotage: number;
  tasks: Tasks;
}

export const personalTask: Task[] = [
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

const taskGame: TasksGame = {
  accomplished: 0,
  isPendingBy: '',
};

const tasks: Tasks = {
  CABLE: taskGame,
  CARDSWIPE: taskGame,
  KEYCODE: taskGame,
  QRCODE: taskGame,
  SIMON: taskGame,
};

export const initGame: GameModel = {
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
      personalTasks: JSON.parse(JSON.stringify(personalTask)),
    },
    {
      name: 'Joueur 2',
      mac: 'JOUEUR2',
      role: RolePlayer.PLAYER,
      hasReport: false,
      isAlive: true,
      personalTasks: JSON.parse(JSON.stringify(personalTask)),
    },
    {
      name: 'Joueur 3',
      mac: 'JOUEUR3',
      role: RolePlayer.PLAYER,
      hasReport: false,
      isAlive: true,
      personalTasks: JSON.parse(JSON.stringify(personalTask)),
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
  tasks,
};
