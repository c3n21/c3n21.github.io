import Pipe from '@/lib/fp/pipe'

function add(x: number, y: number): number {
    return x + y
}

function sub(x: number, y: number): number {
    return x - y
}

describe('Pipe', () => {
    it('should map', () => {
        expect(
            Pipe.of(10)
                .map((x: number) => add(x, 1))
                .map((x: number) => sub(x, 100)).value
        ).equals(-89)
    })

    it('should tap', () => {
        const tap = vitest.fn()

        expect(
            Pipe.of(10)
                .map((x: number) => add(x, 1))
                .tap(tap)
                .map((x: number) => sub(x, 100)).value
        ).equals(-89)

        expect(tap).toBeCalledWith(11)
        expect(tap).toBeCalledTimes(1)
    })

    it('should respect composition law', () => {
        const f = (x: number) => x + 2
        const g = (x: number) => x * 3

        const pipe = Pipe.of(5)

        const left = pipe.map((x) => g(f(x))).value
        const right = pipe.map(f).map(g).value

        expect(left).toBe(right)
    })
})
