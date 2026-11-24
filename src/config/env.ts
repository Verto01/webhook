
import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];

  if (!value || value.trim() === "") {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function parsePort(value: string): number {
  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }

  return port;
}

function validateDatabaseUrl(value: string): string {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error("DATABASE_URL must be a valid URL");
  }

  if (!["postgres:", "postgresql:"].includes(url.protocol)) {
    throw new Error("DATABASE_URL must use PostgreSQL");
  }

  return value;
}

function validateEncryptionKey(value: string): string {
  const decoded = Buffer.from(value, "base64");

  if (decoded.length !== 32) {
    throw new Error(
      "SECRETS_ENCRYPTION_KEY must contain 32 bytes encoded as base64"
    );
  }

  return value;
}

const nodeEnv = process.env.NODE_ENV ?? "development";

if (!["development", "test", "production"].includes(nodeEnv)) {
  throw new Error("Invalid NODE_ENV");
}

const allowLocalTargets = process.env.ALLOW_LOCAL_TARGETS === "true";

if (nodeEnv === "production" && allowLocalTargets) {
  throw new Error("ALLOW_LOCAL_TARGETS cannot be enabled in production");
}

export const env = {
  NODE_ENV: nodeEnv,
  PORT: parsePort(process.env.PORT ?? "3000"),
  HOST: process.env.HOST ?? "127.0.0.1",
  LOG_LEVEL: process.env.LOG_LEVEL ?? "info",
  DATABASE_URL: validateDatabaseUrl(required("DATABASE_URL")),
  TEST_DATABASE_URL: required("TEST_DATABASE_URL"),
  SECRETS_ENCRYPTION_KEY: validateEncryptionKey(
    required("SECRETS_ENCRYPTION_KEY")
  ),
  ALLOW_LOCAL_TARGETS: allowLocalTargets,
};
