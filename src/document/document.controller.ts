import {
  Controller,
  Post,
  Body,
  Param,
  Put,
  UploadedFile,
  UseInterceptors,
  Get,
  NotFoundException,
  Delete,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import {
  CreateDocumentDto,
  UpdateDocumentSummaryDto,
} from './dto/document.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  // Rota para fazer upload do documento
  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // Intercepta o arquivo enviado
  async uploadDocument(
    @Body() body: CreateDocumentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // Aqui você processaria o arquivo (OCR, etc.)
    // return this.documentService.createDocument(body.userId, file);
    const document = await this.documentService.processAndSaveSummary(
      file,
      body.userId,
    );
    return document;
  }

  // Rota para permitir perguntas sobre o conteúdo da imagem
  @Post(':id/question')
  async askQuestion(
    @Param('id') id: string,
    @Body() body: { question: string },
  ) {
    // Buscar o documento pelo ID
    const document = await this.documentService.findDocumentById(id);

    // Se não encontrar o documento, retorna um erro 404
    if (!document) {
      throw new NotFoundException('Documento não encontrado.');
    }

    // Obter o resumo do documento
    const summary = document.summary;

    // Verificar se há um resumo salvo
    if (!summary) {
      throw new NotFoundException('Resumo do documento não encontrado.');
    }

    // Processar a pergunta com base no resumo
    const answer = await this.documentService.processQuestion(
      summary,
      body.question,
    );

    return { answer };
  }

  @Get('user/:userId')
  async getDocumentsByUser(@Param('userId') userId: string) {
    return this.documentService.findDocumentsByUser(userId);
  }

  @Delete(':id')
  async deleteDocument(@Param('id') id: string) {
    console.log(`Tentando deletar documento com ID: ${id}`);
    return this.documentService.deleteDocument(id);
  }
}
