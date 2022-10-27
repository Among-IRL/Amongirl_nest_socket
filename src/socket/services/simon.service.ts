import { Injectable } from '@nestjs/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class SimonService {
  constructor() {
    this.intervalRobotChoice();
  }

  private subjectLed: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public observableLed: Observable<string> = this.subjectLed.asObservable();
  private subjectTaskCompleted: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  public observableTaskCompleted: Observable<boolean> =
    this.subjectTaskCompleted.asObservable();

  private leds: string[] = ['led1', 'led2', 'led3', 'led4'];
  private level: number;
  private robotChoice: string;
  private humanChoice: string;
  private countCheck: number;
  private winNumber = 20;
  private isEnable = false;

  startSimon(): void {
    this.level = 1;
    this.robotChoice = '';
    this.humanChoice = '';
    this.countCheck = 0;
    this.isEnable = true;
    this.choiceRobot();
  }

  choiceHuman(choice: string): void {
    switch (choice) {
      case 'led1':
        this.scoreIncrement(choice);
        break;
      case 'led2':
        this.scoreIncrement(choice);
        break;
      case 'led3':
        this.scoreIncrement(choice);
        break;
      case 'led4':
        this.scoreIncrement(choice);
        break;
    }
    if (this.countCheck === this.winNumber) {
      this.endGame();
    }
  }

  private scoreIncrement(choice: string) {
    this.robotChoice === choice
      ? this.countCheck++
      : (this.countCheck = this.countCheck - 5);
  }

  private intervalRobotChoice() {
    setInterval(() => {
      const randomNumber = Math.floor(Math.random() * 7);
      if (randomNumber === 3) {
        this.choiceRobot();
      }
    }, 500);
  }

  private choiceRobot(): void {
    if (this.isEnable) {
      this.robotChoice =
        this.leds[Math.floor(Math.random() * this.leds.length)];
      this.subjectLed.next(this.robotChoice);
    }
  }

  private endGame() {
    this.subjectTaskCompleted.next(true);
    this.isEnable = false;
  }
}
