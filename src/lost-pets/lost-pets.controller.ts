import { Controller, Post, Body, Get } from '@nestjs/common';
import { LostPetsService } from './lost-pets.service';
import { CreateLostPetDto } from './dto/create-lost-pet.dto';

@Controller('lost-pets')
export class LostPetsController {
  constructor(private readonly lostPetsService: LostPetsService) {}

  @Post()
  create(@Body() dto: CreateLostPetDto) {
    return this.lostPetsService.create(dto);
  }

  @Get()
  async getActiveLostPets() {
    return this.lostPetsService.findActiveLostPets();
  }
}
