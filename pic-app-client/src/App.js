import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import { publicRoutes } from "@/routes";
import { DefaultLayout } from "@/components/layouts"
import { Fragment, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";

function App() {
  
  useEffect(() => {
    window.ethereum?.on("accountsChanged", handleAccountChange);
    return () => {
        window.ethereum?.removeListener("accountsChanged", handleAccountChange);
    };
  })

  const handleAccountChange = () => {
      window.location.reload();
  }

  return (
    <Router>
      <div className="App" style={{overflow: 'hidden'}}>
        <Routes>
          {publicRoutes.map((route, index) => {
            const Page = route.component;
            
            let Layout = DefaultLayout;
            if(route.layout){
              Layout = route.layout;
            }
            else if(route.layout === null){
              Layout = Fragment;
            }
            
            return (
              <Route 
                key={index} 
                path={route.path} 
                element={
                  <Layout>
                    <Page/>
                  </Layout>}>
              </Route>
            );
            
          })}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
