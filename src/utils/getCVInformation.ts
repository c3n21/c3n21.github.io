import { cvInformation, type CVInformation } from '../schemas/CVInformation'

let _cvInformation: CVInformation | null = null

export function getCVInformation(): CVInformation {
    return (_cvInformation ??= cvInformation.parse(
        JSON.parse(import.meta.env.CV_JSON)
    ))
}
