import fs, { mkdirSync } from 'node:fs'
import path from 'node:path'
import { Readable } from 'node:stream'
import { finished } from 'node:stream/promises'
import generateFileNameFromArtifact from '@/lib/linkedin/generateFileNameFromArtifact'

const cvPath = path.resolve('src/cv.json')
if (!fs.existsSync(cvPath)) {
    console.log('src/cv.json not found, skipping asset download.')
    process.exit(0)
}

const cv = JSON.parse(fs.readFileSync(cvPath, 'utf-8'))

const projectsDir = 'src/assets/projects'
mkdirSync(projectsDir, { recursive: true })

cv.projects?.forEach((project: any, project_index: number) =>
    project.media?.forEach(async (media: any, media_index: number) => {
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
