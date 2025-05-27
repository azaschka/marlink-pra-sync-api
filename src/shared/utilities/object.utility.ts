export abstract class ObjectUtility {
    public static contain(source: number[], target: number[]): boolean {
        return source.some((item) => target.includes(item));
    }
}
