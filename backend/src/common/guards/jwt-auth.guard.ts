import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Wraps the 'jwt' passport strategy — use this decorator on any protected route
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') { }
