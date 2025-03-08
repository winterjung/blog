import { useLocation } from "@reach/router"
import { graphql, useStaticQuery } from "gatsby"
import React from "react"
import { Helmet } from "react-helmet"

export default function Seo({ title, description, image }) {
    const { pathname } = useLocation()
    const { site } = useStaticQuery(query)

    const {
        defaultTitle,
        defaultDescription,
        defaultImage,
        baseUrl,
        twitterUsername,
    } = site.siteMetadata

    const meta = {
        title: title || defaultTitle,
        description: description || defaultDescription,
        url: new URL(pathname, baseUrl),
        image: new URL(image || defaultImage, baseUrl),
    }

    return (
        // 새로운 탭을 포커스 하지 않으면 정보가 업데이트되지 않는 이슈가 존재
        // ref. https://github.com/nfl/react-helmet/issues/315
        <Helmet defer={false}>
            <title>{meta.title}</title>
            <link rel="canonical" href={meta.url} />
            <meta name="description" content={meta.description} />
            <meta name="image" content={meta.image} />

            <meta property="og:title" content={meta.title} />
            <meta property="og:url" content={meta.url} />
            <meta property="og:description" content={meta.description} />
            <meta property="og:image" content={meta.image} />
            <meta
                property="og:type"
                content={pathname === `/` ? "website" : "article"}
            />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={meta.title} />
            <meta name="twitter:description" content={meta.description} />
            <meta name="twitter:image" content={meta.image} />
            <meta name="twitter:creator" content={twitterUsername} />

            <link rel="preconnect" href="https://cdn.jsdelivr.net" />
            <link
                rel="preload"
                href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
                as="style"
            />
            <link
                rel="stylesheet"
                type="text/css"
                href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
            />
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
                baseUrl: siteUrl
                twitterUsername
            }
        }
    }
`
