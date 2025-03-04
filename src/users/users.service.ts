import { Inject, Injectable } from '@nestjs/common';
import { getUserByEmail } from '../../db/src/query_sql'; // Import the function
import { Pool } from 'pg';

export type User = {
  id: number;
  username: string;
  password: string;
  roles: string[];
};

@Injectable()
export class UsersService {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async findOneWithEmail(email: string): Promise<User | undefined> {
    const userInDb = await getUserByEmail(this.pool, { email });
    console.log('findOneWithEmail userInDb:', userInDb);

    if (userInDb) {
      return {
        id: userInDb.id,
        username: userInDb.username,
        password: userInDb.password,
        roles: userInDb.roles.split(','), // Assuming roles are stored as strings in the database
      };
    }
    return undefined;
  }
}
