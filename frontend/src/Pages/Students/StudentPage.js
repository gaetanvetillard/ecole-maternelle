import React from "react";
import { H1 } from "../../Styles/Titles";

import {Grid} from "@material-ui/core"
import Navbar from "../../Components/Navbar";

const StudentPage = props => {

  return (
    <>
      <Grid container>
        <Grid item align="center" xs={12}>
          <H1>Nom Prénom</H1>
        </Grid>
      </Grid>

      <Navbar />
    </>
  )
};

export default StudentPage;