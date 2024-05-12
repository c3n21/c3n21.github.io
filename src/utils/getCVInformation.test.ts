import { expect } from 'vitest'
import { getCVInformation } from './getCVInformation'
import { cvInformation } from '../schemas/CVInformation.ts'
const ENV_VAR = 'CV_JSON' as const
const BAD_JSONS = ['{}', ''] as const
const EXPECTED_JSON = {
    About: 'TEST ABOUT',
    Contacts: [
        {
            logo: 'TEST_LOGO',
            profile_url: 'TEST_PROFILE_URL',
        },
    ],
    Education: [
        {
            location: 'TEST_URL',
            major: 'TEST_MAJOR',
            period: {
                start: new Date('2019-01-08T23:00:00.000Z'),
            },
        },
    ],
    Projects: [],
    'Skills & Knowledge': ['Dunno'],
}

const OK_JSON = JSON.stringify(EXPECTED_JSON)

describe.each(BAD_JSONS)('getCVInformation with not valid JSON', (input) => {
    beforeEach(() => {
        vi.stubEnv(ENV_VAR, input)
    })
    test(`input '${input}'`, () => {
        expect(() => getCVInformation()).toThrowError()
        //expect(getCVInformation()).toThrowError()
    })
})

describe('getCVInformation with valid JSON', () => {
    const cvInformationSchemaSpy = vi.spyOn(cvInformation, 'parse')

    beforeAll(() => {
        vi.clearAllMocks()
    })

    beforeEach(() => {
        vi.stubEnv(ENV_VAR, OK_JSON)
    })
    test('getCVInformation', () => {
        const cvInformation = getCVInformation()
        expect(cvInformation).toStrictEqual(EXPECTED_JSON)
        for (let i = 0; i < 10; i++) {
            expect(getCVInformation()).toBe(cvInformation)
        }
        expect(cvInformationSchemaSpy).toHaveBeenCalledTimes(1)
    })
})
