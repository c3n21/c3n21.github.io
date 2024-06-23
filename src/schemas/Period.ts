import { z } from 'astro/zod'
import { stringDateOrDate } from './stringDateOrDate'
import { zodToClass } from './utils/zodToClass'

const schema = z.object({
    start: stringDateOrDate,
    end: stringDateOrDate.optional(),
})

export class Period extends zodToClass(schema) {
    override toString() {
        return this.end
            ? `${this.start.toLocaleDateString()} - ${this.end.toLocaleDateString()}`
            : `${this.start.toLocaleDateString()} - Present`
    }
}

export const period = schema.transform((arg) => new Period(arg))
