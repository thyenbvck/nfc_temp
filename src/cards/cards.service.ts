import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from '../entities/card.entity';
import { CardContact } from '../entities/card_contacts.entity';
import { CardImage } from '../entities/card_images.entity';
import { Company } from '../entities/company.entity';
import { CreateCardDto, UpdateCardDto, QueryCardDto } from './dto/cards.dto';
import { log } from 'console';

@Injectable()
export class CardsService {
  private readonly logger = new Logger(CardsService.name);

  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    @InjectRepository(CardContact)
    private readonly cardContactRepository: Repository<CardContact>,
    @InjectRepository(CardImage)
    private readonly cardImageRepository: Repository<CardImage>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async create(userId: number, createCardDto: CreateCardDto): Promise<Card> {
    try {
      const {
        name,
        title,
        nickname,
        department,
        avatar,
        background,
        color_scheme,
        logo,
        custom_fields,
        is_private,
        company_id,
        contacts,
        gallery,
      } = createCardDto;

      // Create new card instance
      const newCard = this.cardRepository.create({
        name,
        title,
        nickname,
        department,
        avatar,
        background,
        color_scheme,
        logo,
        custom_fields,
        is_private: is_private || false,
        status: 'active',
        max_version: 1,
        view_count: 0,
        user: { id: userId },
      });

      // Handle company association
      if (company_id) {
        const company = await this.companyRepository.findOne({
          where: { id: company_id },
        });
        if (!company) {
          throw new BadRequestException(
            `Company with id ${company_id} not found`,
          );
        }
        newCard.company = company;
      }

      // Save the card first
      const savedCard = await this.cardRepository.save(newCard);
      console.log('Contacts in CardsService:', contacts);
      console.log('Contacts is Array:', Array.isArray(contacts));
      // Type of contacts
      console.log('Type of contacts:', typeof contacts);

      // Handle contacts
      if (contacts?.length) {
        const cardContacts = contacts.map((contact) =>
          this.cardContactRepository.create({
            ...contact,
            card: savedCard,
          }),
        );
        await this.cardContactRepository.save(cardContacts);
      }

      // Handle gallery images
      if (gallery?.length) {
        const cardImages = gallery.map((imageUrl, index) =>
          this.cardImageRepository.create({
            card: savedCard,
            image_url: imageUrl,
            display_order: index,
          }),
        );
        await this.cardImageRepository.save(cardImages);
      }

      return savedCard;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Error creating card: ${error.message}`);
      throw new InternalServerErrorException('Error creating card');
    }
  }

  async findAll(query: QueryCardDto): Promise<Card[]> {
    const {
      page = 1,
      limit = 10,
      sort,
      fields,
      name,
      company_id,
      status,
      ...filters
    } = query;

    // Xác thực tham số phân trang
    const pageNum = page;
    const limitNum = limit;
    if (pageNum < 1 || limitNum < 1) {
      throw new BadRequestException('Page and limit must be greater than 0');
    }

    const queryBuilder = this.cardRepository
      .createQueryBuilder('card')
      .leftJoinAndSelect('card.user', 'user')
      .leftJoinAndSelect('card.company', 'company')
      .leftJoinAndSelect('card.images', 'images')
      .leftJoinAndSelect('card.contacts', 'contacts');

    if (name) {
      queryBuilder.andWhere('card.name LIKE :name', {
        name: `%${name}%`,
      });
    }

    if (company_id) {
      queryBuilder.andWhere('card.company.id = :company_id', { company_id });
    }

    if (status) {
      queryBuilder.andWhere('card.status = :status', { status });
    }

    // Áp dụng bộ lọc các trường khác (nếu có)
    Object.keys(filters).forEach((key) => {
      const value = filters[key];
      if (typeof value === 'string') {
        queryBuilder.andWhere(`card.${key} LIKE :${key}`, {
          [key]: `%${value}%`,
        });
      } else {
        queryBuilder.andWhere(`card.${key} = :${key}`, { [key]: value });
      }
    });

    if (sort) {
      const sortFields = sort.split(',').map((s: string) => s.trim());
      sortFields.forEach((sortField: string) => {
        const direction = sortField.startsWith('-') ? 'DESC' : 'ASC';
        const field = sortField.startsWith('-')
          ? sortField.slice(1)
          : sortField;
        queryBuilder.addOrderBy(`card.${field}`, direction as 'ASC' | 'DESC');
      });
    }

    // Chọn các trường cụ thể nếu có
    if (fields) {
      const selectedFields = fields.split(',').map((f: string) => f.trim());
      queryBuilder.select(selectedFields.map((field) => `card.${field}`));
    }

    // Phân trang
    queryBuilder.skip((pageNum - 1) * limitNum).take(limitNum);

    const cards = await queryBuilder.getMany();
    return cards;
  }

  async findById(id: number): Promise<Card> {
    try {
      const card = await this.cardRepository.findOne({
        where: { id },
        relations: ['user', 'company', 'images', 'contacts'],
      });
      if (!card) {
        throw new NotFoundException(`Card with ID ${id} not found`);
      }
      return card;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Error finding card: ${error.message}`);
      throw new InternalServerErrorException('Error finding card');
    }
  }

  async update(id: number, updateCardDto: UpdateCardDto): Promise<Card> {
    try {
      const card = await this.cardRepository.findOne({
        where: { id },
        relations: ['images', 'contacts', 'company', 'user'],
      });

      if (!card) {
        throw new NotFoundException(`Card with id ${id} not found`);
      }

      const {
        name,
        title,
        nickname,
        department,
        avatar,
        background,
        color_scheme,
        logo,
        custom_fields,
        is_private,
        company_id,
        contacts,
        gallery,
      } = updateCardDto;

      // Update basic fields
      if (name !== undefined) card.name = name;
      if (title !== undefined) card.title = title;
      if (nickname !== undefined) card.nickname = nickname;
      if (department !== undefined) card.department = department;
      if (avatar !== undefined) card.avatar = avatar;
      if (background !== undefined) card.background = background;
      if (color_scheme !== undefined) card.color_scheme = color_scheme;
      if (logo !== undefined) card.logo = logo;
      if (custom_fields !== undefined) card.custom_fields = custom_fields;
      if (is_private !== undefined) card.is_private = is_private;

      // Handle company association
      if (company_id !== undefined) {
        if (company_id) {
          const company = await this.companyRepository.findOne({
            where: { id: company_id },
          });
          if (!company) {
            throw new BadRequestException(
              `Company with id ${company_id} not found`,
            );
          }
          card.company = company;
        }
      }

      // Save the basic card info first
      await this.cardRepository.save(card);

      // Handle contacts update
      if (contacts !== undefined) {
        await this.cardContactRepository.delete({ card: { id } });
        if (contacts?.length) {
          const cardContacts = contacts.map((contact) =>
            this.cardContactRepository.create({
              ...contact,
              card: { id },
            }),
          );
          await this.cardContactRepository.save(cardContacts);
        }
      }

      // Handle gallery images update
      if (gallery !== undefined) {
        await this.cardImageRepository.delete({ card: { id } });
        if (gallery?.length) {
          const cardImages = gallery.map((imageUrl, index) =>
            this.cardImageRepository.create({
              image_url: imageUrl,
              display_order: index,
              card: { id },
            }),
          );
          await this.cardImageRepository.save(cardImages);
        }
      }

      // Fetch and return updated card with all relations
      const updatedCard = await this.cardRepository.findOne({
        where: { id },
        relations: ['images', 'contacts', 'company', 'user'],
      });

      if (!updatedCard) {
        throw new NotFoundException(`Card with id ${id} not found`);
      }

      return updatedCard;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      this.logger.error(`Error updating card: ${error.message}`);
      throw new InternalServerErrorException('Error updating card');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const card = await this.cardRepository.findOne({
        where: { id },
      });

      if (!card) {
        throw new NotFoundException(`Card with id ${id} not found`);
      }

      await this.cardRepository.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Error deleting card: ${error.message}`);
      throw new InternalServerErrorException('Error deleting card');
    }
  }
}
