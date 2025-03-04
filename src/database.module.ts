import { Module } from '@nestjs/common';
import { Pool } from 'pg';

@Module({
  providers: [
    {
      provide: 'DATABASE_POOL',
      useFactory: () => {
        return new Pool({ connectionString: process.env.DATABASE_URL });
      },
    },
  ],
  exports: ['DATABASE_POOL'],
})
export class DatabaseModule {}
