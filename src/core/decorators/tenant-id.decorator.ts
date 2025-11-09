import { applyDecorators, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';
import { Request } from 'express';

export const TENANT_ID_HEADER = 'X-Tenant-Id';

export function ApiTenantIdHeader() {
    return applyDecorators(
        ApiHeader({
            name: TENANT_ID_HEADER,
            description: 'The identifier for the tenant making the request.',
            required: true,
            schema: {
                type: 'number',
            },
        }),
    );
}

export const TenantIdHeader = createParamDecorator((_data: unknown, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const tenantIdValue = request.headers[TENANT_ID_HEADER.toLowerCase()] as string;

    if (!tenantIdValue) {
        throw new Error(`Missing required header: ${TENANT_ID_HEADER}`);
    }

    const tenantId = Number(tenantIdValue);
    if (isNaN(tenantId) || !Number.isInteger(tenantId) || tenantId <= 0) {
        throw new Error(`Invalid ${TENANT_ID_HEADER} value: must be a positive integer`);
    }

    return tenantId;
});
