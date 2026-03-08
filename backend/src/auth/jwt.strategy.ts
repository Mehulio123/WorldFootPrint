import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      // Extract JWT from Authorization header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      
      // Don't ignore expired tokens
      ignoreExpiration: false,
      
      // Secret key to verify token signature — loaded from JWT_SECRET in .env
      secretOrKey: process.env.JWT_SECRET as string,
    });
  }

  // This runs after token is verified
  // payload = decoded JWT content
  async validate(payload: any) {
    // payload contains: { sub: userId, email: user@email.com }
    
    // Fetch user from database to make sure they still exist
    const user = await this.authService.validateUser(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException();
    }

    // This gets attached to request object as request.user
    return { userId: user.id, email: user.email };
  }
}