import { NestFactory } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppModule } from '@/app.module';
import { NestApplication } from '@nestjs/core';
import * as httpsServer from '@/server/https.service';
import { ClusterService } from '@/server/cluster.service';
import { NestApplicationOptions } from '@nestjs/common';

const bootstrap = async () => {
  ConfigModule.forRoot({
    envFilePath: `.env${process.env.NODE_ENV ? '.' + process.env.NODE_ENV : ''}`,
  });

  const PORT = process.env.PORT || 4000;
  const HOST = process.env.HOST || 'localhost';
  const protocol = process.env.PROTOCOL;

  const options: NestApplicationOptions = {};
  const app: NestApplication = await NestFactory.create<NestApplication>(
    AppModule,
    options,
  );

  app.getHttpAdapter().getInstance().disable('x-powered-by');
  app.enableCors();
  app.useBodyParser('json', { limit: '10mb' });

  const server = await httpsServer.createHttpsServer(app);

  if (server) {
    server.listen(PORT);
  } else {
    await app.listen(PORT);
  }

  console.log(`
  🚀  NestJs GraphQL API server, launched at ${protocol}://${HOST}:${PORT}/graphql`);
};

console.log(process.env.CLUSTER_MODE);

if (process.env.CLUSTER_MODE === 'true') {
  ClusterService.clusterize(bootstrap);
} else {
  bootstrap();
}