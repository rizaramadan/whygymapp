import { Inject, Injectable } from '@nestjs/common';
import { Role } from 'src/roles/role.enum';
import { getAllUsersRoles } from '../../db/src/query_sql'; // Import the function
import { Pool } from 'pg';

export type User = {
  id: number;
  username: string;
  password: string;
  roles: Role[];
};

@Injectable()
export class UsersService {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async findOne(username: string): Promise<User | undefined> {
    const usersWithRoles = await getAllUsersRoles(this.pool); // Call the database function
    const userRow = usersWithRoles.find((user) => user.username === username);

    if (userRow) {
      return {
        id: userRow.id,
        username: userRow.username,
        password: userRow.password,
        roles: [userRow.role as Role], // Assuming roles are stored as strings in the database
      };
    }
    return undefined;
  }

  async findOneWithEmail(email: string): Promise<User | undefined> {
    const usersWithRoles = await getAllUsersRoles(this.pool); // Call the database function
    const userRow = usersWithRoles.find((user) => user.email === email);

    if (userRow) {
      return {
        id: userRow.id,
        username: userRow.username,
        password: userRow.password,
        roles: [userRow.role as Role], // Assuming roles are stored as strings in the database
      };
    }
    return undefined;
  }
}
