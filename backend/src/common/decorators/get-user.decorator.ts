import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Custom decorator to extract the user from the JWT payload cleanly
// Usage: @GetUser() user — instead of @Req() req and then req.user
export const GetUser = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);
