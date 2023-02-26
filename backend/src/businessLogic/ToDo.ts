import * as uuid from 'uuid';
import { parseUserId } from "../auth/utils";
import { ToDoAccess } from "../dataLayer/ToDoAccess";
import { TodoItem } from "../models/TodoItem";
import { TodoUpdate } from "../models/TodoUpdate";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";
import { createLogger } from '../utils/logger';
// import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'


// import * as createError from 'http-errors'

// TODO: Implement businessLogic 

const logger = createLogger('TodosAccess');
const toDoAccess = new ToDoAccess();

export async function getAllToDoItems(jwtToken: string): Promise<TodoItem[]> {
    logger.info('Get todos for user function called here!')
    const userId = parseUserId(jwtToken);
    return toDoAccess.getAllTodos(userId);
}

// create todo item
export async function createToDoItem(newTodo: CreateTodoRequest, jwtToken: string): Promise<TodoItem> {
    logger.info('Create todo function called here!')

    const userId = parseUserId(jwtToken);
    const todoId = uuid.v4();
    const s3BucketName = process.env.S3_BUCKET_NAME;

    const newItem = {
        userId: userId,
        todoId: todoId,
        attachmentUrl: `https://${s3BucketName}.s3.amazonaws.com/${todoId}`,
        createdAt: new Date().getTime().toString(),
        done: false,
        ...newTodo,
    }

    return await toDoAccess.createToDoItem(newItem);
}

// update todo item
export function updateToDoItem(jwtToken: string, todoId: string, updatedTodo: UpdateTodoRequest): Promise<TodoUpdate> {
    logger.info('Update todo function called here!')

    const userId = parseUserId(jwtToken);
    return toDoAccess.updateToDoItem(userId, todoId, updatedTodo);
}

//delete todo item
export function deleteToDo(jwtToken: string, todoId: string): Promise<string> {
    logger.info('Delete todo function called here!')

    const userId = parseUserId(jwtToken);
    return toDoAccess.deleteToDoItem(userId, todoId);
}

//generate upload todo item
export function generateUploadUrl(todoId: string): Promise<string> {
    logger.info('generate upload url function called here!')

    return toDoAccess.generateUploadedUrl(todoId);
}