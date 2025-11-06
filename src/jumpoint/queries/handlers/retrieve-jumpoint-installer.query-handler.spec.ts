import { QueryBus } from '@nestjs/cqrs';
import { AxiosResponse } from 'axios';
import { RetrieveJumpointInstallerQuery } from '../retrieve-jumpoint-installer.query';
import { RetrieveJumpointInstallerQueryHandler } from './retrieve-jumpoint-installer.query-handler';

describe('RetrieveJumpointInstallerQueryHandler', () => {
    let handler: RetrieveJumpointInstallerQueryHandler;
    let queryBus: QueryBus;

    beforeEach(() => {
        queryBus = mockQueryBus();
        handler = new RetrieveJumpointInstallerQueryHandler(queryBus);
    });

    describe('execute', () => {
        it('should call the query bus with the correct parameters and return the result', async () => {
            const expectedResult = {} as AxiosResponse<NodeJS.ReadableStream>;
            jest.spyOn(queryBus, 'execute').mockResolvedValue(expectedResult);

            const result = await handler.execute(new RetrieveJumpointInstallerQuery('transaction-1', 100, 123));

            expect(result).toBe(expectedResult);
        });
    });
});

function mockQueryBus(): QueryBus {
    const queryBus = {} as QueryBus;
    queryBus.execute = jest.fn();

    return queryBus;
}
