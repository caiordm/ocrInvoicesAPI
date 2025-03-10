### **Rodando o projeto NestJS localmente**

1. **Pré-requisitos**:
   - **Node.js** instalado (versão recomendada: `v14.x.x` ou superior).
   - **NPM** como gerenciador de pacotes.
   - **NestJS CLI** (caso ainda não tenha instalado globalmente, instale com `npm i -g @nestjs/cli`).

2. **Passos para rodar o projeto**:

   1. **Clone o repositório**:
      Se você ainda não fez o clone do repositório, use o seguinte comando:
      ```bash
      git clone https://seu-repositorio-nestjs.git
      cd nome-do-diretorio
      ```

   2. **Instale as dependências**:
      No diretório do projeto, execute o comando para instalar as dependências necessárias:
      ```bash
      npm install
      ```

3. **Configuração (se necessária)**:

    1. **Instalar o Prisma**:
      No projeto NestJS, você também precisará instalar o Prisma, mas **não será necessário rodar as migrations**, pois o banco já foi configurado no Next.js.

      No NestJS, basta instalar o Prisma:
      ```bash
      npm install prisma @prisma/client
      ```

    2. **Configurar o Prisma **:
      Assim como no Next.js,  você deve configurar a conexão com o banco no arquivo `prisma/schema.prisma`. A mesma configuração de banco utilizada no Next.js será compartilhada.

    3. **Usar o Prisma Client **:
      Após rodar as migrations no Next.js, você pode usar o Prisma Client  para interagir com o banco de dados. Por exemplo, no Nest, você pode criar um serviço para acessar o banco:

      ```ts
      import { PrismaService } from './prisma.service'; // Exemplo de Serviço Prisma

      @Injectable()
      export class AppService {
        constructor(private prisma: PrismaService) {}

        async getUsers() {
          return this.prisma.user.findMany(); // Exemplo de consulta no Prisma
        }
      }
      ```

    O Prisma vai ser compartilhado entre o Next.js e o NestJS, pois ambos estarão conectando ao mesmo banco de dados e utilizando o mesmo esquema (models) definidos no arquivo `schema.prisma`.


4. **Rodando o servidor de desenvolvimento**:
  Após instalar as dependências, execute o comando para rodar o servidor NestJS:
  ```bash
  npm run start
  ```

5. **Acesse o projeto no navegador**:
      O servidor estará rodando no endereço `http://localhost:3001`.
