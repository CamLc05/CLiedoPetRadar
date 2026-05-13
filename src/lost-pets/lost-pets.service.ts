import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { LostPet } from '../core/entities/lost-pet.entity';
import { CreateLostPetDto } from './dto/create-lost-pet.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class LostPetsService {
  constructor(
    @InjectRepository(LostPet)
    private readonly lostPetRepo: Repository<LostPet>,
    private readonly dataSource: DataSource,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async create(dto: CreateLostPetDto): Promise<LostPet> {
    const result = await this.dataSource.query(
      `INSERT INTO lost_pets (
          name, species, breed, color, size, description, photo_url,
          owner_name, owner_email, owner_phone,
          location, address, lost_date, is_active, created_at, updated_at
      ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10,
          ST_SetSRID(ST_MakePoint($11, $12), 4326),
          $13, $14, $15, NOW(), NOW()
      ) RETURNING *`,
      [
        dto.name,
        dto.species,
        dto.breed,
        dto.color,
        dto.size,
        dto.description,
        dto.photo_url ?? null,
        dto.owner_name,
        dto.owner_email,
        dto.owner_phone,
        dto.lng,
        dto.lat,
        dto.address,
        dto.lost_date,
        dto.is_active ?? true,
      ],
    );

    // Invalidar caché al crear
    await this.cacheManager.del('lost_pets_active');

    return result[0] as LostPet;
  }

  async findActiveLostPets(): Promise<LostPet[]> {
    const cacheKey = 'lost_pets_active';

    const cached = await this.cacheManager.get<LostPet[]>(cacheKey);
    if (cached) {
      console.log('✅ [CACHE HIT] lost_pets_active');
      return cached;
    }

    console.log('🔍 [CACHE MISS] Consultando BD para lost_pets_active');
    const pets = await this.dataSource.query(
      `SELECT *,
          ST_X(location::geometry) AS lng,
          ST_Y(location::geometry) AS lat
       FROM lost_pets
       WHERE is_active = true
       ORDER BY created_at DESC`,
    );

    await this.cacheManager.set(cacheKey, pets, 60000);
    return pets as LostPet[];
  }

  async findNearby(lat: number, lng: number, radiusMeters = 500): Promise<LostPet[]> {
    const result = await this.dataSource.query(
      `SELECT *,
          ST_X(location::geometry) AS lost_lng,
          ST_Y(location::geometry) AS lost_lat,
          ST_Distance(
            location::geography,
            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
          ) AS distance
      FROM lost_pets
      WHERE is_active = true
        AND ST_DWithin(
          location::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          $3
        )
      ORDER BY distance ASC`,
      [lng, lat, radiusMeters],
    );

    return result as LostPet[];
  }
}