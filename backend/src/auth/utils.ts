import { decode } from 'jsonwebtoken'

import { APIGatewayProxyEvent } from 'aws-lambda'
import { getToken } from '../lambda/auth/auth0Authorizer'

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function parseUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken)
  return decodedJwt?.sub as string
}

export function getTokenFromHeader(event: APIGatewayProxyEvent) {
  const authorizationHeader = event.headers.Authorization
  return getToken(authorizationHeader)
}
