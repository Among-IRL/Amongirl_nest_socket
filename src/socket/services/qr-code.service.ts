import { Injectable } from '@nestjs/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class QrCodeService {
  private subjectTaskCompleted: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  public observableTaskCompleted: Observable<boolean> =
    this.subjectTaskCompleted.asObservable();

  public endTask() {
    this.subjectTaskCompleted.next(true);
  }
}
