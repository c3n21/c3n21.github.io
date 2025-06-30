type AsyncPipe<T> = Omit<Pipe<T>, 'map'>

export default class Pipe<T> {
    private constructor(public readonly value: T) {}

    public static of<T extends Promise<any>>(arg: T): AsyncPipe<T>
    public static of<T>(arg: T): Pipe<T>
    public static of<T>(arg: T): Pipe<T> {
        return new Pipe(arg)
    }

    public map<R>(fn: (arg: T) => Awaited<R>): Pipe<R>
    public map<R>(fn: (arg: T) => R): AsyncPipe<R>
    public map<R>(fn: (arg: T) => R): Pipe<R> {
        if (this.value instanceof Promise) {
            throw new Error('Use .mapAsync() instead.')
        }
        return new Pipe(fn(this.value))
    }

    public async mapAsync<R>(fn: (arg: T) => R): Promise<Pipe<R>> {
        let value = this.value
        if (value instanceof Promise) {
            value = await value
        }
        return Pipe.of(fn(value))
    }

    public tap(fn: (arg: T) => void): this {
        fn(this.value)
        return this
    }
}
