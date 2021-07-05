import React, { useEffect, useState } from "react";
import { H1, H2 } from "../../Styles/Titles";

import {Grid} from "@material-ui/core"
import Navbar from "../../Components/Navbar";
import { BlocPage, ListItemDiv, WrapperDiv } from "../../Styles/Divs";
import { YellowDividerH2 } from "../../Styles/Dividers";
import { LoadingItem, LoadingPage } from "../../Components/Loading";
import AddFormAdminVersion from './AddFormAdminVersion';
import { ChevronRight } from "@material-ui/icons";


const ManageClassrooms = props => {
  const [userInfos, setUserInfos] = useState(null);
  const [classroomsList, setClassroomsList] = useState(null);
  const [freeTeachersList, setFreeTeachersList] = useState(null);
  const [globalPageHasLoading, setGlobalPageHasLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);

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
                fetch('/api/admin/get_classrooms_list')
                  .then(res => {
                    if (res.ok) {
                      res.json()
                        .then(data => {
                          setClassroomsList(data.classrooms);
                          setFreeTeachersList(data.free_teachers)
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
            <H1>Gestion des classes</H1>
          </Grid>
        </Grid>

        {/* Classrooms list */}
        <Grid container>
          <Grid item xs={12} align="center">
            <WrapperDiv style={{margin: "10px 5%"}}>
              <Grid container>
                <Grid item xs={12} align="center">
                  <H2>Les classes de votre école</H2>
                  <YellowDividerH2 />
                  <Grid container>
                    <Grid item xs={12} align="center">
                      {classroomsList && classroomsList.map(classroom => {
                        return (
                          <ListItemDiv key={classroom.id}>
                            <p>Classe de {classroom.teacher.name} {classroom.teacher.firstname} - {classroom.students_count} élèves</p>
                            <ChevronRight />
                          </ListItemDiv>
                        )
                      })}
                      {addLoading &&
                        <ListItemDiv style={{justifyContent: "center"}}>
                          <LoadingItem size="27px" />
                        </ListItemDiv>
                      }
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </WrapperDiv>
          </Grid>
        </Grid>

        <Grid container>
          <Grid item xs={12} align="center">
            <WrapperDiv style={{margin: "10px 5%"}}>
              <H2>Ajouter une classe</H2>
              <YellowDividerH2 />
              <WrapperDiv>
                <AddFormAdminVersion 
                  url='/api/admin/add_classroom' 
                  freeList={freeTeachersList} 
                  setAddLoading={setAddLoading} 
                  setFreeList={setFreeTeachersList} 
                  setList={setClassroomsList}
                  helperText="Aucun(e) maître(sse) disponible."
                  buttonText="Ajouter une classe"
                 />
              </WrapperDiv>
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

export default ManageClassrooms;