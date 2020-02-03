import React from "react"
import { Link } from "gatsby"
import Header from "../components/header"

export default () => (
    <div style={{ color: `teal` }}>
        <Link to="/">Home</Link>
        <Header headerText="winter에 대해" />
        <Header headerText="이것이 바로 props라는 것" />
        <p>오 신기하당</p>
    </div>
)
