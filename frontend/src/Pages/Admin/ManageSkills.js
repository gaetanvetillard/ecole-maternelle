import React from "react";
import { H1 } from "../../Styles/Titles";

import {Grid} from "@material-ui/core"
import Navbar from "../../Components/Navbar";

const ManageSkills = props => {

  return (
    <>
      <Grid container>
        <Grid item align="center" xs={12}>
          <H1>Gestion des compétences</H1>
        </Grid>
      </Grid>

      <Navbar />
    </>
  )
};

export default ManageSkills;