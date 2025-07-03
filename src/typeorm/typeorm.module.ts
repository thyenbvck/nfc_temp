import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as fs from 'fs';

@Module({
  imports: [
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) => ({
    //     type: 'mssql',
    //     host: configService.get<string>('DB_HOST'),
    //     port: configService.get<number>('DB_PORT'),
    //     username: configService.get<string>('DB_USERNAME'),
    //     password: configService.get<string>('DB_PASSWORD'),
    //     database: configService.get<string>('DB_DATABASE'),
    //     entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    //     synchronize: true, // Chỉ dùng trong phát triển
    //     logging: true,
    //   }),
    //   inject: [ConfigService],
    // }),
    TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    type: 'mysql',
    host: config.get('DB_HOST'),
    port: 3306,
    username: config.get('DB_USERNAME'),
    password: config.get('DB_PASSWORD'),
    database: config.get('DB_DATABASE'),
    options: {
      encrypt: true,
      trustServerCertificate: false,
    },
    ssl: {
      ca: fs.readFileSync(__dirname + '/../../cert/DigiCertGlobalRootCA.crt.pem').toString(),
    },
    synchronize: true,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  }),
})

  ],
})
export class TypeormModule {}
