import ObjectUtils from './ObjectUtils';

describe('ObjectUtils', () => {
    describe('isObjectsEquals', () => {
        it('should return true for identical objects', () => {
            const obj1 = { a: 1, b: 2 };
            const obj2 = { a: 1, b: 2 };
            expect(ObjectUtils.isObjectsEquals(obj1, obj2)).toBe(true);
        });

        it('should return false for objects with different keys', () => {
            const obj1 = { a: 1, b: 2 };
            const obj2 = { a: 1, c: 2 };
            expect(ObjectUtils.isObjectsEquals(obj1, obj2)).toBe(false);
        });

        it('should return false for objects with different values', () => {
            const obj1 = { a: 1, b: 2 };
            const obj2 = { a: 1, b: 3 };
            expect(ObjectUtils.isObjectsEquals(obj1, obj2)).toBe(false);
        });

        it('should return true for nested identical objects', () => {
            const obj1 = { a: 1, b: { c: 2 } };
            const obj2 = { a: 1, b: { c: 2 } };
            expect(ObjectUtils.isObjectsEquals(obj1, obj2)).toBe(true);
        });

        it('should return false for nested objects with different values', () => {
            const obj1 = { a: 1, b: { c: 2 } };
            const obj2 = { a: 1, b: { c: 3 } };
            expect(ObjectUtils.isObjectsEquals(obj1, obj2)).toBe(false);
        });

        it('should return false when one object is null', () => {
            const obj1 = { a: 1, b: 2 };
            const obj2 = null;
            expect(ObjectUtils.isObjectsEquals(obj1, obj2)).toBe(false);
        });

        it('should return true for the same object reference', () => {
            const obj1 = { a: 1, b: 2 };
            expect(ObjectUtils.isObjectsEquals(obj1, obj1)).toBe(true);
        });
    });
});