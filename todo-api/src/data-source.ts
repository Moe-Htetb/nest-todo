import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Todo } from './todos/entities/todo.entity.js';

const isProduction = process.env.NODE_ENV === 'production';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [Todo],
  migrations: [`${import.meta.dirname}/migrations/*{.ts,.js}`],
  synchronize: false,
  logging: isProduction ? ['error'] : false,
});
