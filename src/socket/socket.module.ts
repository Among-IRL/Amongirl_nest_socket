import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { GameService } from './services/game.service';

@Module({
  imports: [],
  controllers: [],
  providers: [SocketGateway, GameService],
})
export class SocketModule {}
