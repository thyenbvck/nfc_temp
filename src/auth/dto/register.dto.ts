import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsNotEmpty({ message: 'Password không được để trống' })
  @MinLength(6, { message: 'Password phải có ít nhất 6 ký tự' })
  password: string;

  @IsOptional()
  @IsNumber({}, { message: 'Company ID phải là số' })
  company_id?: number;
}
