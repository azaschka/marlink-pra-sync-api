import { ObjectUtility } from './object.utility';

describe('ObjectUtility', () => {
    describe('contain', () => {
        it.each([
            {
                source: [1, 2, 3],
                target: [2, 3, 4],
                expected: true,
            },
            {
                source: [1, 2, 3],
                target: [4, 5, 6],
                expected: false,
            },
            {
                source: [],
                target: [1, 2, 3],
                expected: false,
            },
            {
                source: [1, 2, 3],
                target: [],
                expected: false,
            },
        ])('should return $expected when source is $source and target is $target', ({ source, target, expected }) => {
            const result = ObjectUtility.contain(source, target);
            expect(result).toBe(expected);
        });
    });
});
