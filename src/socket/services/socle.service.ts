import { Injectable } from '@nestjs/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class SocleService {
  private subjectTaskCompleted: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  public observableTaskCompleted: Observable<boolean> =
    this.subjectTaskCompleted.asObservable();
  private subjectLed: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public observableLed: Observable<string> = this.subjectLed.asObservable();
  private randomPosition: number;
  private button: number;
  private isEnable: boolean;
  private macPlayer: string;

  public startSocle(macPlayer: string) {
    this.macPlayer = macPlayer;
    this.isEnable = false;
    do {
      this.setPositionPiece();
    } while (this.button === this.randomPosition);
    this.activateLed();
    this.isEnable = true;
  }

  private setPositionPiece() {
    this.randomPosition = Math.floor(Math.random() * 3) + 1;
  }
  public positionPiece(button: number) {
    this.button = button;
    if (this.isEnable && this.randomPosition === this.button) {
      this.subjectTaskCompleted.next(true);
    }
  }

  private activateLed() {
    this.subjectLed.next('led' + this.randomPosition);
  }

  getMacPlayer(): string {
    return this.macPlayer;
  }

  endTask() {
    this.macPlayer = '';
    this.isEnable = false;
  }
}
