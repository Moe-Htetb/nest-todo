import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { QueryTodoDto } from './dto/query-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';
import { Todo } from './entities/todo.entity.js';
import { PaginatedResult, TodosService } from './todos.service.js';

export class DeleteTodoResponse {
  message: string;
}

export class PaginatedTodosResponse implements PaginatedResult<Todo> {
  data: Todo[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

@ApiTags('todos')
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new todo' })
  @ApiBody({ type: CreateTodoDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The todo has been successfully created.',
    type: Todo,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed for the request body.',
  })
  create(@Body() createTodoDto: CreateTodoDto): Promise<Todo> {
    return this.todosService.create(createTodoDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List todos with optional filtering and pagination',
  })
  @ApiOkResponse({
    description: 'A paginated list of todos.',
    type: PaginatedTodosResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid query parameters.',
  })
  findAll(@Query() query: QueryTodoDto): Promise<PaginatedResult<Todo>> {
    return this.todosService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single todo by id' })
  @ApiOkResponse({
    description: 'The todo with the requested id.',
    type: Todo,
  })
  @ApiNotFoundResponse({ description: 'No todo with the given id exists.' })
  @ApiBadRequestResponse({ description: 'The id is not a valid UUID.' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Todo> {
    return this.todosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing todo' })
  @ApiBody({ type: UpdateTodoDto })
  @ApiOkResponse({
    description: 'The todo has been successfully updated.',
    type: Todo,
  })
  @ApiNotFoundResponse({ description: 'No todo with the given id exists.' })
  @ApiBadRequestResponse({
    description: 'The id is not a valid UUID or validation failed.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTodoDto: UpdateTodoDto,
  ): Promise<Todo> {
    return this.todosService.update(id, updateTodoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a todo' })
  @ApiOkResponse({
    description: 'The todo has been successfully deleted.',
    type: DeleteTodoResponse,
  })
  @ApiNotFoundResponse({ description: 'No todo with the given id exists.' })
  @ApiBadRequestResponse({ description: 'The id is not a valid UUID.' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DeleteTodoResponse> {
    await this.todosService.remove(id);
    return { message: `Todo with id "${id}" was deleted successfully` };
  }
}
