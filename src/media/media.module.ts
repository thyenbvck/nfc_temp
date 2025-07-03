import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { CloudinaryProvider } from './providers/cloudinary.provider';

@Module({
  providers: [MediaService, CloudinaryProvider],
  exports: [MediaService],
})
export class MediaModule {}
