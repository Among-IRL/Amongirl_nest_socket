import { Injectable } from '@nestjs/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class DesabotageService {
  private isPress1 = false;
  private isPress2 = false;

  private subjectStatus: BehaviorSubject<string> = new BehaviorSubject<string>(
    '',
  );
  public observableStatus: Observable<string> =
    this.subjectStatus.asObservable();

  public onPressedDesabotage1(isPressed: boolean): void {
    this.isPress1 = isPressed;
    this.getStatusDesabotage();
  }

  public onPressedDesabotage2(isPressed: boolean): void {
    this.isPress2 = isPressed;
    this.getStatusDesabotage();
  }

  private getStatusDesabotage() {
    if (this.isPress1 && this.isPress2) {
      this.subjectStatus.next('green');
      this.isPress1 = false;
      this.isPress2 = false;
    } else if (
      (this.isPress1 && !this.isPress2) ||
      (this.isPress2 && !this.isPress1)
    ) {
      this.subjectStatus.next('yellow');
    } else {
      this.subjectStatus.next('red');
    }
  }
}
