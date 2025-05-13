import { Injectable, Inject } from '@nestjs/common';
import { getConfig, insertOrUpdateConfig } from 'db/src/query_sql'; 
import { Pool } from 'pg';

@Injectable()
export class AppService {
  constructor(
    @Inject('DATABASE_POOL') private readonly pool: Pool,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async enableWeekendOnly(): Promise<void> {
    await insertOrUpdateConfig(this.pool, {
      key: 'weekend_only',
      valueBoolean: true,  
      valueString: null,
      valueInteger: null,
      valueDatetime: null,
      valueJsonb: null,
    });
  }

  async disableWeekendOnly(): Promise<void> {
    await insertOrUpdateConfig(this.pool, {
      key: 'weekend_only',
      valueBoolean: false,
      valueString: null,
      valueInteger: null,
      valueDatetime: null,
      valueJsonb: null,
    });
  }

  async getWeekendOnly(): Promise<boolean> {
    const config = await getConfig(this.pool, {
      key: 'weekend_only',
    });
    return config?.valueBoolean ?? false;
  }
}
