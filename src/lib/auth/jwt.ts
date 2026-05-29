import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET?.replace(/^"|"$/g, "") || "dev-jwt-secret-rhythm-community-2026"
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET?.replace(/^"|"$/g, "") || "dev-jwt-refresh-secret-rhythm-community-2026"
const ACCESS_TOKEN_EXPIRY = "24h"
const REFRESH_TOKEN_EXPIRY = "7d"

export interface JWTPayload {
  userId: string
  username: string
}

export function signAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY })
}

export function signRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY })
}

export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload
  } catch {
    return null
  }
}
