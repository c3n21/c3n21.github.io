import { z } from 'astro/zod'
import { zodToClass } from '../../../schemas/utils/zodToClass'

describe('zodToClass', () => {
    it('should create a valid class for the schema', () => {
        const testSchema = z.object({
            test: z.string(),
        })
        const testFieldValue = 'testValue'
        const testConstructorInput = testSchema.parse({
            test: testFieldValue,
        })
        const testConstructor = zodToClass(testSchema)
        expect(testConstructor).toBeTypeOf('function')

        const instantiatedTestClass = new testConstructor(testConstructorInput)
        expect(instantiatedTestClass.test).toBe(testFieldValue)

        const t = () => {
            return new testConstructor({
                notAvailable: 'test',
            } as any)
        }

        expect(t).throw()

        class LocalTest extends testConstructor {
            override toString(): string {
                return this.test
            }
        }

        const localInstantiatedClass = new LocalTest(testConstructorInput)

        expect(localInstantiatedClass.test).toBe(testFieldValue)
        expect(localInstantiatedClass).toBeInstanceOf(LocalTest)
        expect(localInstantiatedClass).toBeInstanceOf(testConstructor)

        expect(testConstructor.schema).toBe(testSchema)
        expect(LocalTest.schema).toBe(testSchema)
        expect(LocalTest.prototype).not.toBe(testConstructor.prototype)
    })
})
