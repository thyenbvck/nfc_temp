import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  HttpStatus,
  HttpException,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CardsService } from './cards.service';
import { MediaService } from '../media/media.service';
import { CreateCardDto, UpdateCardDto, QueryCardDto } from './dto/cards.dto';
import { Card } from '../entities/card.entity';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
@ApiTags('cards')
@ApiBearerAuth() 
@Controller('cards')
export class CardsController {
  constructor(
    private readonly cardsService: CardsService,
    private readonly mediaService: MediaService,
  ) {}

  @Get()
  async findAll(@Query() query: QueryCardDto): Promise<{
    success: boolean;
    total: number;
    data: Card[] | string;
  }> {
    try {
      const response = await this.cardsService.findAll(query);
      if (response.length === 0) {
        return {
          success: true,
          total: 0,
          data: 'No cards found',
        };
      }
      return {
        success: true,
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
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean; data: Card }> {
    try {
      const response = await this.cardsService.findById(id);
      return { success: true, data: response };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(
          {
            success: false,
            statusCode: HttpStatus.NOT_FOUND,
            error: `Card with ID ${id} not found`,
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

  // Create a card
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'avatar', maxCount: 1 },
        { name: 'background', maxCount: 1 },
        { name: 'logo', maxCount: 1 },
        { name: 'gallery', maxCount: 15 },
      ],
      {
        storage: memoryStorage(),
        limits: { fileSize: 10 * 1024 * 1024 },
      },
    ),
  )
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createCardDto: CreateCardDto,
    @UploadedFiles()
    files: {
      avatar?: Express.Multer.File[];
      background?: Express.Multer.File[];
      logo?: Express.Multer.File[];
      gallery?: Express.Multer.File[];
    },
  ): Promise<{ success: boolean; statusCode: number; data: Card }> {
    try {
      const userId = 1;
      const mediaUrls: Partial<{
        avatar: string;
        background: string;
        logo: string;
        gallery: string[];
      }> = {};
      console.log('createCardDto.contacts (raw):', createCardDto.contacts);
      if (files.avatar?.[0]) {
        mediaUrls.avatar = await this.mediaService.processMedia(
          files.avatar[0],
          'avatar',
          userId,
        );
      }
      if (files.background?.[0]) {
        mediaUrls.background = await this.mediaService.processMedia(
          files.background[0],
          'background',
          userId,
        );
      }
      if (files.logo?.[0]) {
        mediaUrls.logo = await this.mediaService.processMedia(
          files.logo[0],
          'logo',
          userId,
        );
      }
      if (files.gallery?.length) {
        mediaUrls.gallery = await this.mediaService.processGalleryImages(
          files.gallery,
          userId,
        );
      }

      // try {
      //   if (typeof createCardDto.contacts === 'string') {
      //     console.log('createCardDto.contacts', createCardDto.contacts);

      //     createCardDto.contacts = JSON.parse(createCardDto.contacts);
      //   }
      //   if (typeof createCardDto.custom_fields === 'string') {
      //     createCardDto.custom_fields = JSON.parse(createCardDto.custom_fields);
      //   }
      //   if (typeof createCardDto.color_scheme === 'string') {
      //     createCardDto.color_scheme = JSON.parse(createCardDto.color_scheme);
      //   }
      // } catch (e) {
      //   throw new HttpException(
      //     {
      //       success: false,
      //       statusCode: HttpStatus.BAD_REQUEST,
      //       error: 'Invalid JSON format in form-data fields',
      //     },
      //     HttpStatus.BAD_REQUEST,
      //   );
      // }

      const card = await this.cardsService.create(userId, {
        ...createCardDto,
        ...mediaUrls,
      });

      return {
        success: true,
        statusCode: HttpStatus.CREATED,
        data: card,
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
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'avatar', maxCount: 1 },
        { name: 'background', maxCount: 1 },
        { name: 'logo', maxCount: 1 },
        { name: 'gallery', maxCount: 15 },
      ],
      {
        storage: memoryStorage(),
        limits: { fileSize: 10 * 1024 * 1024 },
      },
    ),
  )
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCardDto: UpdateCardDto,
    @UploadedFiles()
    files: {
      avatar?: Express.Multer.File[];
      background?: Express.Multer.File[];
      logo?: Express.Multer.File[];
      gallery?: Express.Multer.File[];
    },
  ): Promise<{ success: boolean; statusCode: number; data: Card }> {
    try {
      const userId = 1;
      const mediaUrls: Partial<{
        avatar: string;
        background: string;
        logo: string;
        gallery: string[];
      }> = {};

      if (files.avatar?.[0]) {
        mediaUrls.avatar = await this.mediaService.processMedia(
          files.avatar[0],
          'avatar',
          userId,
        );
      }
      if (files.background?.[0]) {
        mediaUrls.background = await this.mediaService.processMedia(
          files.background[0],
          'background',
          userId,
        );
      }
      if (files.logo?.[0]) {
        mediaUrls.logo = await this.mediaService.processMedia(
          files.logo[0],
          'logo',
          userId,
        );
      }
      if (files.gallery?.length) {
        mediaUrls.gallery = await this.mediaService.processGalleryImages(
          files.gallery,
          userId,
        );
      }

      const card = await this.cardsService.update(id, {
        ...updateCardDto,
        ...mediaUrls,
      });

      return {
        success: true,
        statusCode: HttpStatus.OK,
        data: card,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(
          {
            success: false,
            statusCode: HttpStatus.NOT_FOUND,
            error: `Card with ID ${id} not found`,
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
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean; data: string }> {
    try {
      await this.cardsService.delete(id);
      return {
        success: true,
        data: `Card with ID ${id} has been deleted`,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(
          {
            success: false,
            statusCode: HttpStatus.NOT_FOUND,
            error: `Card with ID ${id} not found`,
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
}
