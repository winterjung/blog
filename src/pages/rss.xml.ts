import { getCollection } from 'astro:content'
import rss from '@astrojs/rss'
import type { APIContext } from 'astro'

export async function GET(context: APIContext) {
  const posts = await getCollection('posts', ({ id, data }) => {
    return id.startsWith('ko/') && !data.draft
  })

  const items = posts
    .map((post) => {
      // ko/slug/index.md → slug
      const slug = post.id.replace('ko/', '')
      return {
        title: post.data.title,
        pubDate: new Date(post.data.date),
        link: `/${slug}/?utm_source=feed&utm_medium=feed&utm_campaign=feed`,
        description: post.body?.replace(/[#*`\[\]]/g, '').slice(0, 200) || '',
      }
    })
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())

  return rss({
    title: 'winterjung blog rss feed',
    description: '글 쓰는 소프트웨어 엔지니어',
    site: context.site ?? new URL('https://www.winterjung.dev'),
    items,
  })
}
