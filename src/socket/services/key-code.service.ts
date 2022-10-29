import { Injectable } from '@nestjs/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class KeyCodeService {
  private subjectTaskCompleted: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  public observableTaskCompleted: Observable<boolean> =
    this.subjectTaskCompleted.asObservable();

  private subjectCodeToFound: BehaviorSubject<string[]> = new BehaviorSubject<
    string[]
  >([]);
  public observableCodeToFound: Observable<string[]> =
    this.subjectCodeToFound.asObservable();

  private subjectKeyPressed: BehaviorSubject<string> =
    new BehaviorSubject<string>('');
  public observableKeyPressed: Observable<string> =
    this.subjectKeyPressed.asObservable();

  private keysValues = {
    '65': 'A',
    '66': 'B',
    '67': 'C',
    '68': 'D',
    '49': '1',
    '50': '2',
    '51': '3',
    '52': '4',
    '53': '5',
    '54': '6',
    '55': '7',
    '56': '8',
    '57': '9',
    '48': '0',
  };

  private codeArray: string[];
  private codeEntered: string[];
  private countCheck: number;
  private isValidCode = false;

  startKeyCode(): void {
    this.codeArray = [];
    this.codeEntered = [];
    this.countCheck = 0;
    this.generateRandomCode();
  }

  private generateRandomCode(): void {
    const listKeyValues = Object.values(this.keysValues);
    for (this.countCheck = 0; this.countCheck < 4; this.countCheck++) {
      this.codeArray.push(
        listKeyValues[Math.floor(Math.random() * (12 - 0 + 1))],
      );
    }
    this.subjectCodeToFound.next(this.codeArray);
  }

  onKeyPressed(keyPressed: string) {
    this.subjectKeyPressed.next(this.keysValues[keyPressed]);
    if (keyPressed && this.codeEntered.length < 4) {
      this.codeEntered.push(this.keysValues[keyPressed]);
    }

    if (this.countCheck === 3 && this.codeEntered.length === 4) {
      this.isValidCode =
        JSON.stringify(this.codeEntered) === JSON.stringify(this.codeArray);
    }

    if (
      !this.isValidCode &&
      JSON.stringify(this.codeArray) !== JSON.stringify(this.codeEntered)
    ) {
      this.codeEntered.length === 4 && this.startKeyCode();
    } else {
      this.endGame();
    }
  }

  endGame() {
    this.subjectTaskCompleted.next(true);
  }
}
