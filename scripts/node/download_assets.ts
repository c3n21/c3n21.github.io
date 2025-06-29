import fs, { mkdirSync, rmSync } from 'node:fs'
import cv from '@/cv.json' assert { type: 'json' }
import { Readable } from 'node:stream'
import { finished } from 'node:stream/promises'
import generateFileNameFromArtifact from '@/lib/linkedin/generateFileNameFromArtifact'

const projectsDir = 'src/assets/projects'
rmSync(projectsDir, {
    recursive: true,
})
mkdirSync(projectsDir, { recursive: true })

cv.projects.forEach((project, project_index) =>
    project.media.forEach((media, media_index) => {
        const entityImage = media.thumbnail.entityImage
        entityImage.artifacts.forEach(async (artifact) => {
            const targetPath = `${projectsDir}/${generateFileNameFromArtifact(
                artifact,
                {
                    MediaId: media_index,
                    ProjectId: project_index,
                }
            )}`
            const resourceUrl = new URL(
                `${entityImage.rootUrl}${artifact.fileIdentifyingUrlPathSegment}`
            )

            console.log(`Trying to fetch '${resourceUrl.toString()}'`)
            const response = await fetch(resourceUrl)
            if (!response.body) {
                return
            }
            console.log(`Piping to '${targetPath}'`)
            const targetPathStream = fs.createWriteStream(targetPath)
            await finished(
                Readable.fromWeb(response.body).pipe(targetPathStream)
            )
        })
    })
)
