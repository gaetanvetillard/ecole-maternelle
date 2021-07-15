import React, { useEffect, useState } from "react";
import { H1, H2, H3 } from "../../Styles/Titles";

import {Button, Grid, TextField} from "@material-ui/core"
import Navbar from "../../Components/Navbar";
import { LoadingItem, LoadingPage } from "../../Components/Loading";
import { BlocPage, ListItemDiv, WrapperDiv } from "../../Styles/Divs";
import { YellowDividerH2 } from "../../Styles/Dividers";
import { ChevronRight } from "@material-ui/icons";

const TeacherPanel = props => {
  const [globalPageHasLoading, setGlobalPageHasLoading] = useState(false);
  const [userInfos, setUserInfos] = useState(null);
  const [classroomInfos, setClassroomInfos] = useState(null);
  const [addLoading, setAddLoading] = useState(false);
  const [newStudentFields, setNewStudentFields] = useState({name: "", firstname: "", email: ""})


  useEffect(() => {
    fetch('/api/is_login')
      .then(res => {
        if (res.ok) {
          res.json()
            .then(data => {
              if (data.role !== 10) {
                props.history.push('/');
              } else {
                setUserInfos(data);
                fetch('/api/teacher/get_classroom_infos')
                  .then(res => {
                    if (res.ok) {
                      res.json()
                        .then(data => {
                          setClassroomInfos(data);
                          setGlobalPageHasLoading(true);
                        })
                    } else {
                      res.json()
                        .then(data => alert(data["Error"]))
                    }
                  })
              }
            })
        } else {
          res.json() 
            .then(data => {
              alert(data['Error']);
              props.history.push('/')
            })
        }
      })
  }, [props.history])
  

  const handleAddStudent = (e) => {
    if (newStudentFields.name && newStudentFields.firstname && newStudentFields.email) {
      e.preventDefault()
      setAddLoading(true);

      let requestParams = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(newStudentFields)
      }

      fetch('/api/teacher/add_student', requestParams)
        .then(res => {
          if (res.ok) {
            res.json()  
              .then(data => {
                setClassroomInfos(prev => {return {...prev, students: [...prev.students, data]}});
                setNewStudentFields({name: "", firstname: "", email: ""})
                setAddLoading(false);
              })
          } else {
            res.json()
              .then(data => {
                alert(data['Error']);
                setAddLoading(false);
              })
          }
        })

    }
  }


  if (globalPageHasLoading) {
    return (
      <BlocPage>
        <Grid container>
          <Grid item align="center" xs={12}>
            <H1>Tableau de bord</H1>
          </Grid>
        </Grid>

        <Grid container>
          <Grid item xs={12} align="center">
					  <WrapperDiv style={{margin: "10px 5%"}}>
							<Grid container>
								<Grid item xs={12} align="center">
									<H2>Liste de vos élèves</H2>
									<YellowDividerH2 />
									<Grid container>
										<Grid item xs={12} align="center">
											{classroomInfos.students.length > 0 && 
                      classroomInfos.students.sort((a,b) => a.name.localeCompare(b.name)).map(
												student => 
													<ListItemDiv key={student.id} onClick={() => props.history.push(`/teacher/${classroomInfos.id}/${student.username}`)}>
														<p>{student.name} {student.firstname}</p>
														<ChevronRight />
													</ListItemDiv>
											)}
											{classroomInfos.students.length === 0 && <p>Aucun élève trouvé</p>}
											{addLoading && 
												<ListItemDiv style={{justifyContent: 'center'}}>
													<LoadingItem size="27px" />
												</ListItemDiv>}
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
              <H3>Ajouter un·e élève</H3>
              <WrapperDiv style={{maxWidth: 310}}>
                <form style={{display: "flex", flexDirection: "column", maxWidth: 300}}>
                  <TextField
                    label="Nom"
                    required
                    type="text"
                    autoComplete="none"
                    value={newStudentFields.name}
                    onChange={e => setNewStudentFields(prev => {return {...prev, name: e.target.value}})}
                  />
                  <TextField
                    label="Prénom"
                    required
                    type="text"
                    autoComplete="none"
                    value={newStudentFields.firstname}
                    onChange={e => setNewStudentFields(prev => {return {...prev, firstname: e.target.value}})}
                  />
                  <TextField
                    label="Adresse mail"
                    required
                    type='email'
                    autoComplete="none"
                    value={newStudentFields.email}
                    onChange={e => setNewStudentFields(prev => {return {...prev, email: e.target.value}})}
                  />
                  <Button
                    style={{maxWidth: 300, marginTop: 10}}
                    variant="contained"
                    type="submit"
                    onClick={handleAddStudent}
                  >
                    Ajouter
                  </Button>
                </form>
              </WrapperDiv>
            </WrapperDiv>
          </Grid>
        </Grid>

        <Navbar {...props} userInfos={userInfos} />
      </BlocPage>
    )
  } else {
    return <LoadingPage />
  }
};

export default TeacherPanel;