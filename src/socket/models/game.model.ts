export enum RolePlayer {
  PLAYER = 'player',
  SABOTEUR = 'saboteur',
}

interface Tasks {
  name: string;
  mac: string;
  accomplished: boolean;
}

export interface Players {
  name: string;
  mac: string;
  isAlive: boolean;
  role: RolePlayer;
  hasReport: boolean;
  personalTasks: Tasks[];
}

export interface GameModel {
  buzzer: {
    mac: string;
    isActive: boolean;
  };
  players: Players[];
  globalTasks: Tasks[];
  start: boolean;
  vote: string[];
}
