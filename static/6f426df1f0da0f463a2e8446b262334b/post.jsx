import { css } from "@emotion/react"
import { graphql } from "gatsby"
import React from "react"
import Layout from "../components/layout"
import SEO from "../components/seo"

export default ({ data }) => {
    const post = data.markdownRemark
    return (
        <Layout>
            <SEO
                title={post.frontmatter.title}
                description={post.excerpt}
                image={post.frontmatter.image}
            />
            <div>
                <h1>{post.frontmatter.title}</h1>
                <div
                    dangerouslySetInnerHTML={{ __html: post.html }}
                    css={css`
                        word-break: keep-all;
                    `}
                ></div>
            </div>
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
