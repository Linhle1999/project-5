import { apiEndpoint } from '../config'
import { Task } from '../types/Task'
import { CreateTaskRequest } from '../types/CreateTaskRequest'
import Axios from 'axios'
import { UpdateTaskRequest } from '../types/UpdateTaskRequest'

export async function getTasks(idToken: string): Promise<Task[]> {
  console.log('Fetching tasks')

  const response = await Axios.get(`${apiEndpoint}/todos`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`
    }
  })
  return response.data.items
}

export async function createTask(
  idToken: string,
  newTask: CreateTaskRequest
): Promise<Task> {
  const response = await Axios.post(
    `${apiEndpoint}/todos`,
    JSON.stringify(newTask),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      }
    }
  )
  return response.data?.item
}

export async function patchTask(
  idToken: string,
  todoId: string,
  updatedTask: UpdateTaskRequest
): Promise<void> {
  await Axios.patch(
    `${apiEndpoint}/todos/${todoId}`,
    JSON.stringify(updatedTask),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      }
    }
  )
}

export async function deleteTask(
  idToken: string,
  todoId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/todos/${todoId}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  todoId: string
): Promise<string> {
  const response = await Axios.post(
    `${apiEndpoint}/todos/${todoId}/attachment`,
    '',
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      }
    }
  )
  return response.data.uploadUrl
}

export async function uploadFile(
  uploadUrl: string,
  file: Buffer
): Promise<void> {
  await Axios.put(uploadUrl, file)
}
