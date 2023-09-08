import { Outlet } from "@remix-run/react";

export default function Forms() {
    return (
        <>  
            <div className="nav">Make forms nav</div>
            <div className="component-container">
                <Outlet />
            </div>
        </>
    )
}
