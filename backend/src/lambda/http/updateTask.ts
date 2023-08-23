import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getTokenFromHeader } from '../../auth/utils'
import { updateTask } from '../../helpers/tasks'
import { UpdateTaskRequest } from '../../requests'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const taskId = event.pathParameters.taskId
    const updatedTask: UpdateTaskRequest = JSON.parse(event.body)
    const token = getTokenFromHeader(event)

    const result = await updateTask(taskId, updatedTask, token)
    return {
      statusCode: 200,
      body: JSON.stringify(result)
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
