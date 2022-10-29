import { Injectable } from '@nestjs/common';
import { BehaviorSubject, combineLatestWith, Observable, tap } from 'rxjs';

@Injectable()
export class DesabotageService {
  constructor() {
    this.observablePress1
      .pipe(
        combineLatestWith(this.observablePress2),
        tap(([isPress1, isPress2]) => {
          this.getStatusDesabotage(isPress1, isPress2);
        }),
      )
      .subscribe();
  }

  private subjectStatus: BehaviorSubject<string> = new BehaviorSubject<string>(
    '',
  );
  public observableStatus: Observable<string> =
    this.subjectStatus.asObservable();

  private subjectPress1: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  private subjectPress2: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  private observablePress1: Observable<boolean> =
    this.subjectPress1.asObservable();
  private observablePress2: Observable<boolean> =
    this.subjectPress2.asObservable();

  public onPressedDesabotage1(isPressed: boolean): void {
    this.subjectPress1.next(isPressed);
  }

  public onPressedDesabotage2(isPressed: boolean): void {
    this.subjectPress2.next(isPressed);
  }

  private getStatusDesabotage(isPress1, isPress2) {
    if (isPress1 && isPress2) {
      this.subjectStatus.next('green');
    } else if ((isPress1 && !isPress2) || (isPress2 && !isPress1)) {
      this.subjectStatus.next('yellow');
    } else {
      this.subjectStatus.next('red');
    }
  }
}
