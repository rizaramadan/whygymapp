import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { jwtConstants } from './constants';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';
import { JwtPayload } from './auth.interfaces';
import { NeedSignUpException } from './exceptions/need-signup.exception';

export interface CookiedRequest extends Request {
  cookies: {
    [key: string]: string; // Define the type for cookies
  };
}
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      // 💡 See this condition
      return true;
    }
    const request = context.switchToHttp().getRequest<CookiedRequest>();
    const path = request.path;

    let token = this.extractTokenFromHeader(request);
    if (!token) {
      token = request.cookies['access_token'];
      if (!token) {
        throw new UnauthorizedException();
      }
    }

    let needSignUp = false;
    try {
      const payload: JwtPayload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = payload;
      needSignUp = payload.needSignUp;
    } catch (error) {
      throw new UnauthorizedException();
    }

    // Skip needSignUp check for /users/* paths
    if (needSignUp && !path.startsWith('/users/') && !path.startsWith('/me')) {
      throw new NeedSignUpException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
