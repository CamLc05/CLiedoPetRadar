import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envs } from './config/envs';
import { LostPet } from './core/entities/lost-pet.entity';
import { FoundPet } from './core/entities/found-pet.entity';
import { LostPetsModule } from './lost-pets/lost-pets.module';
import { FoundPetsModule } from './found-pets/found-pets.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: envs.DB_HOST,
      port: envs.DB_PORT,
      username: envs.DB_USER,
      password: envs.DB_PASSWORD,
      database: envs.DB_NAME,
      entities: [LostPet, FoundPet],
      synchronize: true, // solo para desarrollo
    }),
    LostPetsModule,
    FoundPetsModule,
    EmailModule,
  ],
})
export class AppModule {}