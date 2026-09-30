import type { APIContext } from 'astro'
import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import { SITE } from '@/lib/site'

export async function GET(context: APIContext) {
    const articles = await getCollection('writing', ({ data }) => !data.draft)
    const sorted = articles.sort(
        (a, b) =>
            new Date(b.data.publishDate).getTime() -
            new Date(a.data.publishDate).getTime()
    )

    return rss({
        title: `${SITE.name} — Technical Writing`,
        description: SITE.description,
        site: context.site?.toString() || SITE.origin,
        items: sorted.map((article) => ({
            title: article.data.title,
            description: article.data.description,
            pubDate: new Date(article.data.publishDate),
            link: `/writing/${article.id}/`,
        })),
        customData: `<language>en-us</language>`,
    })
}
