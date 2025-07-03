import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as validator from 'validator';
import { User } from '../entities/user.entity';
import { UserDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, password: string): Promise<User> {
    if (!validator.isEmail(email)) {
      throw new BadRequestException('Invalid email');
    }

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      status: 'ACTIVE',
    });
    return this.userRepository.save(user);
  }

  async login(email: string, password: string): Promise<{ token: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new BadRequestException('Invalid credentials');
    }

    const token = this.jwtService.sign({ userId: user.id });
    return { token };
  }

  async findAll(companyId?: number): Promise<UserDto[]> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.company', 'company')
      .leftJoinAndSelect('user.userRoles', 'userRoles')
      .leftJoinAndSelect('userRoles.role', 'role');

    // Nếu có companyId, chỉ lấy users của company đó
    if (companyId) {
      queryBuilder.where('company.id = :companyId', { companyId });
    }

    const users = await queryBuilder.getMany();

    // Transform và map roles
    return users.map((user) => {
      const roles = user.userRoles?.map((ur) => ur.role.name) || [];
      const userDto = plainToClass(UserDto, {
        ...user,
        roles,
        company: user.company
          ? {
              id: user.company.id,
              name: user.company.name,
            }
          : null,
      });
      return userDto;
    });
  }

  async findById(id: number): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['company', 'userRoles', 'userRoles.role'],
    });

    if (!user) {
      throw new NotFoundException(`User với ID ${id} không tồn tại`);
    }

    const roles = user.userRoles?.map((ur) => ur.role.name) || [];
    return plainToClass(UserDto, {
      ...user,
      roles,
      company: user.company
        ? {
            id: user.company.id,
            name: user.company.name,
          }
        : null,
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['company', 'userRoles', 'userRoles.role'],
    });

    if (!user) {
      throw new NotFoundException(`User với ID ${id} không tồn tại`);
    }

    // Cập nhật thông tin user
    Object.assign(user, updateUserDto);

    const updatedUser = await this.userRepository.save(user);

    const roles = updatedUser.userRoles?.map((ur) => ur.role.name) || [];
    return plainToClass(UserDto, {
      ...updatedUser,
      roles,
      company: updatedUser.company
        ? {
            id: updatedUser.company.id,
            name: updatedUser.company.name,
          }
        : null,
    });
  }

  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User với ID ${id} không tồn tại`);
    }

    await this.userRepository.remove(user);
  }
}
