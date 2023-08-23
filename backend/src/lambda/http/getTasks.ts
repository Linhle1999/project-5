import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getTokenFromHeader } from '../../auth/utils'
import { getTasks } from '../../helpers/tasks'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const token = getTokenFromHeader(event)

    const result = await getTasks(token)
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
