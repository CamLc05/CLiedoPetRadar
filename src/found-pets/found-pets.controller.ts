import { Controller, Post, Body, Get } from '@nestjs/common';
import { FoundPetsService } from './found-pets.service';
import { CreateFoundPetDto } from './dto/create-found-pet.dto';

@Controller('found-pets')
export class FoundPetsController {
  constructor(private readonly foundPetsService: FoundPetsService) {}

  @Get()
  async getFoundPets() {
    return this.foundPetsService.findAllFoundPets();
  }

  @Post()
  create(@Body() dto: CreateFoundPetDto) {
    return this.foundPetsService.create(dto);
  }
}