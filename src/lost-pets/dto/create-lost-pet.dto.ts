import { IsString, IsNotEmpty, IsEmail, IsOptional, IsNumber, IsDateString, IsBoolean } from 'class-validator';

export class CreateLostPetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  species: string;

  @IsString()
  @IsNotEmpty()
  breed: string;

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
  owner_name: string;

  @IsEmail()
  owner_email: string;

  @IsString()
  @IsNotEmpty()
  owner_phone: string;

  @IsNumber()
  lng: number;

  @IsNumber()
  lat: number;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsDateString()
  lost_date: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}