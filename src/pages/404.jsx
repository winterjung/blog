import { Link, graphql, useStaticQuery } from "gatsby"
import React from "react"
import Layout from "../components/layout"

export default function NotFound() {
    const data = useStaticQuery(graphql`
        query {
            allMarkdownRemark(sort: { fields: { date: DESC } }, limit: 5) {
                edges {
                    node {
                        id
                        frontmatter {
                            title
                        }
                        fields {
                            slug
                        }
                    }
                }
            }
        }
    `)

    return (
        <Layout>
            <h1>Page Not Found</h1>
            <p>Couldn't find this page. Maybe these recent posts can help:</p>
            <ul>
                {data.allMarkdownRemark.edges.map(({ node }) => (
                    <li key={node.id}>
                        <Link to={node.fields.slug}>
                            {node.frontmatter.title}
                        </Link>
                    </li>
                ))}
            </ul>
        </Layout>
    )
}
