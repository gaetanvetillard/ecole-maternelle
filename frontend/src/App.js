import React from "react";
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.css';

import LoginPage from './Pages/LoginPage';
import ErrorPage from "./Pages/Error404Page";
import AdminPanel from "./Pages/Admin/AdminPanel";
import ManageClassrooms from './Pages/Admin/ManageClassrooms';
import ManageClassroom from "./Pages/Admin/ManageClassroom";

const App = () => {


  return (
    <Router>
      <Switch>
        <Route exact path="/" component={LoginPage} />
        {/* Admin */}
        <Route exact path="/admin" component={AdminPanel} />
        <Route exact path="/admin/classrooms" component={ManageClassrooms} />
        <Route exact path="/admin/classrooms/:classroom_id" component={ManageClassroom} />
        <Route component={ErrorPage} />
      </Switch>
    </Router>
  )
}

export default App;
