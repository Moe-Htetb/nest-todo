import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { QueryTodoDto } from './dto/query-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';
import { Todo } from './entities/todo.entity.js';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private readonly todosRepository: Repository<Todo>,
  ) {}

  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    const todo = this.todosRepository.create({
      title: createTodoDto.title,
      description: createTodoDto.description ?? null,
      completed: false,
    });
    return this.todosRepository.save(todo);
  }

  async findAll(query: QueryTodoDto): Promise<PaginatedResult<Todo>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [todos, total] = await this.todosRepository.findAndCount({
      where: this.buildWhere(query),
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = total > 0 ? Math.ceil(total / limit) : 0;
    return {
      data: todos,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<Todo> {
    const todo = await this.todosRepository.findOneBy({ id });
    if (!todo) {
      throw new NotFoundException(`Todo with id "${id}" was not found`);
    }
    return todo;
  }

  async update(id: string, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    const todo = await this.findOne(id);
    if (updateTodoDto.title !== undefined) {
      todo.title = updateTodoDto.title;
    }
    if (updateTodoDto.description !== undefined) {
      todo.description = updateTodoDto.description;
    }
    if (updateTodoDto.completed !== undefined) {
      todo.completed = updateTodoDto.completed;
    }
    return this.todosRepository.save(todo);
  }

  async remove(id: string): Promise<void> {
    const result = await this.todosRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Todo with id "${id}" was not found`);
    }
  }

  private buildWhere(query: QueryTodoDto): FindOptionsWhere<Todo> {
    const where: FindOptionsWhere<Todo> = {};
    if (query.completed !== undefined) {
      where.completed = query.completed;
    }
    if (query.search) {
      where.title = ILike(`%${TodosService.escapeLikePattern(query.search)}%`);
    }
    return where;
  }

  private static escapeLikePattern(value: string): string {
    return value.replace(/[\\%_]/g, '\\$&');
  }
}
