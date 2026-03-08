import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// This guard uses the JWT strategy we created
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}