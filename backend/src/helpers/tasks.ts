import { TaskItem } from '../models/TaskItem'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'
import { parseUserId } from '../auth/utils'
import { TaskUpdate } from '../models/TaskUpdate'
import { TasksAccess } from '../dataLayer/tasksAccess'
import { CreateTaskRequest, UpdateTaskRequest } from '../requests'

const logger = createLogger('taskBusinessLogic')
const tasksAccess = new TasksAccess()

async function createTask(request: CreateTaskRequest, token: string) {
  logger.info('create task')
  const userId = parseUserId(token)
  const taskId = uuid.v4()
  const createdAt = new Date().toString()
  const done = false

  const taskItem: TaskItem = { userId, taskId, createdAt, done, ...request }
  try {
    return { item: await tasksAccess.create(taskItem) }
  } catch (error) {
    logger.info('create error: ', error)
    createError(error)
  }
}

async function updateTask(
  id: string,
  request: UpdateTaskRequest,
  token: string
) {
  logger.info('update task')
  const taskItem: TaskUpdate = {
    name: request.name,
    dueDate: request.dueDate,
    done: request.done
  }
  try {
    return { item: await tasksAccess.update(token, id, taskItem) }
  } catch (error) {
    createError(error)
  }
}

async function deleteTask(id: string, token: string) {
  logger.info('delete task')
  try {
    return await tasksAccess.delete(token, id)
  } catch (error) {
    createError(error)
  }
}

async function getTask(id: string, token: string) {
  logger.info('get one task')
  try {
    return await tasksAccess.get(token, id)
  } catch (error) {
    createError(error)
  }
}

async function getTasks(token: string) {
  logger.info('get list task')
  try {
    return { items: await tasksAccess.getList(token) }
  } catch (error) {
    createError(error)
  }
}

export { createTask, updateTask, deleteTask, getTask, getTasks }
