import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
    documentModel: any;  // Renomeie a propriedade para algo que não conflite
}
