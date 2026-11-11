import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';

describe('Todos (e2e)', () => {
  let app: INestApplication<App>;
  let createdTodoId: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/todos', () => {
    it('creates a todo (201)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/todos')
        .send({ title: 'Write e2e tests', description: 'Cover CRUD flows' })
        .expect(201);

      expect(response.body).toMatchObject({
        title: 'Write e2e tests',
        description: 'Cover CRUD flows',
        completed: false,
      });
      expect(response.body.id).toBeDefined();
      createdTodoId = response.body.id;
    });

    it('rejects a todo without a title (400)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/todos')
        .send({})
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('rejects unknown properties (400)', async () => {
      await request(app.getHttpServer())
        .post('/api/todos')
        .send({ title: 'Valid', hackerField: 'nope' })
        .expect(400);
    });
  });

  describe('GET /api/todos', () => {
    it('returns a paginated list', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/todos')
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: 10,
      });
      expect(typeof response.body.meta.total).toBe('number');
    });

    it('filters by completion status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/todos?completed=false')
        .expect(200);

      for (const todo of response.body.data) {
        expect(todo.completed).toBe(false);
      }
    });

    it('searches by title', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/todos?search=e2e')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      for (const todo of response.body.data) {
        expect(todo.title.toLowerCase()).toContain('e2e');
      }
    });
  });

  describe('GET /api/todos/:id', () => {
    it('returns a single todo', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/todos/${createdTodoId}`)
        .expect(200);

      expect(response.body.id).toBe(createdTodoId);
    });

    it('returns 404 for a nonexistent todo', async () => {
      await request(app.getHttpServer())
        .get('/api/todos/00000000-0000-4000-8000-000000000000')
        .expect(404);
    });

    it('rejects invalid UUIDs', async () => {
      await request(app.getHttpServer())
        .get('/api/todos/not-a-uuid')
        .expect(400);
    });
  });

  describe('PATCH /api/todos/:id', () => {
    it('updates title and completed', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/todos/${createdTodoId}`)
        .send({ title: 'Write more e2e tests', completed: true })
        .expect(200);

      expect(response.body).toMatchObject({
        id: createdTodoId,
        title: 'Write more e2e tests',
        completed: true,
      });
    });

    it('returns 404 for a nonexistent todo', async () => {
      await request(app.getHttpServer())
        .patch('/api/todos/00000000-0000-4000-8000-000000000000')
        .send({ completed: true })
        .expect(404);
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('deletes the todo and confirms it', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/todos/${createdTodoId}`)
        .expect(200);

      expect(response.body.message).toContain('deleted successfully');

      await request(app.getHttpServer())
        .get(`/api/todos/${createdTodoId}`)
        .expect(404);
    });

    it('returns 404 for a nonexistent todo', async () => {
      await request(app.getHttpServer())
        .delete('/api/todos/00000000-0000-4000-8000-000000000000')
        .expect(404);
    });
  });
});
