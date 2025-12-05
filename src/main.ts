import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import {DocumentBuilder,SwaggerModule} from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const swaggerConfig=new DocumentBuilder()
  .setTitle('Employee Crud Api')
  .setDescription('Employee Crud Api description')
  .setVersion('1.0')
  .build();
  const document=SwaggerModule.createDocument(app,swaggerConfig);
  SwaggerModule.setup('api',app,document);
  const config = app.get(ConfigService);
  const port = config.get('PORT');
  await app.listen(port);
  console.log(`Server listening on port ${port}`);
}
bootstrap();
