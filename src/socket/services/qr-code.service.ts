import { Injectable } from '@nestjs/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class QrCodeService {
  private subjectTaskCompleted: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  public observableTaskCompleted: Observable<boolean> =
    this.subjectTaskCompleted.asObservable();
  private macPlayer: string;

  public onDetectQrCode(isValid: boolean) {
    this.subjectTaskCompleted.next(isValid);
  }

  startTask(macPlayer: string) {
    this.macPlayer = macPlayer;
  }

  endTask() {
    this.macPlayer = '';
  }

  getMacPlayer(): string {
    return this.macPlayer;
  }
}
