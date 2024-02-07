import { css } from "@emotion/react"
import { Link, graphql } from "gatsby"
import React from "react"
import { rhythm } from "../utils/typography"

import Layout from "../components/layout"
import SEO from "../components/seo"

export default ({ data }) => (
    <Layout>
        <SEO />
        <div>
            {data.allMarkdownRemark.edges.map(({ node }) => (
                <div key={node.id}>
                    <Link
                        to={node.fields.slug}
                        css={css`
                            text-decoration: none;
                        `}
                    >
                        <h3
                            css={css`
                                margin-bottom: ${rhythm(0.5)};
                            `}
                        >
                            {node.frontmatter.title}
                        </h3>
                    </Link>
                    <p>
                        {node.fields.date} - {node.excerpt}
                    </p>
                </div>
            ))}
        </div>
    </Layout>
)

export const query = graphql`
    query {
        allMarkdownRemark(sort: { fields: { date: DESC } }) {
            totalCount
            edges {
                node {
                    id
                    frontmatter {
                        title
                    }
                    fields {
                        slug
                        date
                    }
                    excerpt(truncate: true)
                }
            }
        }
    }
`
