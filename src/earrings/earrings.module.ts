import { Module } from '@nestjs/common';
import { EarringsService } from './services/earrings.service';
import { EarringsController } from './controllers/earrings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EarringsEntity } from './entities/earrings.entity';
import { ReservationsEntity } from 'src/reservations/entities/reservations.entity';
import { ReservationsService } from 'src/reservations/services/reservations.service';

@Module({
  imports: [TypeOrmModule.forFeature([EarringsEntity, ReservationsEntity])],
  providers: [EarringsService, ReservationsService],
  controllers: [EarringsController],
})
export class EarringsModule {}
