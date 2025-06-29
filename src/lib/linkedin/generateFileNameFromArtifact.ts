import cv from '@/cv.json' assert { type: 'json' }

type Artifact =
    (typeof cv)['projects'][number]['media'][number]['thumbnail']['entityImage']['artifacts'][number]

type Options = {
    ProjectId: number
    MediaId: number
}

export default function generateFileNameFromArtifact(
    artifact: Artifact,
    { MediaId, ProjectId }: Options
): string {
    return `${ProjectId}_${MediaId}_${artifact.width}x${artifact.height}.jpg`
}
