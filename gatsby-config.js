module.exports = {
    siteMetadata: {
        title: `winterjung blog`,
        description: `글 쓰는 소프트웨어 엔지니어`,
        image: `header.png`,
        twitterUsername: `@res_tin`,
        siteUrl: `https://www.winterjung.dev`,
    },
    plugins: [
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                name: `src`,
                path: `${__dirname}/src/`,
            },
        },
        `gatsby-plugin-image`,
        `gatsby-plugin-sharp`,
        {
            resolve: `gatsby-transformer-remark`,
            options: {
                plugins: [
                    {
                        resolve: `gatsby-remark-images`,
                    },
                ],
            },
        },
        `gatsby-plugin-emotion`,
        {
            resolve: `gatsby-plugin-typography`,
            opptions: {
                pathToConfigModule: `src/utils/typography`,
            },
        },
        `gatsby-plugin-react-helmet`,
        {
            resolve: `gatsby-plugin-google-gtag`,
            options: {
                trackingIds: [`G-GHDZ9WX1EH`],
            },
        },
        {
            resolve: `gatsby-plugin-robots-txt`,
            options: {
                sitemap: `/sitemap-index.xml`,
            },
        },
        {
            resolve: `gatsby-plugin-sitemap`,
            options: {
                query: `
            {
                site {
                    siteMetadata {
                        siteUrl
                    }
                }
                allSitePage {
                    nodes {
                        path
                        pageContext
                    }
                }
            }
            `,
                serialize: ({ path, pageContext }) => {
                    return {
                        url: path,
                        lastmod: pageContext?.lastmod,
                    }
                },
            },
        },
        {
            resolve: `gatsby-plugin-feed`,
            options: {
                query: `
              {
                site {
                  siteMetadata {
                    title
                    description
                    siteUrl
                    site_url: siteUrl
                  }
                }
              }
            `,
                feeds: [
                    {
                        serialize: ({ query: { site, allMarkdownRemark } }) => {
                            return allMarkdownRemark.edges.map((edge) => {
                                return Object.assign(
                                    {},
                                    edge.node.frontmatter,
                                    {
                                        description: edge.node.excerpt,
                                        date: edge.node.fields.date,
                                        url: `${site.siteMetadata.siteUrl}/${edge.node.fields.slug}/?utm_source=feed&utm_medium=feed&utm_campaign=feed`,
                                        guid: `${edge.node.fields.slug}`,
                                    },
                                )
                            })
                        },
                        query: `
                  {
                    allMarkdownRemark(sort: { fields: { date: DESC }}) {
                      edges {
                        node {
                          excerpt(truncate: true)
                          html
                          fields {
                            slug
                            date
                          }
                          frontmatter {
                            title
                          }
                        }
                      }
                    }
                  }
                `,
                        output: "/rss.xml",
                        title: "winterjung blog rss feed",
                    },
                ],
            },
        },
    ],
}
