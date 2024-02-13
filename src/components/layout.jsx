import { css } from "@emotion/react"
import { Analytics } from "@vercel/analytics/react"
import { graphql, Link, useStaticQuery } from "gatsby"
import React from "react"
import { rhythm } from "../utils/typography"
import "./layout.css"

export default function Layout({ children }) {
    const data = useStaticQuery(graphql`
        query {
            site {
                siteMetadata {
                    title
                }
            }
        }
    `)

    const navLinkStyle = css`
        text-decoration: none;

        &:not(:last-child) {
            margin-right: 10px;
        }
    `
    return (
        <div
            css={css`
                margin: 0 auto;
                max-width: 700px;
                padding: ${rhythm(2)};
                padding-top: ${rhythm(1.5)};
            `}
        >
            <Link to={`/`}>
                <h2
                    css={css`
                        margin-bottom: ${rhythm(0.5)};
                        display: inline-block;
                        font-style: normal;
                    `}
                >
                    {data.site.siteMetadata.title}
                </h2>
            </Link>
            <div
                css={css`
                    margin-bottom: ${rhythm(0.5)};
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: flex-start;
                    align-items: baseline;
                `}
            >
                <Link to="/" css={navLinkStyle}>
                    posts
                </Link>
                <Link to="/rss.xml" css={navLinkStyle}>
                    rss
                </Link>
                <a
                    href="https://github.com/winterjung"
                    css={navLinkStyle}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    github
                </a>
                <a
                    href="https://www.linkedin.com/in/jungwinter/"
                    css={navLinkStyle}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    linkedin
                </a>
            </div>
            <hr />
            {children}
            <Analytics />
        </div>
    )
}
