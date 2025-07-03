import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsUrl,
  IsOptional,
  IsObject,
  IsInt,
  IsPositive,
  IsArray,
  IsNumber,
  ValidateNested,
} from 'class-validator';

export class ColorSchemeDto {
  @IsString()
  @IsNotEmpty()
  primary: string;

  @IsString()
  @IsNotEmpty()
  secondary: string;
}

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsUrl()
  @IsOptional()
  logo?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => ColorSchemeDto)
  color_scheme?: ColorSchemeDto;
}

export class UpdateCompanyDto {
  @IsString()
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @IsUrl()
  @IsOptional()
  logo?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => ColorSchemeDto)
  color_scheme?: ColorSchemeDto;
}

export class QueryCompanyDto {
  @IsInt()
  @IsPositive()
  @IsOptional()
  page?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  limit?: number;

  @IsString()
  @IsOptional()
  sort?: string;

  @IsString()
  @IsOptional()
  fields?: string;

  @IsString()
  @IsOptional()
  name?: string;
}
export class DeleteCompaniesDto {
  @IsArray()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  @IsPositive({ each: true })
  ids: number[];
}
