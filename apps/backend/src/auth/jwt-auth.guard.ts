import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { AuthService } from './auth.service';
  
  @Injectable()
  export class JwtAuthGuard implements CanActivate {
    constructor(private auth: AuthService) {}
    canActivate(
      context: ExecutionContext
    ): boolean | Promise<boolean> | Observable<boolean> {
      const req = context.switchToHttp().getRequest();
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
          throw new UnauthorizedException({
            message: 'Пользователь не авторизован',
          });
        }
        const bearer = authHeader.split(' ')[0];
        const accessToken = authHeader.split(' ')[1];
  
        if (bearer !== 'Bearer' || !accessToken) {
          throw new UnauthorizedException({
            message: 'Пользователь не авторизован',
          });
        }
        const userData = this.auth.validateAccessToken(accessToken);
        if (!userData) {
          throw new UnauthorizedException({
            message: 'Пользователь не авторизован',
          });
        }
        req.user = userData;
        return true;
      } catch (error) {
        throw new UnauthorizedException({
          message: 'Пользователь не авторизован',
        });
      }
    }
  }