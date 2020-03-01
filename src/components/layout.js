import React from "react"
import { Link } from "gatsby"

const ListLink = props => (
    <li style={{ display: `inline-block`, marginRight: `1rem` }}>
        <Link to={props.to} style={{ textDecoration: `none`, color: `rgba(0, 0, 0, 0.8)` }}>{props.children}</Link>
    </li>
)

export default ({ children }) => (
    <div style={{ margin: `3rem auto`, maxWidth: 600, padding: `0 1rem` }}>
        <header style={{ marginBottom: `1.5rem` }}>
            <Link to="/" style={{ textShadow: `none`, backgroundImage: `none`, textDecoration: `none`, color: `rgba(0, 0, 0, 0.8)` }}>
                <h3 style={{ display: `inline` }}>Cold Storage</h3>
            </Link>
            <ul style={{ listStyle: `none`, float: `right` }}>
                <ListLink to="/">Home</ListLink>
                <ListLink to="/about/">About</ListLink>
                <ListLink to="/contact/">Contact</ListLink>
            </ul>
        </header>
        {children}
    </div>
)
