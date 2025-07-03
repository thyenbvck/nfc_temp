import { Injectable, Inject } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class MediaService {
  constructor(
    @Inject('CLOUDINARY') private readonly cloudinaryClient: typeof cloudinary,
  ) {}

  private getTransformationConfig(type: string) {
    const baseConfig = {
      quality: 'auto',
      fetch_format: 'auto',
    };

    switch (type) {
      case 'avatar':
        return {
          ...baseConfig,
          width: 400,
          height: 400,
          crop: 'fill',
          gravity: 'face',
        };
      case 'background':
        return {
          ...baseConfig,
          width: 1920,
          height: 1080,
          crop: 'fill',
        };
      case 'logo':
        return {
          ...baseConfig,
          width: 500,
          height: 500,
          crop: 'fit',
        };
      case 'gallery':
        return {
          ...baseConfig,
          width: 1200,
          crop: 'limit',
        };
      default:
        return baseConfig;
    }
  }

  private async uploadFromBuffer(
    file: Express.Multer.File,
    folder: string,
    transformation: object,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const stream = this.cloudinaryClient.uploader.upload_stream(
        {
          folder,
          transformation,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result as UploadApiResponse);
        },
      );

      Readable.from(file.buffer).pipe(stream);
    });
  }

  async processMedia(
    file: Express.Multer.File,
    type: 'avatar' | 'background' | 'logo' | 'gallery',
    cardId: number,
  ): Promise<string> {
    try {
      const folder = `nfc_cards/${cardId}/${type}`;
      const transformation = this.getTransformationConfig(type);
      const result = await this.uploadFromBuffer(file, folder, transformation);

      return result.secure_url;
    } catch (error) {
      throw new Error(`Failed to process media: ${error.message}`);
    }
  }

  async processGalleryImages(
    files: Express.Multer.File[],
    cardId: number,
  ): Promise<string[]> {
    const maxImages = 15;
    const uploadPromises = files
      .slice(0, maxImages)
      .map((file) => this.processMedia(file, 'gallery', cardId));

    return Promise.all(uploadPromises);
  }
}
