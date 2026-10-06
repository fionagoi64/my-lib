import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Authentication token is missing');
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'fallback-secret-key-12345',
      });
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { role: true },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Authentication token is no longer valid');
      }

      // Roles are read from the database for every protected request so a
      // demotion takes effect immediately, rather than when the JWT expires.
      request['user'] = { sub: user.id, email: user.email, role: user.role.name };
    } catch {
      throw new UnauthorizedException('Invalid or expired authentication token');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer') {
      return token;
    }

    // Native EventSource cannot send an Authorization header. This fallback is
    // deliberately limited to the notification stream and is used only over
    // HTTPS in deployed environments. The client reconnects with the current
    // short-lived access token.
    if (request.path === '/notification/stream') {
      const streamToken = request.query.access_token;
      return typeof streamToken === 'string' ? streamToken : undefined;
    }

    return undefined;
  }
}
