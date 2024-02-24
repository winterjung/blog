import { Link } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"
import React from "react"
import Layout from "../components/layout"

export default function Resume() {
    return (
        <Layout>
            <Link to={`/2023-en-resume.pdf`}>
                <h2>English Resume</h2>
                <StaticImage
                    src="../../static/images/2023-en-resume.png"
                    alt="2023 english resume preview"
                />
            </Link>
            <Link to={`/2023-ko-resume.pdf`}>
                <h2>한국어 이력서</h2>
                <StaticImage
                    src="../../static/images/2023-ko-resume.png"
                    alt="2023 korean resume preview"
                />
            </Link>
        </Layout>
    )
}
