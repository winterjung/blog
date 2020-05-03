import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"

export default function Myfiles({ data }) {
    return (
        <Layout>
            <div>My Blog's Files</div>
            <table>
                <thead>
                    <tr>
                        <th>상대 경로</th>
                        <th>크기</th>
                        <th>확장자</th>
                        <th>생성 시각</th>
                    </tr>
                </thead>
                <tbody>
                    {data.allFile.edges
                        .map(({ node }, index) => (
                            <tr key={index}>
                                <td>
                                    <a href={node.publicURL}>
                                        {node.relativePath}
                                    </a>
                                </td>
                                <td>{node.prettySize}</td>
                                <td>{node.extension}</td>
                                <td>{node.birthTime}</td>
                            </tr>
                        ))
                        .sort()}
                </tbody>
            </table>
        </Layout>
    )
}

export const query = graphql`
    query {
        allFile {
            edges {
                node {
                    relativePath
                    prettySize
                    extension
                    birthTime(fromNow: true)
                    publicURL
                }
            }
        }
    }
`
