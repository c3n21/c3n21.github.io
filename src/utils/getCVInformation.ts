import type { CVInformation } from '../types/CVInformation'

let cvInformation: CVInformation | null = null

export function getCVInformation(): CVInformation {
    return (cvInformation ??= JSON.parse(import.meta.env.CV_JSON))
}
