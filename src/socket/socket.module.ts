import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { GameService } from './services/game.service';
import { SimonService } from './services/simon.service';
import { DesabotageService } from './services/desabotage.service';
import { QrCodeService } from './services/qr-code.service';
import { CardSwipService } from './services/card-swip.service';

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
  ],
})
export class SocketModule {}
