module.exports = {
    siteMetadata: {
        title: `winterjung blog`,
        description: `글 쓰는 소프트웨어 엔지니어`,
        url: `https://blog.winterjung.dev`,
        image: `favicon-256.png`,
        twitterUsername: `@res_tin`,
    },
    plugins: [
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                name: `src`,
                path: `${__dirname}/src/`,
            },
        },
        `gatsby-transformer-remark`,
        `gatsby-plugin-emotion`,
        {
            resolve: `gatsby-plugin-typography`,
            opptions: {
                pathToConfigModule: `src/utils/typography`,
            },
        },
        `gatsby-plugin-react-helmet`,
    ],
}
