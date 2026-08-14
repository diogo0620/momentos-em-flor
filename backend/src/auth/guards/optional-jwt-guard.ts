import {
    ExecutionContext,
    Injectable,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard
    extends AuthGuard('jwt') {

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request =
            context.switchToHttp().getRequest();

        const authHeader =
            request.headers.authorization;

        // No JWT → guest
        if (!authHeader) {
            request.user = null;
            return true;
        }

        // JWT presente → validar normalmente
        return (
            (await super.canActivate(
                context,
            )) as boolean
        );
    }

    handleRequest(
        err: any,
        user: any,
    ) {
        if (err) {
            throw err;
        }

        return user ?? null;
    }
}