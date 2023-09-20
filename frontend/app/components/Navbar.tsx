import React, { Component } from 'react';
import { NavLink } from "@remix-run/react";

interface NavbarProps {
    links: { [alias: string]: string };
    dark?: boolean;
}

class Navbar extends Component<NavbarProps> {
    render() {
        let { links, dark } = this.props;
        if (dark === undefined) {
            dark = false;
        }

        const liClassName = `navbar-item ${dark ? 'dark' : ''}`;
        const textClassName = `navbar-text${dark ? '-dark' : ''}`;
        const navClassName = `navbar${dark ? 'dark' : ''}`;

        return (
            <ul className="navbar-list">
                {Object.entries(links).map(([alias, link]) => (
                    <li key={alias} className={liClassName}>
                        <nav className={navClassName}>
                            <NavLink to={link}>
                                <p className={textClassName}>{alias}</p>
                            </NavLink>
                        </nav>
                    </li>
                ))}
            </ul>
        );
    }
}

export default Navbar;
export type { NavbarProps };
