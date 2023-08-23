import { TaskItem } from '../models/TaskItem'
import * as uuid from 'uuid'
import * as createError from 'http-errors'
import { parseUserId } from '../auth/utils'
import { TasksAccess } from '../dataLayer/tasksAccess'
import { TaskUpdate } from '../models/TaskUpdate'
import { CreateTaskRequest, UpdateTaskRequest } from '../requests'

const tasksAccess = new TasksAccess()

async function createTask(request: CreateTaskRequest, token: string) {
  const userId = parseUserId(token)
  const taskId = uuid.v4()
  const createdAt = new Date().toString()
  const done = false

  const taskItem: TaskItem = { userId, taskId, createdAt, done, ...request }
  try {
    return { item: await tasksAccess.create(taskItem) }
  } catch (error) {
    createError(error)
  }
}

async function updateTask(
  id: string,
  request: UpdateTaskRequest,
  token: string
) {
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
  try {
    return await tasksAccess.delete(token, id)
  } catch (error) {
    createError(error)
  }
}

async function getTask(id: string, token: string) {
  try {
    return await tasksAccess.get(token, id)
  } catch (error) {
    createError(error)
  }
}

async function getTasks(token: string) {
  try {
    return { items: await tasksAccess.getList(token) }
  } catch (error) {
    createError(error)
  }
}

export { createTask, updateTask, deleteTask, getTask, getTasks }
