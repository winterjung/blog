import { defineCollection, z } from 'astro:content'

const posts = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z
        .union([z.string(), z.date()])
        .transform((val) => (val instanceof Date ? val.toISOString().split('T')[0] : val)),
      image: image().optional(),
      // YAML에서 YYYY-MM-DD 형식은 date로 파싱되므로 둘 다 허용
      lastmod: z
        .union([z.string(), z.date()])
        .optional()
        .transform((val) => (val instanceof Date ? val.toISOString().split('T')[0] : val)),
      draft: z.boolean().default(false),
    }),
})

export const collections = { posts }
