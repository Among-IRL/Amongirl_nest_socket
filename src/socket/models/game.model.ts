export enum RolePlayer {
  PLAYER = 'player',
  SABOTEUR = 'saboteur',
}

interface Rooms {
  name: string;
  mac: string;
  task: boolean;
}

interface Players {
  name: string;
  mac: string;
  isAlive: boolean;
  role: RolePlayer;
  report: boolean;
  selected: boolean;
}

export interface GameModel {
  buzzer: {
    mac: string;
    isActive: boolean;
  };
  players: Players[];
  rooms: Rooms[];
  start: boolean;
}
