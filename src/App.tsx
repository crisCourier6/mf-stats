import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import UserStats from "./components/UserStats";



function App() {
  return (
    <div className="App">
      <Router>
          <Routes>
              <Route path="/stats" element={<UserStats isAppBarVisible={false} />}/>
          </Routes>
        
      </Router>
    </div>
  );
}

export default App;