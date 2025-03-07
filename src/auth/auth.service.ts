import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User, UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    username: string,
    pass: string,
  ): Promise<{ access_token: string; roles: string[] }> {
    const isUserValid = await this.usersService.checkUserCredentials(
      username,
      pass,
    );
    if (!isUserValid) {
      throw new UnauthorizedException();
    } else {
      const user: User = await this.usersService.findOneWithUsername(
        username,
      ) as User;
      const payload = {
        sub: user.id,
        username: user.username,
        roles: user.roles,
      };
      return {
        access_token: await this.jwtService.signAsync(payload),
        roles: user.roles,
      };
    }
  }
}
