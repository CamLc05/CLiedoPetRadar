import { IsString, IsNotEmpty, IsEmail, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateFoundPetDto {
  @IsString()
  @IsNotEmpty()
  species: string;

  @IsOptional()
  @IsString()
  breed?: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsString()
  @IsNotEmpty()
  size: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  photo_url?: string;

  @IsString()
  @IsNotEmpty()
  finder_name: string;

  @IsEmail()
  finder_email: string;

  @IsString()
  @IsNotEmpty()
  finder_phone: string;

  @IsNumber()
  lng: number;

  @IsNumber()
  lat: number;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsDateString()
  found_date: string;
}