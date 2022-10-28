import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { GameService } from './services/game.service';
import { SimonService } from './services/simon.service';
import { DesabotageService } from './services/desabotage.service';
import { QrCodeService } from './services/qr-code.service';
import { CardSwipService } from './services/card-swip.service';
import { KeyCodeService } from './services/key-code.service';

@Module({
  imports: [],
  controllers: [],
  providers: [
    SocketGateway,
    GameService,
    SimonService,
    DesabotageService,
    QrCodeService,
    CardSwipService,
    KeyCodeService,
  ],
})
export class SocketModule { }
