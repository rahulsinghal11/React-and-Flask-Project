import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route } from "react-router-dom";
import EnhancedTable from './components/main';
import SignIn from './components/login';

export default function App() {
  return (
  <Router>
    <div>
      <Route exact path="/login">
        <SignIn />
      </Route>
      <Route exact path="/">
        <EnhancedTable />
      </Route>
    </div>
  </Router>
);

}

