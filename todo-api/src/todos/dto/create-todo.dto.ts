import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class CreateTodoDto {
  @ApiProperty({
    description: 'Title of the todo',
    example: 'Buy groceries',
    minLength: 1,
    maxLength: 255,
  })
  @IsString({ message: 'title must be a string' })
  @IsNotEmpty({ message: 'title must not be empty' })
  @Length(1, 255, { message: 'title must be between 1 and 255 characters' })
  title: string;

  @ApiPropertyOptional({
    description: 'Optional description of the todo',
    example: 'Milk, eggs, and bread',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString({ message: 'description must be a string' })
  @MaxLength(2000, {
    message: 'description must not exceed 2000 characters',
  })
  description?: string;
}
