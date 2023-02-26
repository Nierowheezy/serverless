import * as AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { Types } from 'aws-sdk/clients/s3';
// import * as AWSXRay from 'aws-xray-sdk'
import { TodoItem } from "../models/TodoItem";
import { TodoUpdate } from "../models/TodoUpdate";
import { createLogger } from '../utils/logger';
// import * as AWSXRay from 'aws-xray-sdk'
var AWSXRay = require('aws-xray-sdk');

const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger('TodosAccess');


// TODO: Implement the dataLayer logic

export class ToDoAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly s3Client: Types = new AWS.S3({ signatureVersion: 'v4' }),
        private readonly todoTable = process.env.TODOS_TABLE,
        private readonly s3TodoBucketName = process.env.S3_TODO_BUCKET_NAME
    ) {
    }

    /**
     * @Description : GET
     * @param None 
     * @returns Get Todo Items
     */

    async getAllTodos(userId: string): Promise<TodoItem[]> {
        logger.info('Get all todos function called here!')

        const result = await this.docClient.query({
            TableName: this.todoTable,
            KeyConditionExpression: "#userId = :userId",
            ExpressionAttributeNames: {
                "#userId": "userId"
            },
            ExpressionAttributeValues: {
                ":userId": userId
            }
        }).promise();

        const items = result.Items;

        return items as TodoItem[];

    }


    /**
     * @Description : POST
     * @param None 
     * @returns Create Todo Item
     */

    async createToDoItem(todoItem: TodoItem): Promise<TodoItem> {
        logger.info('Create todo function called here!');

        await this.docClient.put({
            TableName: this.todoTable,
            Item: todoItem,
        }).promise();

        return todoItem as TodoItem;
    }

    /**
   * @Description : PUT
   * @param None 
   * @returns Update Todo Item
   */

    async updateToDoItem(userId: string, todoId: string, todoUpdate: TodoUpdate): Promise<TodoUpdate> {
        logger.info('Update todo item function called here!');

        const result = await this.docClient.update({
            TableName: this.todoTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
            UpdateExpression: "set #a = :a, #b = :b, #c = :c",
            ExpressionAttributeNames: {
                "#a": "name",
                "#b": "dueDate",
                "#c": "done"
            },
            ExpressionAttributeValues: {
                ":a": todoUpdate['name'],
                ":b": todoUpdate['dueDate'],
                ":c": todoUpdate['done']
            },
            ReturnValues: "ALL_NEW"
        })
            .promise();

        logger.info(result);

        const attributes = result.Attributes;

        return attributes as TodoUpdate;
    }


    /**
  * @Description : DELETE
  * @param None 
  * @returns Delete Todo Item
  */

    async deleteToDoItem(userId: string, todoId: string): Promise<string> {
        logger.info('Delete todo item function called here!')

        await this.docClient
            .delete({
                TableName: this.todoTable,
                Key: {
                    "userId": userId,
                    "todoId": todoId
                },
            })
            .promise();

        logger.info('Todo todo item Deleted successfuly!');

        return todoId as string;

    }

    /**
* @Description 
* @param None 
* @returns Generate uploaded url
*/
    async generateUploadedUrl(todoId: string): Promise<string> {
        logger.info('generate uplaod url function called here!')

        const url = await this.s3Client.getSignedUrl('putObject', {
            Bucket: this.s3TodoBucketName,
            Key: todoId,
            Expires: 1000,
        });

        logger.info(url)

        return url as string;
    }
}
