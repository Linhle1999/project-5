import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'
import { TaskItem } from '../models/TaskItem'
import { TaskUpdate } from '../models/TaskUpdate'
import { parseUserId } from '../auth/utils'

AWSXRay.captureAWS(AWS)
const logger = createLogger('taskAccess')

export class TasksAccess {
  dynamodb = new AWS.DynamoDB.DocumentClient()
  private tasksTable = process.env.TASKS_TABLE

  constructor() {}

  async getList(token: string): Promise<TaskItem[]> {
    logger.info('Getting all task items')
    const userId = parseUserId(token)
    const result = await this.dynamodb
      .query({
        TableName: this.tasksTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()
    logger.info(`Query response: ${JSON.stringify(result, null, 2)}`)
    return result.Items as TaskItem[]
  }

  async get(token: string, taskId: string): Promise<TaskItem> {
    logger.info(`Getting task item: ${taskId}`)
    const userId = parseUserId(token)
    const result = await this.dynamodb
      .query({
        TableName: this.tasksTable,
        KeyConditionExpression: '#userId = :userId and #taskId = :taskId',
        ExpressionAttributeValues: {
          ':userId': userId,
          ':taskId': taskId
        }
      })
      .promise()
    const taskItem = result.Items[0]
    return taskItem as TaskItem
  }

  async create(newTask: TaskItem): Promise<TaskItem> {
    logger.info(`Creating new task item: ${newTask.taskId}`)
    if (newTask.name == '') {
      throw new Error('Name cannot empty')
    }
    await this.dynamodb
      .put({
        TableName: this.tasksTable,
        Item: newTask
      })
      .promise()
    return newTask
  }

  async update(token: string, taskId: string, updateData: TaskUpdate) {
    logger.info(`Updating a task item: ${taskId}`)
    const userId = parseUserId(token)
    await this.dynamodb
      .update({
        TableName: this.tasksTable,
        Key: { userId, taskId },
        ConditionExpression: 'attribute_exists(taskId)',
        UpdateExpression: 'set #n = :n, dueDate = :due, done = :dn',
        ExpressionAttributeNames: { '#n': 'name' },
        ExpressionAttributeValues: {
          ':n': updateData.name,
          ':due': updateData.dueDate,
          ':dn': updateData.done
        }
      })
      .promise()
  }

  async delete(token: string, id: string) {
    const userId = parseUserId(token)
    try {
      await this.dynamodb
        .delete({
          TableName: this.tasksTable,
          Key: { taskId: id, userId: userId }
        })
        .promise()
      logger.info('Item deleted successfully')
    } catch (error) {
      logger.error(`Error deleting item:${error}`)
    }
  }
}
