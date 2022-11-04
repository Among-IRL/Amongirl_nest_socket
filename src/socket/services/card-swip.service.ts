import { Injectable } from '@nestjs/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class CardSwipService {
  private subjectTaskCompleted: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  public observableTaskCompleted: Observable<boolean> =
    this.subjectTaskCompleted.asObservable();
  private macPlayer: string;

  onDetectedCard(isDetected: boolean) {
    if (isDetected) {
      this.subjectTaskCompleted.next(isDetected);
    }
  }

  startTask(macPlayer: string) {
    this.macPlayer = macPlayer;
  }

  getMacPlayer(): string {
    return this.macPlayer;
  }

  endTask() {
    this.macPlayer = '';
  }
}
