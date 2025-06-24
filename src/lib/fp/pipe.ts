export default class Pipe<T> {
    private constructor(public readonly value: T) {}

    public static of<T>(arg: T): Pipe<T> {
        return new Pipe(arg)
    }

    public map<R>(fn: (arg: T) => R): Pipe<R> {
        return new Pipe<R>(fn(this.value))
    }

    public tap(fn: (arg: T) => void): this {
        fn(this.value)
        return this
    }
}
