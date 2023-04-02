import CopyrightAction from "@/components/views/CopyrightAction";
import { Fragment, useState } from "react";
import Header from "./Header";

function DefaultLayout({children}) {

    const [copyrightMode, setCopyrightMode] = useState(0);
    const [showCopyright, setShowCopyright] = useState(false);

    const handleCloseCopyright = (state) => {
        setShowCopyright(state)
    }

    const handleShowCopyright = (state) => {
        setCopyrightMode(state);
        setShowCopyright(true);
    }

    return ( 
        <Fragment>
            <Header callBackHandleCloseCopyright={handleShowCopyright}/>
            <div className="container">
                <div className="content">{children}</div>
            </div>
            {showCopyright && <CopyrightAction mode={copyrightMode} callBackEvent={handleCloseCopyright}/>}
            
        </Fragment>
     );
}

export default DefaultLayout;