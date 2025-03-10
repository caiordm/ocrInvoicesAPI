// document.dto.ts
export class CreateDocumentDto {
  userId: string; // Recebe o userId da requisição
  file: Express.Multer.File; // Arquivo enviado
}

export class UpdateDocumentSummaryDto {
  summary: string; // Resumo gerado
}
