import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

function resolveDatabaseUrl(): string {
  // If explicitly configured with non-file URL (e.g. Postgres / MySQL)
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith("file:")) {
    return process.env.DATABASE_URL;
  }

  // On Vercel / AWS Lambda serverless execution, the app directory is read-only.
  // SQLite database must be placed in /tmp for full write permissions.
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDbPath = "/tmp/dev.db";

    if (!fs.existsSync(tmpDbPath)) {
      const candidates = [
        path.join(process.cwd(), "prisma", "dev.db"),
        path.join(process.cwd(), "dev.db"),
        path.resolve("./prisma/dev.db"),
        path.resolve("./dev.db")
      ];

      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          try {
            fs.copyFileSync(candidate, tmpDbPath);
            console.log(`[lib/db] Copied SQLite database to ${tmpDbPath} from ${candidate}`);
            break;
          } catch (err) {
            console.error(`[lib/db] Error copying DB from ${candidate}:`, err);
          }
        }
      }
    }

    if (fs.existsSync(tmpDbPath)) {
      return `file:${tmpDbPath}`;
    }
  }

  // Local / standard Node execution: resolve absolute path to prisma/dev.db or dev.db
  const prismaDb = path.join(process.cwd(), "prisma", "dev.db");
  const rootDb = path.join(process.cwd(), "dev.db");

  if (fs.existsSync(prismaDb)) {
    return `file:${prismaDb}`;
  }
  if (fs.existsSync(rootDb)) {
    return `file:${rootDb}`;
  }

  return process.env.DATABASE_URL || `file:${prismaDb}`;
}

const resolvedDbUrl = resolveDatabaseUrl();
process.env.DATABASE_URL = resolvedDbUrl;

export const prisma =
  global.prismaGlobal ||
  new PrismaClient({
    datasources: {
      db: {
        url: resolvedDbUrl
      }
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  global.prismaGlobal = prisma;
}

export default prisma;
