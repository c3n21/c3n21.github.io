import fs, { mkdirSync } from 'node:fs'
import cv from '@/cv.json' assert { type: 'json' }
import { Readable } from 'node:stream'
import { finished } from 'node:stream/promises'
import generateFileNameFromArtifact from '@/lib/linkedin/generateFileNameFromArtifact'

const projectsDir = 'src/assets/projects'
mkdirSync(projectsDir, { recursive: true })

cv.projects.forEach((project, project_index) =>
    project.media.forEach(async (media, media_index) => {
        const entityImage = media.thumbnail.entityImage
        const highestResolutionArtifact = entityImage.artifacts.reduce(
            (prev, current) => {
                return current.width > prev.width ? current : prev
            }
        )
        const targetPath = `${projectsDir}/${generateFileNameFromArtifact(
            highestResolutionArtifact,
            {
                MediaId: media_index,
                ProjectId: project_index,
            }
        )}`
        const resourceUrl = new URL(
            `${entityImage.rootUrl}${highestResolutionArtifact.fileIdentifyingUrlPathSegment}`
        )

        console.log(`Trying to fetch '${resourceUrl.toString()}'`)
        const response = await fetch(resourceUrl)
        if (!response.body) {
            return
        }
        console.log(`Piping to '${targetPath}'`)
        const targetPathStream = fs.createWriteStream(targetPath)
        await finished(Readable.fromWeb(response.body).pipe(targetPathStream))
    })
)
