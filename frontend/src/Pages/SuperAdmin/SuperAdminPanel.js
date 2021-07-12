import React, {useEffect, useState} from "react";
import {Grid} from "@material-ui/core";

import Navbar from "../../Components/Navbar";
import SearchBar from "../../Components/SearchBar";
import { WrapperDiv, BlocPage, ListItemDiv } from "../../Styles/Divs";
import {LoadingPage} from '../../Components/Loading';
import { YellowDividerH2 } from "../../Styles/Dividers";
import { H1, H2, H3 } from "../../Styles/Titles";
import { ChevronRight } from "@material-ui/icons";


const SuperAdminPanel = props => {
  const [userInfos, setUserInfos] = useState(null);
  const [infos, setInfos] = useState(null);
  const [globalPageHasLoading, setGlobalPageHasLoading] = useState(false);

  useEffect(() => {
    fetch('/api/is_login')
      .then(res => {
        if (res.ok) {
          res.json()
            .then(data => {
              setUserInfos(data)
              if (data.role !== 1000) {
                props.history.push('/')
              } else {
                fetch('/api/super_admin/get_infos')
                  .then(res => {
                    if (res.ok) {
                      res.json()
                        .then(data => {
                          setInfos(data);
                          setGlobalPageHasLoading(true);
                        })
                    } else {
                      res.json()
                        .then(data => console.log(data['Error']))
                    }
                  })
              }
            });
        }
      })
  }, [props.history])


  if (globalPageHasLoading) {
    return (
      <BlocPage>
        <Grid container>
          <Grid item align="center" xs={12}>
            <H1>Super Admin</H1>
          </Grid>
        </Grid>

        <SearchBar />

        <Grid container>
          <Grid item xs={12} align="center">
            <WrapperDiv style={{margin: "10px 5%"}}>
              <Grid container>
                <Grid item xs={12} align="center">
                  <H2>Gestion du site</H2>
                  <YellowDividerH2 />
                </Grid>
                <Grid item xs={6} align="center" style={{padding: "0 5px 0 0"}}>
                  <WrapperDiv style={{cursor: "pointer"}} onClick={() => props.history.push('/super-admin/schools')}>
                    <H3 style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                      Nombre d'écoles <ChevronRight />
                    </H3>
                    <WrapperDiv>
                      <H1>{infos.schools_count}</H1>
                    </WrapperDiv>
                  </WrapperDiv>
                </Grid>
                <Grid item xs={6} align="center" style={{padding: "0 0 0 5px"}}>
                  <WrapperDiv style={{cursor: "pointer"}} onClick={() => props.history.push('/super-admin/users')}>
                    <H3 style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                      Nombre d'utilisateurs <ChevronRight />
                    </H3>
                    <WrapperDiv>
                      <H1>{infos.users_count}</H1>
                    </WrapperDiv>
                  </WrapperDiv>
                </Grid>
              </Grid>
            </WrapperDiv>
          </Grid>
        </Grid>

        <Grid container>
          <Grid item xs={12} align="center">
            <WrapperDiv style={{margin: "10px 5%"}}>
              <H2>Gestion des compétences</H2>
              <YellowDividerH2 />
              <Grid container>
                <Grid item xs={12} align="center">
                  <ListItemDiv onClick={() => props.history.push('/super-admin/skills')}>
                    <H3>Liste des compétences</H3>
                    <ChevronRight />
                  </ListItemDiv>
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


export default SuperAdminPanel;