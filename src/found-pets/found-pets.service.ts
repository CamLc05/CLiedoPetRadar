import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { FoundPet } from '../core/entities/found-pet.entity';
import { CreateFoundPetDto } from './dto/create-found-pet.dto';
import { LostPetsService } from '../lost-pets/lost-pets.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class FoundPetsService {
  constructor(
    @InjectRepository(FoundPet)
    private readonly foundPetRepo: Repository<FoundPet>,
    private readonly dataSource: DataSource,
    private readonly lostPetsService: LostPetsService,
    private readonly emailService: EmailService,
  ) {}

  async create(dto: CreateFoundPetDto): Promise<FoundPet> {
    const result = await this.dataSource.query(
      `INSERT INTO found_pets (
          species, breed, color, size, description, photo_url,
          finder_name, finder_email, finder_phone,
          location, address, found_date, created_at, updated_at
      ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9,
          ST_SetSRID(ST_MakePoint($10, $11), 4326),
          $12, $13, NOW(), NOW()
      ) RETURNING *`,
      [
        dto.species,
        dto.breed ?? null,
        dto.color,
        dto.size,
        dto.description,
        dto.photo_url ?? null,
        dto.finder_name,
        dto.finder_email,
        dto.finder_phone,
        dto.lng,
        dto.lat,
        dto.address,
        dto.found_date,
      ],
    );

    const foundPet = result[0];
    const nearbyLostPets = await this.lostPetsService.findNearby(dto.lat, dto.lng);

    for (const lostPet of nearbyLostPets) {
      const html = this.emailService.buildFoundPetEmail(
        { ...foundPet, found_lng: dto.lng, found_lat: dto.lat },
        { ...lostPet },
      );

      await this.emailService.sendEmail({
        to: lostPet.owner_email,
        subject: `🐾 PetRadar - Encontraron una mascota cerca de donde perdiste a ${lostPet.name}`,
        html,
      });
    }
    return foundPet;
  }
}