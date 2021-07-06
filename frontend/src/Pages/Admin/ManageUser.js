import React, { useEffect, useState } from "react";
import { H1, H2, H3 } from "../../Styles/Titles";

import {Button, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select} from "@material-ui/core"
import Navbar from "../../Components/Navbar";
import { BlocPage, WrapperDiv } from "../../Styles/Divs";
import { LoadingPage } from "../../Components/Loading";
import { YellowDividerH2 } from "../../Styles/Dividers";
import { InfosInput } from "./AdminPanel";
import { Lock, Save } from "@material-ui/icons";

const ManageUser = props => {
  const [globalPageHasLoading, setGlobalPageHasLoading] = useState(false);
  const [currentUserInfos, setCurrentUserInfos] = useState(null);
  const [userInfos, setUserInfos] = useState(null);
  const [newName, setNewName] = useState(null);
  const [newFirstname, setNewFirstname] = useState(null);
  const [newEmail, setNewEmail] = useState(null);
  const [newClassroom, setNewClassroom] = useState(null);


  useEffect(() => {
    fetch('/api/is_login')
      .then(res => {
        if (res.ok) {
          res.json()
            .then(data => {
              if (data.role !== 100) {
                props.history.push('/')
              } else {
                setCurrentUserInfos(data);
                fetch(`/api/admin/get_user_info/${props.match.params.user_id}`)
                  .then(res => {
                    if (res.ok) {
                      res.json()
                        .then(data => {
                          setUserInfos(data);
                          setGlobalPageHasLoading(true)
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
  }, [props.history, props.match.params.user_id])

  const handleSaveNewValue = (toEdit, newValue, setNewValue, userId, setNewUserInfos) => {
    if (newValue) {
      let requestParams = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          to_edit: toEdit,
          new_value: newValue,
          user_id: userId
        })
      }
      fetch('/api/admin/edit_user_info', requestParams)
        .then(res => {
          if (res.ok) {
            switch (toEdit) {
              case "email":
                setNewUserInfos(prev => {
                  return {...prev, email: newValue}
                });
                break;
              
              case "name":
                setNewUserInfos(prev => {
                  return {...prev, name: newValue.toUpperCase()}
                });
                break;

              case "firstname":
                setNewUserInfos(prev => {
                  return {...prev, firstname: newValue.charAt(0).toUpperCase() + newValue.slice(1).toLowerCase()}
                });
                break;
              
              default:
                console.log('Error on to_edit value')
            }
            setNewValue(null);
          }
        })
    }
  }

  const handleDeleteUser = () => {
    let confirmation = null
    if (userInfos.role === 0) {
      confirmation = window.confirm(`Attention, vous êtes sur le point de supprimer le compte de ${userInfos.firstname} ${userInfos.name}. Êtes-vous sur de vouloir continuer ?`)
    } else if (userInfos.role === 10) {
      confirmation = window.confirm(`Attention, vous êtes sur le point de supprimer le compte de ${userInfos.firstname} ${userInfos.name}. Cette action supprimera aussi la classe reliée à ce compte s'il y en a une (mais ne supprimera pas les comptes des élèves). Êtes-vous sur de vouloir continuer ?`)
    }
    if (confirmation) {
      let requestParams = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          user_id: userInfos.id
        })
      }
      fetch('/api/admin/delete_user', requestParams)
        .then(res => {
          if (res.ok) {
            props.history.push('/admin/users')
          } else {
            res.json()
              .then(data => {
                alert(data["Error"])
              })
          }
        })
    } else {
      return
    }
  }

  const handleTransferClassroom = (e) => {
    if (newClassroom) {
      e.preventDefault();

      let confirmation = null;
      if (userInfos.classroom) {
        confirmation = window.confirm(`Vous êtes sur le point de déplacer ${userInfos.firstname} ${userInfos.name} de la classe de ${userInfos.classroom.teacher.firstname} ${userInfos.classroom.teacher.name} vers la classe de ${newClassroom.teacher.firstname} ${newClassroom.teacher.name}. Êtes-vous sûr de vouloir continuer ?`)
      } else {
        confirmation = window.confirm(`Vous êtes sur le point de déplacer ${userInfos.firstname} ${userInfos.name} vers la classe de ${newClassroom.teacher.firstname} ${newClassroom.teacher.name}. Êtes-vous sûr de vouloir continuer ?`)
      }
      if (confirmation) {
        let requestParams = {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            classroom_id: newClassroom.id,
            user_id: userInfos.id
          })
        };

        setNewClassroom("");

        fetch('/api/admin/transfer_student', requestParams)
          .then(res => {
            if (res.ok) {
              res.json()
                .then(data => {
                  // Set new classroom
                  let new_other_classrooms = userInfos.other_classrooms.filter( classroom => {
                    return classroom.id !== data.id
                  })
                  setUserInfos(prev => {return {...prev, classroom: data, other_classrooms: new_other_classrooms}})
                })
            } else {
              res.json()
                .then(data => alert(data['Error']))
            }
          })
      }
    }
  }

  const handleRemoveClassroom = () => {
    if (userInfos.classroom) {
      let confirmation = window.confirm(`Êtes-vous sûr de vouloir retirer ${userInfos.firstname} ${userInfos.name} de sa classe ?`)
      if (confirmation) {
        let old_classroom = userInfos.classroom
        setUserInfos(prev => {return {...prev, classroom: null}})

        const requestParams = {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            user_id: userInfos.id
          })
        };

        fetch('/api/admin/remove_student', requestParams)
          .then(res => {
            if (res.ok) {          
              setUserInfos(prev => {return {
                ...prev, 
                classroom: null, 
                other_classrooms: [...userInfos.other_classrooms, old_classroom]
              }});
            } else {
              res.json()
                .then(data => {
                  alert(data['Error']);
                  setUserInfos(prev => {return {...prev, classroom: old_classroom}})
                })
            }
          })

      }
    }
  }

  if (globalPageHasLoading) { 
    return (
      <BlocPage>
        <Grid container>
          <Grid item align="center" xs={12}>
            <H1>{userInfos.firstname} {userInfos.name}</H1>
            <H3 style={{marginTop: 0}}>
              {userInfos.role === 1 && `Élève${userInfos.classroom ? ` de ${userInfos.classroom.teacher.firstname} ${userInfos.classroom.teacher.name}` : ""}`}
              {userInfos.role === 10 && "Maître·sse"}
            </H3>
          </Grid>
        </Grid>

        <Grid container>
          <Grid item xs={12} align="center">
            <WrapperDiv style={{margin: "20px 5% 10px"}}>
              <H2>Informations du compte</H2>
              <YellowDividerH2 />
              <WrapperDiv>
                <Grid container>
                  <Grid item xs={12} md={6} align="center">
                    <WrapperDiv style={{margin: 5}}>
                      <H3>Nom :</H3>
                      <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                        <InfosInput defaultValue={userInfos.name} type="text" onChange={e => setNewName(e.target.value)} autoComplete="none"/>
                        {newName ?
                          <Save onClick={() => handleSaveNewValue("name", newName, setNewName, userInfos.id, setUserInfos)} style={{cursor: "pointer"}}/>
                          :
                          <Save style={{fill: "white"}}/>
                        }
                      </div>    
                    </WrapperDiv>
                  </Grid>

                  <Grid item xs={12} md={6} align="center">
                    <WrapperDiv style={{margin: 5}}>
                      <H3>Prénom :</H3>
                      <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                        <InfosInput defaultValue={userInfos.firstname} type="text" onChange={e => setNewFirstname(e.target.value)} autoComplete="none"/>
                        {newFirstname ?
                          <Save onClick={() => handleSaveNewValue("firstname", newFirstname, setNewFirstname, userInfos.id, setUserInfos)} style={{cursor: "pointer"}}/>
                          :
                          <Save style={{fill: "white"}}/>
                        }
                      </div>    
                    </WrapperDiv>
                  </Grid>
                </Grid>

                <Grid container>
                  <Grid item xs={12} md={6} align="center">
                    <WrapperDiv style={{margin: 5}}>
                      <H3>Nom d'utilisateur :</H3>
                      <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                        <InfosInput style={{width: "auto"}} defaultValue={userInfos.username} type="text" autoComplete="none" disabled/>
                        <Lock />
                      </div>    
                    </WrapperDiv>
                  </Grid>

                  <Grid item xs={12} md={6} align="center">
                    <WrapperDiv style={{margin: 5}}>
                      <H3>Adresse mail :</H3>
                      <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                        <InfosInput defaultValue={userInfos.email} type="text" onChange={e => setNewEmail(e.target.value)} autoComplete="none"/>
                        {newEmail ?
                          <Save onClick={() => handleSaveNewValue("email", newFirstname, setNewEmail, userInfos.id, setUserInfos)} style={{cursor: "pointer"}}/>
                          :
                          <Save style={{fill: "white"}}/>
                        }
                      </div>    
                    </WrapperDiv>
                  </Grid>
                </Grid>

                <Grid container>
                  <Grid item xs={12} style={{padding: 5}}>
                    <Button
                      variant="contained"
                      style={{width: "100%", borderRadius: 10}}
                      onClick={handleDeleteUser}
                    >Supprimer cet utilisateur
                    </Button>
                  </Grid>  
                </Grid>
              </WrapperDiv>
            </WrapperDiv>
          </Grid>
        </Grid>


        {userInfos.role === 1 && 
        <Grid container>
          <Grid item xs={12} align="center">
            <WrapperDiv style={{margin: "10px 5%"}}>
              <H2>Classe</H2>
              <YellowDividerH2 />
              <WrapperDiv>
                <Grid container>
                  <Grid item xs={12} md={6} align="center">
                    <WrapperDiv style={{margin: 5}}>
                      <H3>Transférer</H3>
                      <form>
                        <div style={{display: "flex", justifyContent: "center"}}>
                          <FormControl style={{maxWidth: "300px", width: "100%"}} required disabled={userInfos.other_classrooms.length === 0}>
                            <InputLabel id="username-label">Classe</InputLabel>
                            <Select
                              labelId="username"
                              value={newClassroom ? newClassroom : ""}
                              onChange={e => setNewClassroom(e.target.value)}
                            >
                              {userInfos.other_classrooms && userInfos.other_classrooms.map(classroom => {
                                return <MenuItem
                                          key={classroom.id}
                                          value={classroom}
                                        >{classroom.teacher.name} {classroom.teacher.firstname}</MenuItem>
                              }) }
                            </Select>
                            {userInfos.other_classrooms.length === 0 && <FormHelperText>Aucune classe disponible</FormHelperText>}
                          </FormControl>
                        </div>
                        <Button 
                          type="submit" 
                          variant="contained" 
                          style={{width: "100%", maxWidth: 300, marginTop: 10}} 
                          onClick={e => handleTransferClassroom(e)}
                        >
                          Transférer
                        </Button>
                      </form>
                    </WrapperDiv>
                  </Grid> 
                  <Grid item xs={12} md={6} align="center">
                    <WrapperDiv style={{margin: 5}}>
                      <H3>Retirer de la classe</H3>
                      {userInfos.classroom ?
                        <Button
                        variant="contained"
                        style={{width: "100%", maxWidth: 300}}
                        onClick={handleRemoveClassroom}
                        >Retirer de la classe</Button>
                        :
                        <Button
                        variant="contained"
                        style={{width: "100%", maxWidth: 300}}
                        disabled
                        >Retirer de la classe</Button>
                      }
                    </WrapperDiv>
                  </Grid>
                </Grid>
              </WrapperDiv>
            </WrapperDiv>
          </Grid>
        </Grid>
        }

        <Navbar {...props} userInfos={currentUserInfos}/>
      </BlocPage>
    )
  } else {
    return <LoadingPage />
  }
  
};

export default ManageUser;