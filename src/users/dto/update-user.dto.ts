import { IsOptional, IsEmail, IsString, IsEnum } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE'], {
    message: 'Status phải là ACTIVE hoặc INACTIVE',
  })
  status?: 'ACTIVE' | 'INACTIVE';

  @IsOptional()
  company_id?: number;
}
