import React, { useEffect, useState } from "react";
import { H1, H2, H3 } from "../../Styles/Titles";

import {Grid} from "@material-ui/core"
import Navbar from "../../Components/Navbar";
import {LoadingPage} from '../../Components/Loading';
import {BlocPage, WrapperDiv} from '../../Styles/Divs';
import {YellowDividerH2} from '../../Styles/Dividers';

const ManageSkills = props => {
  const [userInfos, setUserInfos] = useState(null);
  const [globalPageHasLoading, setGlobalPageHasLoading] = useState(false);


  useEffect(() => {
    fetch('/api/is_login')
      .then(res => {
        res.json()
          .then(data => {
            if (data.role !== 100) {
              props.history.push('/')
            } else {
              setUserInfos(data);
              setGlobalPageHasLoading(true);
            }
          })
      })
  }, [props.history])


  if (globalPageHasLoading) {
    return (
      <BlocPage>
        <Grid container>
          <Grid item align="center" xs={12}>
            <H1>Gestion des compétences</H1>
          </Grid>
        </Grid>

        <Grid container>
          <Grid item xs={12} align="center">
            <WrapperDiv style={{margin: "10px 5%"}}>
              <H2>Apprendre</H2>
              <YellowDividerH2 />
              
              {/* Subskill */}
              <Grid container>
                <Grid item xs={12} align="center">
                  <WrapperDiv>
                    <H3>Devenir élève</H3>

                  </WrapperDiv>
                </Grid>
              </Grid>
            </WrapperDiv>
          </Grid>
        </Grid>



        <Navbar {...props} userInfos={userInfos}/>
      </BlocPage>
    ) 
  } else {
    return <LoadingPage />
  }
  
};

export default ManageSkills;