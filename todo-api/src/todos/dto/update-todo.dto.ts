import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateTodoDto } from './create-todo.dto.js';

export class UpdateTodoDto extends PartialType(CreateTodoDto) {
  @ApiPropertyOptional({
    description: 'Completion status of the todo',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'completed must be a boolean' })
  completed?: boolean;
}
