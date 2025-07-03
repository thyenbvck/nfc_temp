import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../entities/company.entity';
import {
  CreateCompanyDto,
  UpdateCompanyDto,
  QueryCompanyDto,
} from './dto/companies.dto';

@Injectable()
export class CompaniesService {
  private readonly logger = new Logger(CompaniesService.name);
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async findAll(query: QueryCompanyDto): Promise<Company[]> {
    const { page = 1, limit = 10, sort, fields, name, ...filters } = query;

    // Xác thực tham số phân trang
    const pageNum = page;
    const limitNum = limit;
    if (pageNum < 1 || limitNum < 1) {
      throw new BadRequestException('Page and limit must be greater than 0');
    }

    const queryBuilder = this.companyRepository.createQueryBuilder('companies');

    if (name) {
      queryBuilder.andWhere('companies.name LIKE :name', {
        name: `%${name}%`,
      });
    }

    // Áp dụng bộ lọc các trường khác (nếu có)
    Object.keys(filters).forEach((key) => {
      const value = filters[key];
      if (typeof value === 'string') {
        queryBuilder.andWhere(`companies.${key} LIKE :${key}`, {
          [key]: `%${value}%`,
        });
      } else {
        queryBuilder.andWhere(`companies.${key} = :${key}`, { [key]: value });
      }
    });

    if (sort) {
      const sortFields = sort.split(',').map((s: string) => s.trim());
      sortFields.forEach((sortField: string) => {
        const direction = sortField.startsWith('-') ? 'DESC' : 'ASC';
        const field = sortField.startsWith('-')
          ? sortField.slice(1)
          : sortField;
        queryBuilder.addOrderBy(
          `companies.${field}`,
          direction as 'ASC' | 'DESC',
        );
      });
    }

    // Chọn các trường cụ thể nếu có
    if (fields) {
      const selectedFields = fields.split(',').map((f: string) => f.trim());
      queryBuilder.select(selectedFields.map((field) => `companies.${field}`));
    }

    // Phân trang
    queryBuilder.skip((pageNum - 1) * limitNum).take(limitNum);

    const companies = await queryBuilder.getMany();
    return companies;
  }

  async findOne(id: number): Promise<Company> {
    try {
      const company = await this.companyRepository.findOne({ where: { id } });
      if (!company) {
        throw new NotFoundException(`Company with ID ${id} not found`);
      }
      return company;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Error finding company: ${error.message}`);
      throw new InternalServerErrorException('Error finding company');
    }
  }

  async create(createCompanyBody: CreateCompanyDto): Promise<Company> {
    try {
      const { name, logo, description, color_scheme } = createCompanyBody;

      const existingCompany = await this.companyRepository.findOne({
        where: { name },
      });
      if (existingCompany) {
        throw new BadRequestException('Company already exists');
      }

      const newCompany = this.companyRepository.create({
        name,
        logo,
        description,
        color_scheme,
      });

      return this.companyRepository.save(newCompany);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Error creating company: ${error.message}`);
      throw new InternalServerErrorException('Error creating company');
    }
  }

  async update(
    id: number,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    try {
      const company = await this.companyRepository.findOne({
        where: { id },
      });

      if (!company) {
        throw new NotFoundException(`Company with id ${id} not found`);
      }

      const { name, logo, description, color_scheme } = updateCompanyDto;

      if (name && name !== company.name) {
        const existingCompany = await this.companyRepository.findOne({
          where: { name },
        });
        if (existingCompany && existingCompany.id !== id) {
          throw new BadRequestException(
            `Company with name "${name}" already exists`,
          );
        }
        company.name = name;
      }

      if (logo !== undefined) {
        company.logo = logo;
      }

      if (description !== undefined) {
        company.description = description;
      }

      if (color_scheme !== undefined) {
        company.color_scheme = color_scheme;
      }

      return this.companyRepository.save(company);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      this.logger.error(`Error updating company: ${error.message}`);
      throw new InternalServerErrorException('Error updating company');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const company = await this.companyRepository.findOne({
        where: { id },
      });

      if (!company) {
        throw new NotFoundException(`Company with id ${id} not found`);
      }

      await this.companyRepository.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Error deleting company: ${error.message}`);
      throw new InternalServerErrorException('Error deleting company');
    }
  }

  async removeAll(): Promise<void> {
    try {
      await this.companyRepository.clear();
    } catch (error) {
      this.logger.error(`Error deleting all companies: ${error.message}`);
      throw new InternalServerErrorException('Error deleting all companies');
    }
  }

  async removeByIds(ids: number[]): Promise<void> {
    try {
      await this.companyRepository.delete(ids);
    } catch (error) {
      this.logger.error(`Error deleting companies by IDs: ${error.message}`);
      throw new InternalServerErrorException('Error deleting companies by IDs');
    }
  }
}
