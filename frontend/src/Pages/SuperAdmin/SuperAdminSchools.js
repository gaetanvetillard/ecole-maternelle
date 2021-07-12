import React, { useEffect, useState } from "react";
import styled from 'styled-components'

import { H1, H2, H3 } from "../../Styles/Titles";

import {Button, Grid, TextField} from "@material-ui/core"
import Navbar from "../../Components/Navbar";
import { BlocPage, ListItemDiv, WrapperDiv } from "../../Styles/Divs";
import { YellowDividerH2 } from "../../Styles/Dividers";
import { LoadingItem, LoadingPage } from "../../Components/Loading";
import { Delete } from "@material-ui/icons";
import { SearchbarXS } from "../../Components/SearchBar";


const SuperAdminSchools = props => {
  const [userInfos, setUserInfos] = useState(null);
  const [schools, setSchools] = useState(null)
  const [addLoading, setAddLoading] = useState(false);
  const [page, setPage] = useState(1)
  const [globalPageHasLoading, setGlobalPageHasLoading] = useState(false);
  const [zipCode, setZipCode] = useState("")

  useEffect(() => {
    fetch('/api/is_login')
      .then(res => {
        if (res.ok) {
          res.json()
            .then(data => {
              if (data.role !== 1000) {
                props.history.push('/')
              } else {
                setUserInfos(data);
                fetch(`/api/super_admin/get_schools/1`)
                  .then(res => {
                    if (res.ok) {
                      res.json()
                        .then(data => {
                          setSchools(data);
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

  const searchZipCode = () => {
    if (zipCode.length >= 2) {
      setPage(1)
      fetch(`/api/super_admin/get_schools/1?zipcode=${zipCode}`)
        .then(res => {
          if (res.ok) {
            res.json()
              .then(data => setSchools(data))
          }
        })
    } else if (zipCode.length === 0) {
      setPage(1)
      fetch(`/api/super_admin/get_schools/1`)
        .then(res => {
          if (res.ok) {
            res.json()
              .then(data => setSchools(data))
          }
        })
    } else {
      alert('Le code postal doit au moins contenir 2 chiffres.')
    }
  }

  const handleFetchNewPage = () => {
    setAddLoading(true)
    setPage(page+1)
    if (zipCode) {
      fetch(`/api/super_admin/get_schools/${page + 1}?zipcode=${zipCode}`)
        .then(res => {
          if (res.ok) {
            res.json()
              .then(data => {
                let schools_list = [...schools.schools].filter(school => {
                  for (let school_ of data.schools) {
                    if (school.id === school_.id) {
                      return false;
                    }
                  }
                  return true;
                })
                schools_list.push(...data.schools)
                setSchools(prev => {
                  return {
                    pages_count: data.pages_count, 
                    schools: schools_list
                  }
                });
                setAddLoading(false)
              })
          } else {
            res.json()
              .then(data => alert(data))
          }
        })
    } else if (!zipCode) {
      fetch(`/api/super_admin/get_schools/${page + 1}`)
        .then(res => {
          if (res.ok) {
            res.json()
              .then(data => {
                let schools_list = [...schools.schools].filter(school => {
                  for (let school_ of data.schools) {
                    if (school.id === school_.id) {
                      return false;
                    }
                  }
                  return true;
                })
                schools_list.push(...data.schools)
                setSchools({
                    pages_count: data.pages_count, 
                    schools: schools_list
                  });
                setAddLoading(false)
              })
          } else {
            res.json()
              .then(data => alert(data))
          }
        })
    }
    
  }

  const handleDeleteSchool = (id) => {
    
    let confirmation = window.confirm('Êtes vous sûr de vouloir supprimer cette école ? Vous supprimerez également TOUS les comptes des utilisateurs.')
    if (confirmation) {
      let requestParams = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          id: id
        })
      };

      fetch('/api/super_admin/delete_school', requestParams)
        .then(res => {
          if (res.ok) {
            let new_list = schools.schools.filter(school => school.id !== id)
            setSchools(prev => {return {...prev, schools: new_list}})
          } else {
            res.json()
              .then(data => {
                alert(data["Error"])
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
            <H1>Gestion des écoles</H1>
          </Grid>
        </Grid>

        {/* schools list */}
        <Grid container>
          <Grid item xs={12} align="center">
            <WrapperDiv style={{margin: "10px 5%"}}>
              <Grid container>
                <Grid item xs={12} align="center">
                  <H2>Liste des écoles</H2>
                  <YellowDividerH2 />
                  <Grid container>
                    <Grid item xs={12} align="center">
                      <SearchbarXS 
                        searchFunction={searchZipCode}
                        onChangeFunction={e => ("0123456789".includes(e.nativeEvent.data) || e.nativeEvent.data === null) && setZipCode(e.target.value)} 
                        value={zipCode} 
                        placeholder="Code postal"/>
                    </Grid>
                  </Grid>


                  <Grid container>
                    <Grid item xs={12} align="center">
                      {schools.schools && schools.schools.map(school => {
                        return (
                          <ListItemDiv key={school.id} style={{cursor: "default"}}>
                            <div>
                              <p><strong>{school.name}</strong></p>
                              <p>{school.address}, {school.zipcode} {school.city}</p>
                            </div>
                            <Delete
                              style={{cursor: "pointer"}}
                              onClick={() => handleDeleteSchool(school.id)}
                            />
                          </ListItemDiv>
                        )
                      })}
                    </Grid>
                  </Grid>
                </Grid>

                <Grid container>
                  <Grid item xs={12} align="center">
                    {(page < schools.pages_count && !addLoading) &&            
                      <Button
                        style={{marginTop: 10}}
                        variant="contained"
                        onClick={handleFetchNewPage}
                      >
                        Charger plus d'écoles
                      </Button>
                    }
                    {addLoading &&
                    <div style={{marginTop: 10}}>
                      <LoadingItem size={"40px"} />
                    </div>
                    }
                  </Grid>
                </Grid>
              </Grid>
            </WrapperDiv>
          </Grid>
        </Grid>

        <Grid container>
          <Grid item xs={12} align="center">
            <WrapperDiv style={{margin: "10px 5%"}}>
              <H2>Ajouter une école</H2>
              <YellowDividerH2 />
              <WrapperDiv>
                <AddSchoolForm setAddLoading={setAddLoading} setListFunction={setSchools} />
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

const AddSchoolForm = props => {

  const [formFields, setFormsFields] = useState({
    school: {
      name: "",
      address: "",
      zipcode: "",
      city: "",
    },
    admin: {
      name: "",
      firstname: "",
      email: ""
    }
  })

  const handleAddSchool = e => {
    if (
      formFields.school.name
      && formFields.school.address
      && formFields.school.zipcode
      && formFields.school.city
      && formFields.admin.name
      && formFields.admin.firstname
      && formFields.admin.email
    ) {
      e.preventDefault();
      props.setAddLoading(true);
      const requestParams = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(formFields)
      };

      setFormsFields({
        school: {
          name: "",
          address: "",
          zipcode: "",
          city: "",
        },
        admin: {
          name: "",
          firstname: "",
          email: ""
        }
      })

      fetch('/api/super_admin/add_school', requestParams)
        .then(res => {
          if (res.ok) {
            res.json()
              .then(data => {
                props.setListFunction(prev => {return {...prev, schools: [...prev.schools, data]}});
                props.setAddLoading(false)
              })
          } else {
            res.json()
              .then(data => {
                alert(data['Error'])
              })
          }
        })

    }
  }


  return (
    <Form>
      <Grid container style={{display: "flex", justifyContent: "space-around"}}>
        <Grid item xs={12} md={6} style={{display: "flex", flexDirection: "column", maxWidth: 300}}>
          <H3>Infos de l'école</H3>
          <TextField onChange={e => setFormsFields(prev => {
            return {...prev, school: {...prev.school, name: e.target.value}}
          })} label="Nom" required autoComplete="none" value={formFields.school.name}/>
          <TextField onChange={e => setFormsFields(prev => {
            return {...prev, school: {...prev.school, address: e.target.value}}
          })} label="Adresse" required autoComplete="none" value={formFields.school.address}/>
          <TextField onChange={e => setFormsFields(prev => {
            return {...prev, school: {...prev.school, zipcode: e.target.value}}
          })} label="Code postal" type='number' required autoComplete="none" value={formFields.school.zipcode}/>
          <TextField onChange={e => setFormsFields(prev => {
            return {...prev, school: {...prev.school, city: e.target.value}}
          })} label="Ville" required autoComplete="none" value={formFields.school.city}/>
        </Grid>

        <Grid item xs={12} md={6} style={{display: "flex", flexDirection: "column", maxWidth: 300}}>
          <H3>Infos de l'administrateur</H3>
          <TextField onChange={e => setFormsFields(prev => {
            return {...prev, admin: {...prev.admin, name: e.target.value}}
          })} label="Nom" required autoComplete="none" value={formFields.admin.name}/>
          <TextField onChange={e => setFormsFields(prev => {
            return {...prev, admin: {...prev.admin, firstname: e.target.value}}
          })} label="Prénom" required autoComplete="none" value={formFields.admin.firstname}/>
          <TextField onChange={e => setFormsFields(prev => {
            return {...prev, admin: {...prev.admin, email: e.target.value}}
          })} label="Adresse mail" required autoComplete="none" value={formFields.admin.email}/>
        </Grid>
      </Grid>

      
      <Button
        variant="contained"
        style={{width: '100%', marginTop: 15}}
        type="submit"
        onClick={e => handleAddSchool(e)}
      >
        Valider
      </Button>
    </Form>
  )


}

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
`;


export default SuperAdminSchools;