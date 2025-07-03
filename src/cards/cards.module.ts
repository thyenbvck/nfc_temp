import { Module } from '@nestjs/common';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from 'src/entities/company.entity';
import { Card } from 'src/entities/card.entity';
import { CardContact } from 'src/entities/card_contacts.entity';
import { MediaModule } from 'src/media/media.module';
import { CardImage } from 'src/entities/card_images.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, Card, CardContact, CardImage]),
    MediaModule,
  ],
  controllers: [CardsController],
  providers: [CardsService],
})
export class CardsModule {}
