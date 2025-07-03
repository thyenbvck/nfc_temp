import { Transform, Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsUrl,
  IsOptional,
  IsObject,
  IsBoolean,
  IsInt,
  IsEnum,
  ValidateNested,
  IsArray,
} from 'class-validator';

// Custom validator để parse và validate contacts
function ParseContacts() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        throw new Error('Invalid JSON format for contacts');
      }
    }
    return value;
  });
}
export class ColorSchemeDto {
  @IsString()
  @IsNotEmpty()
  primary: string;

  @IsString()
  @IsNotEmpty()
  secondary: string;
}

export class CardContactDto {
  @IsEnum([
    'phone',
    'email',
    'website',
    'address',
    'zalo',
    'facebook',
    'linkedin',
    'bank',
  ])
  type:
    | 'phone'
    | 'email'
    | 'website'
    | 'address'
    | 'zalo'
    | 'facebook'
    | 'linkedin'
    | 'bank';

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  value: string;

  @IsBoolean()
  @IsOptional()
  is_primary?: boolean;
}

export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  title?: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  nickname?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  department?: string;

  @IsUrl()
  @IsOptional()
  avatar?: string;

  @IsUrl()
  @IsOptional()
  background?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => ColorSchemeDto)
  color_scheme?: ColorSchemeDto;

  @IsUrl()
  @IsOptional()
  logo?: string;

  @IsObject()
  @IsOptional()
  custom_fields?: object;

  @IsBoolean()
  @IsOptional()
  is_private?: boolean;

  @IsInt()
  @IsOptional()
  company_id?: number;

  @IsOptional()
  @ParseContacts()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CardContactDto)
  contacts?: CardContactDto[];

  @IsArray()
  @IsOptional()
  gallery?: string[];
}
// Add this to your existing cards.dto.ts file
export class UpdateCardDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  title?: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  nickname?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  department?: string;

  @IsUrl()
  @IsOptional()
  avatar?: string;

  @IsUrl()
  @IsOptional()
  background?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => ColorSchemeDto)
  color_scheme?: ColorSchemeDto;

  @IsUrl()
  @IsOptional()
  logo?: string;

  @IsObject()
  @IsOptional()
  custom_fields?: object;

  @IsBoolean()
  @IsOptional()
  is_private?: boolean;

  @IsInt()
  @IsOptional()
  company_id?: number;

  @IsOptional()
  @ParseContacts()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CardContactDto)
  contacts?: CardContactDto[];

  @IsArray()
  @IsOptional()
  gallery?: string[];
}
export class QueryCardDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsString()
  fields?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  company_id?: string;

  @IsOptional()
  @IsString()
  status?: 'active' | 'inactive';
}
