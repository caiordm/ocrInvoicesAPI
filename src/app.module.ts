import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DocumentController } from './document/document.controller';
import { DocumentService } from './document/document.service';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  imports: [],
  controllers: [AppController, DocumentController],
  providers: [AppService, DocumentService, PrismaService],
})
export class AppModule {}
