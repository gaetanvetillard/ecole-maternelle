import React, { useEffect, useState } from "react";
import { H1, H2, H3 } from "../../Styles/Titles";

import {Button, Grid} from "@material-ui/core"
import Navbar from "../../Components/Navbar";
import Searchbar from "../../Components/SearchBar";
import { BlocPage, ListItemDiv, WrapperDiv } from "../../Styles/Divs";
import { YellowDividerH2 } from "../../Styles/Dividers";
import { ChevronRight } from "@material-ui/icons";
import { LoadingPage } from "../../Components/Loading";

const ManageUsers = props => {
  const [globalPageHasLoading, setGlobalPageHasLoading] = useState(false);
  const [userInfos, setUserInfos] = useState(null);
  const [usersList, setUsersList] = useState(null);


  useEffect(() => {
    fetch('/api/is_login')
      .then(res => {
        if (res.ok) {
          res.json()
            .then(data => {
              if (data.role !== 100) {
                props.history.push('/')
              } else {
                setUserInfos(data);
                fetch('/api/admin/get_users_list')
                  .then(res => {
                    if (res.ok) {
                      res.json()
                        .then(data => {
                          setUsersList(data);
                          setGlobalPageHasLoading(true);
                        })
                    } else {
                      res.json()
                        .then(data => console.log(data))
                    }
                  })
              }
            })
        }
      })
  }, [props.history])


  if (globalPageHasLoading) {
    return (
      <BlocPage>
        <Grid container>
          <Grid item align="center" xs={12}>
            <H1>Gestion des utilisateurs de votre école</H1>
          </Grid>
        </Grid>

        <Searchbar />

        {/* Administrateur */}
        <Grid container>
          <Grid item xs={12} align="center">
            <WrapperDiv style={{margin: "10px 5%"}}>
              <Grid container>
                <Grid item xs={12}>
                  <H2>Administrateur</H2>
                  <YellowDividerH2 />
                  <ListItemDiv onClick={() => props.history.push('/account')}>
                    <p>{usersList.admin.name} {usersList.admin.firstname} (Vous)</p>
                    <ChevronRight />
                  </ListItemDiv>
                </Grid>
              </Grid>
            </WrapperDiv> 
          </Grid>
        </Grid>



        {/* Liste Maître·sse·s */}
        <Grid container>
          <Grid item xs={12} align="center">
            <WrapperDiv style={{margin: "10px 5%"}}>
              <Grid container>
                <Grid item xs={12}>
                  <H2>Maître·sse·s</H2>
                  <YellowDividerH2 style={{marginBottom: 0}} />
                  <H3>Total : {usersList.teachers.length}</H3>
                  {usersList.teachers.length > 0 && usersList.teachers.map(teacher => {
                    return (
                    <ListItemDiv key={teacher.id} onClick={() => props.history.push(`/admin/users/${teacher.id}`)}>
                      <p>{teacher.name} {teacher.firstname}</p>
                      <ChevronRight />
                    </ListItemDiv>)
                  })}
                  {usersList.teachers.length === 0 &&
                    <p>Aucun·e maître·sse enregistré·e dans votre école</p>
                  }
                  <Button
                    variant="contained"
                    style={{marginTop: 10, width: "100%", borderRadius: 10}}
                    onClick={() => props.history.push('/admin/classrooms')}
                  >Ajouter un·e maître·sse·s (créer une classe)
                  </Button>
                </Grid>
              </Grid>
            </WrapperDiv> 
          </Grid>
        </Grid>



        {/* Liste élèves */}
        <Grid container>
          <Grid item xs={12} align="center">
            <WrapperDiv style={{margin: "10px 5%"}}>
              <Grid container>
                <Grid item xs={12}>
                  <H2>Élèves</H2>
                  <YellowDividerH2 style={{marginBottom: 0}} />
                  <H3>Total : {usersList.students.length}</H3>
                  {usersList.students.length > 0 && usersList.students.map(student => {
                    return (
                      <ListItemDiv key={student.id} onClick={() => props.history.push(`/admin/users/${student.id}`)}>
                        <p>{student.name} {student.firstname}</p>
                        <ChevronRight />
                      </ListItemDiv>
                    )
                  })}
                  {usersList.students.length === 0 && 
                    <p>Aucun élève enregistré dans votre école</p>
                  }
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


export default ManageUsers;