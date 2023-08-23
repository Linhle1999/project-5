import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createTask } from '../../helpers/tasks'
import { getTokenFromHeader } from '../../auth/utils'
import { CreateTaskRequest } from '../../requests'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTask: CreateTaskRequest = JSON.parse(event.body)
    const token = getTokenFromHeader(event)
    const result = await createTask(newTask, token)

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
