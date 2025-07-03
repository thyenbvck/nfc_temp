import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  status: string;

  @Expose()
  company: {
    id: number;
    name: string;
  };

  @Expose()
  roles: string[];

  @Expose()
  created_at: Date;

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
}
