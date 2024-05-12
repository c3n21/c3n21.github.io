import { expect } from 'vitest'
import { getCVInformation } from './getCVInformation'

const json_parse_spy = vi.spyOn(JSON, 'parse')
import.meta.env.CV_JSON = '{}'

test('getCVInformation', () => {
    const cvInformation = getCVInformation()
    expect(cvInformation).toStrictEqual({})
    for (let i = 0; i < 10; i++) {
        expect(getCVInformation()).toBe(cvInformation)
    }
    expect(json_parse_spy).toHaveBeenCalledTimes(1)
})
