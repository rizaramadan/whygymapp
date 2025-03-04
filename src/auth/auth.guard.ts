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

export interface CookiedRequest extends Request {
  cookies: {
    [key: string]: string; // Define the type for cookies
  };
}

interface JwtPayload {
  apiId: string;
  accessToken: string;
  refreshToken: string;
  email: string;
  roles: string[]; // Adjust based on your actual roles structure
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
    console.log('request cookie:' + request.cookies['access_token']);

    let token = this.extractTokenFromHeader(request);
    if (!token) {
      token = request.cookies['access_token'];
      if (!token) {
        console.log('token not found in both cookie and header');
        throw new UnauthorizedException();
      }
    }
    try {
      const payload: JwtPayload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = payload;
    } catch (error) {
      console.log('error auth guard');
      console.log(error);
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
