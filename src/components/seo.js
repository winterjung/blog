import React from "react"
import { Helmet } from "react-helmet"
import { useLocation } from "@reach/router"
import { useStaticQuery, graphql } from "gatsby"

export default function SEO({ title, description, image }) {
    const { pathname } = useLocation()
    const { site } = useStaticQuery(query)

    const {
        defaultTitle,
        defaultDescription,
        defaultImage,
        baseUrl,
        twitterUsername,
    } = site.siteMetadata

    const seo = {
        title: title || defaultTitle,
        description: description || defaultDescription,
        url: new URL(pathname, baseUrl),
        image: new URL(image || defaultImage, baseUrl),
    }

    return (
        // 새로운 탭을 포커스 하지 않으면 정보가 업데이트되지 않는 이슈가 존재
        // ref. https://github.com/nfl/react-helmet/issues/315
        <Helmet defer={false}>
            <title>{seo.title}</title>
            <link rel="canonical" href={seo.url} />
            <meta name="description" content={seo.description} />
            <meta name="image" content={seo.image} />

            <meta property="og:title" content={seo.title} />
            <meta property="og:url" content={seo.url} />
            <meta property="og:description" content={seo.description} />
            <meta property="og:image" content={seo.image} />
            <meta property="og:type" content="article" />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={seo.title} />
            <meta name="twitter:description" content={seo.description} />
            <meta name="twitter:image" content={seo.image} />
            <meta name="twitter:creator" content={twitterUsername} />
        </Helmet>
    )
}

export const query = graphql`
    query {
        site {
            siteMetadata {
            defaultTitle: title
            defaultDescription: description
            defaultImage: image
            baseUrl: url
            twitterUsername
            }
        }
    }
`
