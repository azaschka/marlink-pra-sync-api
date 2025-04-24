import { DateUtility } from './date.utility';

describe('DateUtility', () => {
    let currentDate: Date;

    beforeEach(() => {
        currentDate = new Date('2023-10-01T00:00:00Z');
    });

    describe('addSeconds', () => {
        it.each([
            {
                seconds: -3600,
                expectedDate: new Date('2023-09-30T23:00:00Z'),
            },
            {
                seconds: 0,
                expectedDate: new Date('2023-10-01T00:00:00Z'),
            },
            {
                seconds: 3600,
                expectedDate: new Date('2023-10-01T01:00:00Z'),
            },
        ])('should return as expected', (param: { seconds: number; expectedDate: Date }) => {
            const result = DateUtility.addSeconds(currentDate, param.seconds);

            expect(result).toEqual(param.expectedDate);
        });
    });
});
