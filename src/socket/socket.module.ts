import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { GameService } from './services/game.service';
import { SimonService } from './services/simon.service';

@Module({
  imports: [],
  controllers: [],
  providers: [SocketGateway, GameService, SimonService],
})
export class SocketModule {}
