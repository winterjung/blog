import React from "react"
import { Link, graphql } from "gatsby"
import { css } from "@emotion/core"
import { rhythm } from "../utils/typography"
import Layout from "../components/layout"

export default ({ data }) => (
    <Layout>
        <div>
            <h1
                css={css`
                    display: inline-block;
                    border-bottom: 1px solid;
                `}>
                메인 페이지
            </h1>
            <h4>{data.allMarkdownRemark.totalCount} Posts</h4>
            {data.allMarkdownRemark.edges.map(({ node }) => (
                <div key={node.id}>
                    <Link
                        to={node.fields.slug}
                        css={css`
                            text-decoration: none;
                            color: inherit;
                        `}>
                        <h3
                            css={css`
                                margin-bottom: ${rhythm(1 / 4)};
                            `}>
                            {node.frontmatter.title}{" "}
                            <span
                                css={css`
                                    color: #bbb;
                                `}>
                                - {node.frontmatter.date}
                            </span>
                        </h3>
                    </Link>
                    <p>{node.excerpt}</p>
                </div>
            ))}
        </div>
    </Layout>
)

export const query = graphql`
    query {
        allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
            totalCount
            edges {
                node {
                    id
                    frontmatter {
                        title
                        date(formatString: "YYYY-MM-DD")
                    }
                    fields {
                        slug
                    }
                    excerpt
                }
            }
        }
    }
`
