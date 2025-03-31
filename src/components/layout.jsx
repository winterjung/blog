import { css } from "@emotion/react"
import { Analytics } from "@vercel/analytics/react"
import { graphql, Link, useStaticQuery } from "gatsby"
import React from "react"

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
        <div>
            <Link to={`/`}>
                <h2 className="home">{data.site.siteMetadata.title}</h2>
            </Link>
            <nav>
                <Link to="/" css={navLinkStyle}>
                    posts
                </Link>
                <Link to="/resume/" css={navLinkStyle}>
                    resume
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
            </nav>
            <hr />
            {children}
            <Analytics />
        </div>
    )
}
