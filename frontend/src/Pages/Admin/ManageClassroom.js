import React, { useEffect, useState } from "react";
import { H1, H2, H3 } from "../../Styles/Titles";

import {Grid} from "@material-ui/core"
import Navbar from "../../Components/Navbar";
import { LoadingItem, LoadingPage } from "../../Components/Loading";
import { BlocPage, ListItemDiv, WrapperDiv } from "../../Styles/Divs";
import Searchbar from "../../Components/SearchBar";
import { YellowDividerH2 } from "../../Styles/Dividers";
import { ChevronRight } from "@material-ui/icons";
import AddFormAdminVersion from "./AddFormAdminVersion";

const ManageClassroom = props => {
  const [userInfos, setUserInfos] = useState(null);
  const [classroomInfos, setClassroomInfos] = useState(null);
	const [studentsList, setStudentsList] = useState(null);
	const [teachers, setTeachers] = useState(null);
  const [globalPageHasLoading, setGlobalPageHasLoading] = useState(false);
	const [addLoading, setAddLoading] = useState(false);


  useEffect(() => {
    fetch('/api/is_login')
      .then(res => {
        res.json()
          .then(data => {
            if (data.role !== 100) {
              props.history.push('/')
            } else {
              setUserInfos(data);
              fetch(`/api/admin/get_classroom_info/${props.match.params.classroom_id}`)
                .then(res => {
                  if (res.ok) {
                    res.json()
                      .then(data => {
                        if (data.is_allowed) {
                          setClassroomInfos(data);
													setTeachers(data.teachers);
													setStudentsList(data.students);
                          setGlobalPageHasLoading(true);
                        } else {
                          props.history.push('/admin/classrooms')
                        }
                        
                      })
                  } else {
                    props.history.push('/admin/classrooms')
                  }
                })
            }
          })
      })

  }, [props.history, props.match.params.classroom_id])





  if (globalPageHasLoading) {
    return (
      <BlocPage>
        <Grid container>
          <Grid item align="center" xs={12}>
            <H1>Classe de {
              teachers && `${teachers[teachers.length-1].firstname} ${teachers[teachers.length-1].name}`
                }
            </H1>
          </Grid>
        </Grid>

        <Searchbar />

        <Grid container>
          <Grid item xs={12} align="center">
					  <WrapperDiv style={{margin: "10px 5%"}}>
							<Grid container>
								<Grid item xs={12} align="center">
									<H2>Liste des élèves</H2>
									<YellowDividerH2 />
									<Grid container>
										<Grid item xs={12} align="center">
											{studentsList.length > 0 && studentsList.map(
												student => 
													<ListItemDiv key={student.id}>
														<p>{student.name} {student.firstname}</p>
														<ChevronRight />
													</ListItemDiv>
											)}
											{studentsList.length === 0 && <p>Aucun élève trouvé</p>}
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
							<Grid container>
								<Grid item xs={12} align='center'>
								  <H2>Gérer la classe</H2>
									<YellowDividerH2 />
									<WrapperDiv>
										<Grid container>
											<Grid item xs={6} align="center">
												<WrapperDiv style={{marginRight: 10}}>
													<H3>Changer de maître(sse)</H3>
													<AddFormAdminVersion 
														url='/api/admin/transfer_classroom' 
														oldValue={teachers[teachers.length-1]}
														freeList={classroomInfos.free_teachers}  
														setFreeList={(newList) => setClassroomInfos(prev => {return {...prev, free_teachers: newList}})} 
														setList={setTeachers}
														classroom_id={classroomInfos.id}
														helperText="Aucun(e) maître(sse) disponible."
														buttonText="Changer de maître(sse)"
														/>
												</WrapperDiv>
											</Grid>

											<Grid item xs={6} align="center">
												<WrapperDiv style={{marginLeft: 10}}>
													<H3>Ajouter un élève</H3>
													<AddFormAdminVersion 
														url='/api/admin/add_student' 
														freeList={classroomInfos.free_students} 
														setAddLoading={setAddLoading} 
														setFreeList={(newList) => setClassroomInfos(prev => {return {...prev, free_students: newList}})} 
														setList={setStudentsList}
														classroom_id={classroomInfos.id}
														helperText="Aucun élève disponible."
														buttonText="Ajouter un élève"
													/>
												</WrapperDiv>
											</Grid>
										</Grid>
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

export default ManageClassroom;