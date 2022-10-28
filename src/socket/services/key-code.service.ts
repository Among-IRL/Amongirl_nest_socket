import { Injectable } from '@nestjs/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class KeyCodeService {
  private subjectTaskCompleted: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  public observableTaskCompleted: Observable<boolean> =
    this.subjectTaskCompleted.asObservable();

  private allowedValues: string[] = ["A", "B", "C", "D", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]
  private keysValues: string[] = ["65", "66", "67", "68", "49", "50", "51", "52", "53", "54", "55", "56", "57", "48"]
  private codeArray: string[];
  private codeEntered: string[];
  private countCheck: number;
  private isValidCode: boolean = false;

  startKeyCode(): void {
    this.codeArray = [];
    this.codeEntered = [];
    this.countCheck = 0;
    this.generateRandomCode();
  }

  private generateRandomCode(): void {
    for (this.countCheck = 0; this.countCheck < 4; this.countCheck++) {
      this.codeArray.push(this.keysValues[Math.floor(Math.random() * (12 - 0 + 1))]);
    }

    console.log('KeyCode à rentrer : ', this.codeArray);
  }

  onKeyPressed(keyPressed: string) {
    console.log('Key pressed : ', keyPressed);

    if (keyPressed && this.codeEntered.length < 4) {
      this.codeEntered.push(keyPressed.toString())
    }

    console.log('Code de l\'humain : ', this.codeEntered)

    if (this.countCheck === 3 && this.codeEntered.length === 4) {
      this.isValidCode = JSON.stringify(this.codeEntered) === JSON.stringify(this.codeArray) ? true : false;
    }

    console.log('Valide ? ', this.isValidCode);

    if (!this.isValidCode && JSON.stringify(this.codeArray) !== JSON.stringify(this.codeEntered)) {
      this.codeEntered.length === 4 && this.startKeyCode();
    } else {
      this.endGame();
    }
  }

  endGame() {
    console.log('COMPLETED !');
    this.subjectTaskCompleted.next(true);
  }
}
