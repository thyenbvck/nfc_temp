import {
  Controller,
  Get,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
  Put,
  Body,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtGuard) // Yêu cầu authentication cho tất cả routes
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin', 'superadmin') // Chỉ admin và superadmin có thể xem tất cả users
  @UseGuards(RolesGuard)
  async findAll(@Request() req) {
    // Nếu là superadmin, lấy tất cả users
    // Nếu là admin, chỉ lấy users trong company của họ
    const companyId = req.user.roles.includes('superadmin')
      ? undefined
      : req.user.company?.id;

    const users = await this.usersService.findAll(companyId);
    return {
      success: true,
      data: users,
    };
  }

  @Get(':id')
  @Roles('admin', 'superadmin', 'manager')
  @UseGuards(RolesGuard)
  async findOne(@Param('id') id: string, @Request() req) {
    const user = await this.usersService.findById(+id);

    // Kiểm tra quyền truy cập
    if (
      !req.user.roles.includes('superadmin') &&
      user.company?.id !== req.user.company?.id
    ) {
      throw new ForbiddenException('Bạn không có quyền xem user này');
    }

    return {
      success: true,
      data: user,
    };
  }

  @Put(':id')
  @Roles('admin', 'superadmin')
  @UseGuards(RolesGuard)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    const user = await this.usersService.findById(+id);

    // Kiểm tra quyền: superadmin có thể update tất cả, admin chỉ update trong company
    if (
      !req.user.roles.includes('superadmin') &&
      user.company?.id !== req.user.company?.id
    ) {
      throw new ForbiddenException('Bạn không có quyền cập nhật user này');
    }

    const updatedUser = await this.usersService.update(+id, updateUserDto);
    return {
      success: true,
      data: updatedUser,
    };
  }

  @Delete(':id')
  @Roles('superadmin')
  @UseGuards(RolesGuard)
  async remove(@Param('id') id: string) {
    await this.usersService.remove(+id);
    return {
      success: true,
      message: 'User đã được xóa thành công',
    };
  }
}
