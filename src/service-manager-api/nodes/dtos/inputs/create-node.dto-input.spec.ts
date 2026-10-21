/* eslint-disable @typescript-eslint/naming-convention -- Service Manager request body field names */
import { instanceToPlain } from 'class-transformer';
import { BusinessUnit, HypervisorType } from '../../enums';
import { CreateNodeDtoInput } from './create-node.dto-input';

/**
 * Serialises the DTO the same way HttpClientService.post and axios do before the request leaves the service:
 * instanceToPlain with excludeExtraneousValues, then JSON.
 */
function toRequestBody(dto: CreateNodeDtoInput): unknown {
    return JSON.parse(JSON.stringify(instanceToPlain(dto, { excludeExtraneousValues: true })));
}

describe('CreateNodeDtoInput', () => {
    describe('request body sent to the Service Manager (MARLINKPRA-30)', () => {
        it('should contain only site_id and business_unit when the optional fields are absent', () => {
            const body = toRequestBody(CreateNodeDtoInput.create('site-1', BusinessUnit.MT));

            expect(body).toStrictEqual({ site_id: 'site-1', business_unit: 'MT' });
        });

        it('should send the optional fields in snake case when they are provided', () => {
            const body = toRequestBody(
                CreateNodeDtoInput.create('site-1', BusinessUnit.OA, 'hypervisor-7', HypervisorType.XCPower, 42),
            );

            expect(body).toStrictEqual({
                site_id: 'site-1',
                business_unit: 'OA',
                hypervisor_id: 'hypervisor-7',
                hypervisor_type: 'XC_POWER',
                vm_id: 42,
            });
        });
    });
});
