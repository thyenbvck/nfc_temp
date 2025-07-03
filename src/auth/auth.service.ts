import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '../entities/user_roles.entity';
import { Role } from '../entities/roles.entity';
import { Company } from '../entities/company.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['company', 'userRoles', 'userRoles.role'],
    });

    if (!user) {
      throw new UnauthorizedException('Email không tồn tại');
    }

    // const isPasswordValid = await bcrypt.compare(password, user.password);
    // if (!isPasswordValid) {
    //   throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    // }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const roles = user.userRoles.map((ur) => ur.role.name);

    const payload = {
      sub: user.id,
      email: user.email,
      company: user.company?.id,
      roles: roles,
    };

    return {
      success: true,
      data: {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          email: user.email,
          company: user.company,
          roles: roles,
        },
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(registerDto.password);

    // Tạo user mới với company relationship
    const newUser = new User();
    newUser.email = registerDto.email;
    newUser.password = hashedPassword;
    newUser.status = 'ACTIVE';

    if (registerDto.company_id) {
      const company = new Company();
      company.id = registerDto.company_id;
      newUser.company = company;
    }

    // Lưu user
    const savedUser = await this.userRepository.save(newUser);

    // Gán role mặc định (employee)
    const employeeRole = await this.roleRepository.findOne({
      where: { name: 'employee' },
    });

    if (employeeRole) {
      const newUserRole = new UserRole();
      newUserRole.user = savedUser;
      newUserRole.role = employeeRole;
      await this.userRoleRepository.save(newUserRole);
    }

    // Tạo JWT token
    const payload = {
      sub: savedUser.id,
      email: savedUser.email,
      company: savedUser.company?.id,
      roles: ['employee'],
    };

    return {
      success: true,
      data: {
        access_token: this.jwtService.sign(payload),
        user: {
          id: savedUser.id,
          email: savedUser.email,
          company: savedUser.company,
          roles: ['employee'],
        },
      },
    };
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }
}
