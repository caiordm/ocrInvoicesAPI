import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from 'prisma/prisma.service'; // Serviço do Prisma
import { env } from 'process';
import * as tesseract from 'tesseract.js'; // Biblioteca para OCR
import { UpdateDocumentSummaryDto } from './dto/document.dto';

@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) {}

  // Criar e salvar o documento
  async createDocument(userId: string, file: Express.Multer.File) {
    const ocrText = await this.processOCR(file);

    // Salvar o documento no banco de dados
    const document = await this.prisma.document.create({
      data: {
        userId,
        filename: file.originalname,
        ocrText,
      },
    });

    return document;
  }

  // Processar OCR
  private async processOCR(file: Express.Multer.File): Promise<string> {
    const text = await tesseract.recognize(file.buffer, 'eng', {
      logger: (m) => console.log(m),
    });
    return text.data.text; // Retorna o texto extraído
  }

  // Listar documentos por userId
  async findDocumentsByUser(userId: string) {
    return this.prisma.document.findMany({
      where: { userId },
    });
  }

  async findDocumentById(id: string) {
    return await this.prisma.document.findUnique({
      where: { id },
    });
  }

  async deleteDocument(id: string) {
    return await this.prisma.document.delete({
      where: { id },
    });
  }

  private async getSummaryFromGemini(text: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=' +
      apiKey;

    const prompt = `Resuma o seguinte texto em no máximo 150 palavras: \n\n${text}`;

    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    };

    try {
      const response = await axios.post(apiUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        const summary = response.data.candidates[0]?.content?.parts[0]?.text;

        // Garantir que o valor de summary é uma string
        if (!summary) {
          throw new Error('Resumo não encontrado na resposta da API');
        }

        console.log('Resumo:', summary);
        return summary; // Agora sabemos que é uma string
      } else {
        console.error(
          'Erro ao chamar a API Gemini:',
          response.status,
          response.statusText,
        );
        throw new Error(
          `Erro na API Gemini: ${response.status} - ${response.statusText}`,
        );
      }
    } catch (error) {
      console.error('Erro ao resumir texto:', error);
      throw error;
    }
  }

  // Função que vai chamar o modelo Gemini para gerar o resumo
  async processAndSaveSummary(
    file: Express.Multer.File,
    userId: string,
  ): Promise<any> {
    // Extrair o texto do arquivo (OCR)
    const text = await this.processOCR(file);

    // Obter o resumo do modelo LLM (Gemini)
    const summary: string = await this.getSummaryFromGemini(text);

    // Agora, salvar o resumo no banco
    const document = await this.prisma.document.create({
      data: {
        userId, // Defina o userId corretamente
        filename: file.originalname, // Adicionando nome do arquivo
        ocrText: text, // Texto completo extraído
        summary, // O resumo gerado pelo Gemini
      },
    });

    // console.log('Documento criado:', document);
    // console.log('Summary criado:', document.summary);
    return document;
  }

  async processQuestion(summary: string, question: string): Promise<string> {
    // Aqui você pode usar o Gemini ou outro modelo de NLP para gerar a resposta
    // Vou usar um exemplo básico para simular a resposta
    const answer = this.getAnswerFromGemini(
      'Com base nesse sumario: ' +
        summary +
        ', Responda essa pergunta, sendo conciso, e usando formatação de texto simples: ' +
        question,
    );
    return answer;
  }

  // Função para obter a resposta do Gemini com base no prompt
  private async getAnswerFromGemini(prompt: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=' +
      apiKey;

    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    };

    try {
      const response = await axios.post(apiUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        const answer = response.data.candidates[0]?.content?.parts[0]?.text;

        if (!answer) {
          throw new Error('Resposta não encontrada na resposta da API');
        }

        return answer;
      } else {
        throw new Error(
          `Erro na API Gemini: ${response.status} - ${response.statusText}`,
        );
      }
    } catch (error) {
      console.error('Erro ao responder à pergunta:', error);
      throw error;
    }
  }
}
