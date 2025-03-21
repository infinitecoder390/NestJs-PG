import * as dotenv from 'dotenv';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.POSTGRES_DB_URI,
  entities: [join(__dirname, '**', '*.entity.{ts,js}')],
  synchronize: true,
  logging: true,
  namingStrategy: new SnakeNamingStrategy(),
  migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
};

export const AppDataSource = new DataSource(dataSourceOptions);
