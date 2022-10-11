import { Fragment } from "react";
import Header from "./Header";

function DefaultLayout({children}) {
    return ( 
        <Fragment>
            <Header/>
            <div className="container">
                <div className="content">{children}</div>
            </div>
        </Fragment>
     );
}

export default DefaultLayout;