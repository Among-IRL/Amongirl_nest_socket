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
}
