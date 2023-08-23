import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getTokenFromHeader } from '../../auth/utils'
import { deleteTask } from '../../helpers/tasks'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const taskId = event.pathParameters.taskId
    const token = getTokenFromHeader(event)

    const result = await deleteTask(taskId, token)
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
