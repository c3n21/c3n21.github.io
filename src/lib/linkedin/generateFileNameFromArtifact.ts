export type Artifact = {
    width: number
    height: number
    fileIdentifyingUrlPathSegment: string
}

type Options = {
    ProjectId: number
    MediaId: number
}

/**
 * @description Generates a file name for an artifact based on its properties and the provided options.
 * It's not actually a jpg but it's good enough to trick vite's file globber to import it
 * as image; it will eventually figure out the actual format.
 */
export default function generateFileNameFromArtifact(
    artifact: Artifact,
    { MediaId, ProjectId }: Options
): string {
    return `${ProjectId}_${MediaId}_${artifact.width}x${artifact.height}.jpg`
}
