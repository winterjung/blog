const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

const postPathPattern = /(\d{4}-\d{2}-\d{2})-(.*)/

exports.onCreateNode = ({ node, getNode, actions }) => {
    const { createNodeField } = actions
    if (node.internal.type === `MarkdownRemark`) {
        const filePath = createFilePath({
            node,
            getNode,
            trailingSlash: false,
        }).replace(`posts/`, ``)
        const [, date, slug] = postPathPattern.exec(filePath)

        createNodeField({
            node,
            name: `slug`,
            value: date.split(`-`).join(`/`) + `/` + slug,
        })
        createNodeField({
            node,
            name: `date`,
            value: date,
        })
    }
}

exports.createPages = async ({ graphql, actions }) => {
    const { createPage } = actions
    const result = await graphql(`
        query {
            allMarkdownRemark {
                edges {
                    node {
                        fields {
                            slug
                            date
                        }
                    }
                }
            }
        }
    `)

    result.data.allMarkdownRemark.edges.forEach(({ node }) => {
        createPage({
            path: node.fields.slug,
            component: path.resolve(`./src/templates/post.jsx`),
            context: {
                slug: node.fields.slug,
                date: node.fields.date,
            },
        })
    })
}
