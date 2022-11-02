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
  isDeadReport: boolean;

  personalTasks: Task[];
}

export interface Tasks {
  CARDSWIPE: TasksGame;
  KEYCODE: TasksGame;
  QRCODE: TasksGame;
  SIMON: TasksGame;
  SOCLE: TasksGame;
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
    name: 'Réussir le Simon',
    mac: 'SIMON',
    accomplished: false,
  },
  {
    name: 'Placer la pièce',
    mac: 'SOCLE',
    accomplished: false,
  },
];

const taskGame: TasksGame = {
  accomplished: 0,
  isPendingBy: '',
};

const tasks: Tasks = {
  CARDSWIPE: taskGame,
  KEYCODE: taskGame,
  QRCODE: taskGame,
  SIMON: taskGame,
  SOCLE: taskGame,
};

export const initGame: GameModel = {
  buzzer: {
    mac: '0013a20041582fc1',
    isActive: false,
  },
  players: [],
  start: false,
  vote: [],
  sabotage: false,
  desabotage: 0,
  tasks,
};

export enum MAC {
  CARDSWIPE = 'CARDSWIPE',
  KEYCODE = 'KEYCODE',
  SIMON = 'SIMON',
  QRCODE = 'QRCODE',
  SOCLE = 'SOCLE',
}
