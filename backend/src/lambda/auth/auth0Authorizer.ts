import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { decode, verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { Jwt } from '../../auth/Jwt'
import * as jwkToPem from 'jwk-to-pem'
import axios from 'axios'

const logger = createLogger('auth')

const jwksUrl = 'https://linhlnq.us.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string) {
  const token = getToken(authHeader)
  logger.info('token: ', token)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  logger.info('jwt: ', jwt)

  if (jwt.header.alg !== 'RS256') {
    logger.error('Invalid authen token')
    throw new Error('Invalid authen token')
  }

  const publicKey = await getPublicKey(jwksUrl, jwt.header.kid)
  if (!publicKey) {
    logger.error('Invalid authen token')
    throw new Error('Invalid authen token')
  }

  const verifyToken = verify(token, publicKey)
  if (typeof verifyToken === 'string') {
    logger.error('Invalid authen token')
    throw new Error('Invalid authen token')
  }
  return verifyToken
}

export async function getPublicKey(jwksUrl, kid) {
  try {
    const response = await axios.get(jwksUrl)
    const jwks = response.data
    const signingKey = jwks.keys.find((key) => key.kid === kid)
    if (!signingKey) {
      throw new Error('No matching signing key found for the specified kid.')
    }
    const publicKey = jwkToPem(signingKey)

    return publicKey
  } catch (error) {
    throw error
  }
}

export function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
