import React from "react";
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.css';

import LoginPage from './Pages/LoginPage';
import ErrorPage from "./Pages/Error404Page";
import AccountPage from './Pages/AccountPage';

import SuperAdminPanel from './Pages/SuperAdmin/SuperAdminPanel';
import SuperAdminSchools from "./Pages/SuperAdmin/SuperAdminSchools";
import SuperAdminSkills from './Pages/SuperAdmin/SuperAdminSkills';


import AdminPanel from "./Pages/Admin/AdminPanel";
import ManageClassrooms from './Pages/Admin/ManageClassrooms';
import ManageClassroom from "./Pages/Admin/ManageClassroom";
import ManageUsers from './Pages/Admin/ManageUsers';
import ManageUser from './Pages/Admin/ManageUser';
import ManageSkills from './Pages/Admin/ManageSkills';



const App = () => {


  return (
    <Router>
      <Switch>
        <Route exact path="/" component={LoginPage} />
        <Route exact path="/account" component={AccountPage} />
        {/* Super Admin */}
        <Route exact path="/super-admin" component={SuperAdminPanel} />
        <Route exact path="/super-admin/schools" component={SuperAdminSchools} />
        <Route exact path="/super-admin/skills" component={SuperAdminSkills} />
        {/* Admin */}
        <Route exact path="/admin" component={AdminPanel} />
        <Route exact path="/admin/classrooms" component={ManageClassrooms} />
        <Route exact path="/admin/classrooms/:classroom_id" component={ManageClassroom} />
        <Route exact path="/admin/users" component={ManageUsers} />
        <Route exact path="/admin/users/:user_id" component={ManageUser} />
        <Route exact path="/admin/skills" component={ManageSkills} />
        {/* Teachers */}


        {/* Student */}

        <Route component={ErrorPage} />
      </Switch>
    </Router>
  )
}

export default App;
