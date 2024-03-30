import { z } from 'astro/zod'

interface ZodToClass<T> extends Omit<ObjectConstructor, 'constructor'> {
    readonly schema: z.ZodType<T>
    new (arg: unknown): T
}

/**
 * @description create class from zod schema.
 *
 * At the moment you can only extend the class returned by this wrapper if you want
 * to override some methods.
 */
export function zodToClass<
    TZodSchema extends z.ZodTypeAny,
    Return = z.output<TZodSchema>,
>(schema: TZodSchema): ZodToClass<Return> {
    class ZodClass {
        static schema: z.ZodType<Return> = schema
        constructor(arg: unknown) {
            Object.assign(this, schema.parse(arg))
        }
    }

    // @ts-expect-error it's not true
    return ZodClass
}
