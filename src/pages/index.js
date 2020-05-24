import React from "react"
import { Link, graphql } from "gatsby"
import { css } from "@emotion/core"
import { rhythm } from "../utils/typography"
import Layout from "../components/layout"

export default ({ data }) => (
    <Layout>
        <div>
            {data.allMarkdownRemark.edges.map(({ node }) => (
                <div key={node.id}>
                    <Link
                        to={node.fields.slug}
                        css={css`
                            text-decoration: none;
                        `}>
                        <h3
                            css={css`
                                margin-bottom: ${rhythm(0.5)};
                            `}>
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
        allMarkdownRemark(sort: { fields: [fields___date], order: DESC }) {
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
