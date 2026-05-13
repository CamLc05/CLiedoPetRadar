import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { FoundPet } from '../core/entities/found-pet.entity';
import { CreateFoundPetDto } from './dto/create-found-pet.dto';
import { LostPet } from '../core/entities/lost-pet.entity';
import { LostPetsService } from '../lost-pets/lost-pets.service';
import { EmailService } from '../email/email.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class FoundPetsService {
  constructor(
    @InjectRepository(FoundPet)
    private readonly foundPetRepo: Repository<FoundPet>,
    private readonly dataSource: DataSource,
    private readonly lostPetsService: LostPetsService,
    private readonly emailService: EmailService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async create(dto: CreateFoundPetDto): Promise<{
    foundPet: FoundPet;
    nearbyLostPets: LostPet[];
  }> {
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

    const foundPet = result[0] as FoundPet;

    // Invalidar caché al crear
    await this.cacheManager.del('found_pets_all');

    // Búsqueda por radio 500m con PostGIS
    const nearbyLostPets = await this.lostPetsService.findNearby(dto.lat, dto.lng);

    // Notificar por email a dueños de mascotas perdidas cercanas
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

    return { foundPet, nearbyLostPets };
  }

  async findAllFoundPets(): Promise<FoundPet[]> {
    const cacheKey = 'found_pets_all';

    const cached = await this.cacheManager.get<FoundPet[]>(cacheKey);
    if (cached) {
      console.log('✅ [CACHE HIT] found_pets_all');
      return cached;
    }

    console.log('🔍 [CACHE MISS] Consultando BD para found_pets_all');
    const pets = await this.dataSource.query(
      `SELECT *,
          ST_X(location::geometry) AS lng,
          ST_Y(location::geometry) AS lat
       FROM found_pets
       ORDER BY created_at DESC`,
    );

    await this.cacheManager.set(cacheKey, pets, 60000);
    return pets as FoundPet[];
  }
}