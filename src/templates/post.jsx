import { graphql } from "gatsby"
import React from "react"
import Giscus from "../components/giscus"
import Layout from "../components/layout"
import Seo from "../components/seo"
import "../utils/typography"

export default function Post({ data }) {
    const post = data.markdownRemark

    return (
        <Layout>
            <Seo
                title={post.frontmatter.title}
                description={post.excerpt}
                image={post.frontmatter.image}
            />
            <div>
                <h1>{post.frontmatter.title}</h1>
                <div dangerouslySetInnerHTML={{ __html: post.html }}></div>
            </div>
            <Giscus />
        </Layout>
    )
}

export const query = graphql`
    query ($slug: String!) {
        markdownRemark(fields: { slug: { eq: $slug } }) {
            html
            frontmatter {
                title
                image
            }
            excerpt(truncate: true)
        }
    }
`
