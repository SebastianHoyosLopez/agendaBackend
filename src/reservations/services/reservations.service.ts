import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReservationsEntity } from '../entities/reservations.entity';
import {
  DeleteResult,
  FindOneOptions,
  MoreThan,
  // MoreThan,
  Repository,
  UpdateResult,
} from 'typeorm';
import { ReservationDTO, ReservationUpdateDTO } from '../dto/reservation.dto';
import { ErrorManager } from 'src/utils/error.manager';
import { UsersReservationsEntity } from 'src/users/entities/usersReservations.entity';
import { UsersService } from 'src/users/services/users.service';
import { ACCESS_LEVEL } from 'src/constants/roles';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(ReservationsEntity)
    private readonly reservationRepository: Repository<ReservationsEntity>,
    @InjectRepository(UsersReservationsEntity)
    private readonly userReservationRepository: Repository<UsersReservationsEntity>,
    private readonly usersService: UsersService,
  ) {}

  public async findOne(
    filter: FindOneOptions<ReservationsEntity>,
  ): Promise<ReservationsEntity> {
    return await this.reservationRepository.findOne(filter);
  }

  public async createReservation(
    body: ReservationDTO,
    userId: string,
  ): Promise<any> {
    try {
      const user = await this.usersService.findUsersById(userId);

      const reservationExist = await this.findOne({
        where: { date: body.date, hour: body.hour },
      });
      if (reservationExist) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message:
            'Debes agregar una hora diferente mayor o menor al horario que estás agregando como minimo una hora de diferencia',
        });
      }

      const reservation = await this.reservationRepository.save(body);

      return await this.userReservationRepository.save({
        accessLevel: ACCESS_LEVEL.OWNER,
        user: user,
        reservation,
      });
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findReservations(): Promise<ReservationsEntity[]> {
    const currentDate = new Date();
    const yesterday = new Date(currentDate);
    yesterday.setDate(currentDate.getDate() - 1);

    const reservations = await this.reservationRepository
      .createQueryBuilder('reservations')
      .leftJoinAndSelect('reservations.usersIncludes', 'usersIncludes')
      .leftJoinAndSelect('usersIncludes.user', 'user')
      .where({
        date: MoreThan(yesterday.toISOString()),
      })
      .orderBy('date', 'ASC')
      .addOrderBy('hour', 'ASC')
      .getMany(); // <-- Ejecutar la consulta y obtener los resultados

    return reservations;
    // try {
    //   const reservations: ReservationsEntity[] =
    //     await this.reservationRepository.find({
    //       relations: ['usersIncludes.user', 'earrings'],
    //       order: { date: 'ASC', hour: 'ASC' },
    //       where: { date: MoreThan(yesterday.toISOString()) },
    //     });
    //   if (reservations.length === 0) {
    //     throw new ErrorManager({
    //       type: 'BAD_REQUEST',
    //       message: 'No se encontro resultados',
    //     });
    //   }
    //   return reservations;
    // } catch (error) {
    //   throw ErrorManager.createSignatureError(error.message);
    // }
  }

  public async findReservationsById(id: string): Promise<ReservationsEntity> {
    try {
      const reservation: ReservationsEntity = await this.reservationRepository
        .createQueryBuilder('reservation')
        .where({ id })
        .leftJoinAndSelect('reservation.usersIncludes', 'usersIncludes')
        .leftJoinAndSelect('usersIncludes.user', 'user')
        .leftJoinAndSelect('reservation.earrings', 'earrings')
        .getOne();
      if (!reservation) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se encontro resultados',
        });
      }
      return reservation;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateReservation(
    body: ReservationUpdateDTO,
    id: string,
  ): Promise<UpdateResult | undefined> {
    try {
      const reservation: UpdateResult = await this.reservationRepository.update(
        id,
        body,
      );
      if (reservation.affected === 0) return undefined;
      return reservation;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteReservation(
    reservationId: string,
    relationId: string,
  ): Promise<DeleteResult | undefined> {
    try {
      await this.usersService.deleteRelation(relationId);

      const reservation: DeleteResult =
        await this.reservationRepository.delete(reservationId);

      if (reservation.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo borrar',
        });
      }
      return reservation;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
