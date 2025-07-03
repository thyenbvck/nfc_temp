import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  HttpException,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import {
  CreateCompanyDto,
  DeleteCompaniesDto,
  QueryCompanyDto,
  UpdateCompanyDto,
} from './dto/companies.dto';
import { Company } from '../entities/company.entity';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
@ApiTags('companies')
@ApiBearerAuth() 
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  async findAll(@Query() query: QueryCompanyDto): Promise<{
    success: boolean;
    statusCode: number;
    total: number;
    data: Company[] | string;
  }> {
    try {
      const response = await this.companiesService.findAll(query);
      if (response.length === 0) {
        return {
          success: true,
          statusCode: HttpStatus.OK,
          total: 0,
          data: 'No companies found',
        };
      }
      return {
        success: true,
        statusCode: HttpStatus.OK,
        total: response.length,
        data: response,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Server error',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean; statusCode: number; data: Company }> {
    try {
      const response = await this.companiesService.findOne(id);
      return {
        success: true,
        statusCode: HttpStatus.OK,
        data: response,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(
          {
            success: false,
            statusCode: HttpStatus.NOT_FOUND,
            error: `Company with ID ${id} not found`,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Server error',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createCompanyDto: CreateCompanyDto,
  ): Promise<{ success: boolean; statusCode: number; data: Company }> {
    try {
      const response = await this.companiesService.create(createCompanyDto);
      return {
        success: true,
        statusCode: HttpStatus.CREATED,
        data: response,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Server error',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ): Promise<{ success: boolean; statusCode: number; data: Company }> {
    try {
      const response = await this.companiesService.update(id, updateCompanyDto);
      return {
        success: true,
        statusCode: HttpStatus.OK,
        data: response,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(
          {
            success: false,
            statusCode: HttpStatus.NOT_FOUND,
            error: `Company with ID ${id} not found`,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Server error',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean; statusCode: number; data: string }> {
    try {
      await this.companiesService.remove(id);
      return {
        success: true,
        statusCode: HttpStatus.NO_CONTENT,
        data: `Company with ID ${id} has been deleted`,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(
          {
            success: false,
            statusCode: HttpStatus.NOT_FOUND,
            error: `Company with ID ${id} not found`,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Server error',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAll(): Promise<{
    success: boolean;
    statusCode: number;
    data: string;
  }> {
    try {
      await this.companiesService.removeAll();
      return {
        success: true,
        statusCode: HttpStatus.NO_CONTENT,
        data: 'All companies have been deleted',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Server error',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('delete-by-ids')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeByIds(
    @Body() deleteCompaniesDto: DeleteCompaniesDto,
  ): Promise<{ success: boolean; statusCode: number; data: string }> {
    try {
      const { ids } = deleteCompaniesDto;
      await this.companiesService.removeByIds(ids);
      return {
        success: true,
        statusCode: HttpStatus.NO_CONTENT,
        data: `Companies with IDs ${ids.join(', ')} have been deleted`,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Server error',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
