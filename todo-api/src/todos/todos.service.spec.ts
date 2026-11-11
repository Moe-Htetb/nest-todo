import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ILike } from 'typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryTodoDto } from './dto/query-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';
import { Todo } from './entities/todo.entity.js';
import { TodosService } from './todos.service.js';

describe('TodosService', () => {
  let service: TodosService;

  let repository: {
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    findAndCount: ReturnType<typeof vi.fn>;
    findOneBy: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  const todoId = '0b9c443b-3d3f-4a3e-9f52-8f4bd4a7bf2e';

  const makeTodo = (overrides: Partial<Todo> = {}): Todo =>
    ({
      id: todoId,
      title: 'Buy groceries',
      description: 'Milk, eggs, and bread',
      completed: false,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      ...overrides,
    }) as Todo;

  beforeEach(async () => {
    repository = {
      create: vi.fn(),
      save: vi.fn(),
      findAndCount: vi.fn(),
      findOneBy: vi.fn(),
      delete: vi.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: getRepositoryToken(Todo),
          useValue: repository,
        },
      ],
    }).compile();

    service = moduleRef.get(TodosService);
  });

  describe('create', () => {
    it('creates a todo with completed set to false', async () => {
      const todo = makeTodo();
      repository.create.mockReturnValue(todo);
      repository.save.mockResolvedValue(todo);

      const result = await service.create({
        title: 'Buy groceries',
        description: 'Milk, eggs, and bread',
      });

      expect(repository.create).toHaveBeenCalledWith({
        title: 'Buy groceries',
        description: 'Milk, eggs, and bread',
        completed: false,
      });
      expect(repository.save).toHaveBeenCalledWith(todo);
      expect(result).toEqual(todo);
    });

    it('defaults the description to null when not provided', async () => {
      const todo = makeTodo({ description: null });
      repository.create.mockReturnValue(todo);
      repository.save.mockResolvedValue(todo);

      await service.create({ title: 'Buy groceries' });

      expect(repository.create).toHaveBeenCalledWith({
        title: 'Buy groceries',
        description: null,
        completed: false,
      });
    });
  });

  describe('findAll', () => {
    it('returns todos with pagination metadata using defaults', async () => {
      const todos = [makeTodo(), makeTodo()];
      repository.findAndCount.mockResolvedValue([todos, 2]);

      const result = await service.findAll(new QueryTodoDto());

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: {},
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });
      expect(result.data).toEqual(todos);
      expect(result.meta).toEqual({
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    it('applies pagination from the page and limit query parameters', async () => {
      repository.findAndCount.mockResolvedValue([[makeTodo()], 25]);

      const result = await service.findAll({
        page: 3,
        limit: 10,
      } as QueryTodoDto);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: {},
        order: { createdAt: 'DESC' },
        skip: 20,
        take: 10,
      });
      expect(result.meta.total).toBe(25);
      expect(result.meta.totalPages).toBe(3);
      expect(result.meta.hasNextPage).toBe(false);
      expect(result.meta.hasPreviousPage).toBe(true);
    });

    it('filters by completion status', async () => {
      repository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({
        completed: true,
      } as QueryTodoDto);

      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { completed: true },
        }),
      );
    });

    it('searches by title case-insensitively', async () => {
      repository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({
        search: 'groceries',
      } as QueryTodoDto);

      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { title: ILike('%groceries%') },
        }),
      );
    });

    it('escapes LIKE wildcards in the search term', async () => {
      repository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({
        search: '50% off_now',
      } as QueryTodoDto);

      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { title: ILike('%50\\% off\\_now%') },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('returns the todo when it exists', async () => {
      const todo = makeTodo();
      repository.findOneBy.mockResolvedValue(todo);

      const result = await service.findOne(todoId);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: todoId });
      expect(result).toEqual(todo);
    });

    it('throws a NotFoundException when the todo does not exist', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(todoId)).rejects.toThrow(
        new NotFoundException(`Todo with id "${todoId}" was not found`),
      );
    });
  });

  describe('update', () => {
    it('updates the provided fields and saves the todo', async () => {
      const existing = makeTodo();
      const updated = makeTodo({
        title: 'New title',
        completed: true,
      });
      repository.findOneBy.mockResolvedValue(existing);
      repository.save.mockResolvedValue(updated);

      const result = await service.update(todoId, {
        title: 'New title',
        completed: true,
      } as UpdateTodoDto);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: todoId });
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: todoId,
          title: 'New title',
          completed: true,
        }),
      );
      expect(result).toEqual(updated);
    });

    it('does not overwrite fields that are not provided', async () => {
      const existing = makeTodo();
      repository.findOneBy.mockResolvedValue(existing);
      repository.save.mockResolvedValue(existing);

      await service.update(todoId, { description: null } as UpdateTodoDto);

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          title: existing.title,
          description: null,
          completed: existing.completed,
        }),
      );
    });

    it('throws a NotFoundException when the todo does not exist', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(
        service.update(todoId, { completed: true } as UpdateTodoDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes the todo when it exists', async () => {
      repository.delete.mockResolvedValue({ affected: 1, raw: [] });

      await expect(service.remove(todoId)).resolves.toBeUndefined();

      expect(repository.delete).toHaveBeenCalledWith(todoId);
    });

    it('throws a NotFoundException when the todo does not exist', async () => {
      repository.delete.mockResolvedValue({ affected: 0, raw: [] });

      await expect(service.remove(todoId)).rejects.toThrow(
        new NotFoundException(`Todo with id "${todoId}" was not found`),
      );
    });
  });
});
