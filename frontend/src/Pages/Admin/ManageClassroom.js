import React, { useEffect, useState } from "react";
import { H1, H2, H3 } from "../../Styles/Titles";

import {Button, Grid} from "@material-ui/core"
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


	const handleDeleteClassroom = () => {
		let confirmation = window.confirm(`Vous êtes sur le point de supprimer la classe de ${classroomInfos.teachers[0].firstname} ${classroomInfos.teachers[0].name}. Cette action ne supprimera pas les comptes reliées à cette classe. Êtes-vous sûr de vouloir continuer ?`)
		if (confirmation) {
			let requestParams = {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({
					classroom_id: props.match.params.classroom_id
				})
			}

			fetch('/api/admin/delete_classroom', requestParams)
				.then(res => {
					if (res.ok) {
						props.history.push('/admin/classrooms')
					} else {
						res.json()
							.then(data => {
								alert(data['Error'])
							})
					}
				}) 
		} else {
			return
		}
	}



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
													<ListItemDiv key={student.id} onClick={() => props.history.push(`/admin/users/${student.id}`)}>
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
											<Grid item md={6} xs={12} align="center">
												<WrapperDiv style={{margin: "5px"}}>
													<H3>Changer de maître·sse</H3>
													<AddFormAdminVersion 
														url='/api/admin/transfer_classroom' 
														oldValue={teachers[teachers.length-1]}
														freeList={classroomInfos.free_teachers}  
														setFreeList={(newList) => setClassroomInfos(prev => {return {...prev, free_teachers: newList}})} 
														setList={setTeachers}
														classroom_id={classroomInfos.id}
														helperText="Aucun·e maître·sse disponible."
														buttonText="Changer de maître·sse"
														/>
												</WrapperDiv>
											</Grid>

											<Grid item md={6} xs={12} align="center">
												<WrapperDiv style={{margin: "5px"}}>
													<H3>Ajouter un·e élève</H3>
													<AddFormAdminVersion 
														url='/api/admin/add_student' 
														freeList={classroomInfos.free_students} 
														setAddLoading={setAddLoading} 
														setFreeList={(newList) => setClassroomInfos(prev => {return {...prev, free_students: newList}})} 
														setList={setStudentsList}
														classroom_id={classroomInfos.id}
														helperText="Aucun élève disponible."
														buttonText="Ajouter un·e élève"
													/>
												</WrapperDiv>
											</Grid>
										</Grid>
									
										<Grid item xs={12} align="center" style={{padding: 5}}>
											<Button
												variant="contained"
												style={{borderRadius: 10, width: "100%"}}
												onClick={handleDeleteClassroom}
											>Supprimer la classe</Button>
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