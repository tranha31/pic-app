import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import { publicRoutes } from "@/routes";
import { DefaultLayout } from "@/components/layouts"
import { Fragment, useEffect, useState } from "react";
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

  const [disabledSearch, setDisabledSearch] = useState(false);
  const [searchKey, setSearchKey] = useState("");
  const [filterData, setFilterData] = useState(false);

  const updateDisableSearch = (disabled, value) => {
    setDisabledSearch(disabled)
    setSearchKey(value)
  }

  const updateSearch = (value, disabled) => {
    if(disabled != undefined){
      setDisabledSearch(disabled)
    }

    setSearchKey(value)
  }

  const handleCallBackFilterData = (value) => {
    setFilterData(value);
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
                  <Layout callBackUpdateSearch={updateSearch} callBackFilterData={handleCallBackFilterData} disableSearch={disabledSearch}>
                    <Page callBackUpdate={updateDisableSearch} searchKey={searchKey} isSearchData={filterData}/>
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
