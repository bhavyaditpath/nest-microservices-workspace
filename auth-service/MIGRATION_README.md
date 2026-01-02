# Auth Service Migrations

This service uses TypeORM migrations for database schema management.

## Setup

The migration configuration is already set up in:
- `src/database/data-source.ts` - TypeORM data source configuration
- `package.json` - Migration scripts added
- `src/database/migrations/` - Directory for migration files

## Available Commands

```bash
# Generate migration from entity changes
npm run typeorm:generate-migration -- -n CreateRefreshTokensTable

# Run pending migrations
npm run typeorm:run-migrations

# Show migration status
npm run typeorm:show-migrations

# Revert last migration
npm run typeorm:revert-migration
```

## Database Structure

```
src/database/
├── data-source.ts      # TypeORM data source configuration
├── index.ts           # Database exports
└── migrations/        # Migration files directory
```

## Migration Files

Migration files will be created in `src/database/migrations/` directory with timestamp prefixes.

Example migration file structure:
```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRefreshTokensTable1700000000000 implements MigrationInterface {
  name = 'CreateRefreshTokensTable1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Migration logic here
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback logic here
  }
}
```

## Entities

The data source includes:
- `UserAuth` - For user authentication (reads from shared users table)
- `RefreshToken` - For refresh token storage

Note: The `users` table is managed by the user-service. This service only manages the `refresh_tokens` table.