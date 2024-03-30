import { z } from 'astro/zod'
import { stringDateOrDate } from './stringDateOrDate'
import { zodToClass } from './utils/zodToClass'

const schema = z.object({
    start: stringDateOrDate,
    end: stringDateOrDate.optional(),
})

export class Period extends zodToClass(schema) {
    private static readonly defaultEnd = new Date()
    /**
     * @description Returns a string representation of the period
     */
    override toString() {
        return this.end
            ? `${this.start.toLocaleDateString()} - ${this.end.toLocaleDateString()}`
            : `${this.start.toLocaleDateString()} - Present`
    }

    /**
     * @description Sorts two periods in ascending.
     * Ascending is determined by the start date of the period.
     * If the start date is the same, the period with the earlier end date is considered to be smaller.
     */
    public static ascending(a: Period, b: Period) {
        return (
            a.start.getTime() -
            b.start.getTime() -
            ((b.end?.getTime() ?? this.defaultEnd.getTime()) -
                (a.end?.getTime() ?? this.defaultEnd.getTime()))
        )
    }

    public static descending(a: Period, b: Period) {
        return this.ascending(b, a)
    }
}

export const period = schema.transform((arg) => new Period(arg))
