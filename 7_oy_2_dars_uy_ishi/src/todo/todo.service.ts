import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Todo } from './entities/todo.entity';

@Injectable()
export class TodoService {
  constructor(@InjectModel(Todo) private todoModel: typeof Todo) {}
  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    const {title, isCompleted} = createTodoDto as any
    return this.todoModel.create({title, isCompleted})
  }

  async findAll(): Promise<Todo[]> {
    // const todos = await this.todoModel.findAll()
    return this.todoModel.findAll()
  }

  async findOne(id: number): Promise<Todo> {
    const foundedTodo = await this.todoModel.findByPk(id)

    if(!foundedTodo) throw new NotFoundException("Todo not found")
    return foundedTodo
  }

  async update(id: number, updateTodoDto: UpdateTodoDto): Promise<{message: "Updated"}> {
    const foundedTodo = await this.todoModel.findByPk(id)

    if(!foundedTodo) throw new NotFoundException("Todo not found")
      await this.todoModel.update(updateTodoDto, {where: {id}})
    return {message: "Updated"}
  }

  async remove(id: number): Promise<{message: string}> {
    const foundedTodo = await this.todoModel.findByPk(id)

    if(!foundedTodo) throw new NotFoundException("Todo not found")
    await this.todoModel.destroy({where: {id}})
    return {message: "Deleted"}
  }
}
