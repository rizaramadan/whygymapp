import { Inject, Injectable } from '@nestjs/common';
import { getUserByEmail } from '../../db/src/query_sql'; // Import the function
import { Pool } from 'pg';

export type User = {
  id: number;
  apiId: string;
  email: string;
  username: string;
  password: string;
  roles: string[];
  fullName: string;
  picUrl: string;
};

@Injectable()
export class UsersService {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async findOneWithEmail(email: string): Promise<User | undefined> {
    const userInDb = await getUserByEmail(this.pool, { email });

    if (userInDb) {
      return {
        id: userInDb.id,
        apiId: '',
        email: '',
        username: userInDb.username,
        password: userInDb.password,
        // Trim spaces from each role after splitting
        roles: userInDb.roles.split(',').map((role) => role.trim()), // Assuming roles are stored as strings in the database
        fullName: '',
        picUrl: '',
      };
    }
    return undefined;
  }
}
