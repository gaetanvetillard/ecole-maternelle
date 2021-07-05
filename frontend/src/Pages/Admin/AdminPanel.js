import React, {useEffect, useState} from "react";
import {Grid} from "@material-ui/core";
import styled from 'styled-components';

import Navbar from "../../Components/Navbar";
import SearchBar from "../../Components/SearchBar";
import { WrapperDiv, BlocPage } from "../../Styles/Divs";
import {LoadingPage} from '../../Components/Loading';
import { YellowDividerH2 } from "../../Styles/Dividers";
import { H1, H2, H3 } from "../../Styles/Titles";
import { Save } from "@material-ui/icons";


const AdminPanel = props => {
  const [userInfos, setUserInfos] = useState(null);
  const [schoolInfos, setSchoolInfos] = useState(null);
  const [globalPageHasLoading, setGlobalPageHasLoading] = useState(false);
  const [newName, setNewName] = useState(null);
  const [newAddress, setNewAddress] = useState(null);
  const [newZipCode, setNewZipCode] = useState(null);
  const [newCity, setNewCity] = useState(null);

  useEffect(() => {
    fetch('/api/is_login')
      .then(res => {
        if (res.ok) {
          res.json()
            .then(data => {
              setUserInfos(data)
              if (data.role !== 100) {
                props.history.push('/')
              } else {
                fetch('/api/admin/get_school_infos')
                  .then(res => {
                    if (res.ok) {
                      res.json()
                        .then(data => {
                          setSchoolInfos(data);
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

  const handleSaveNewValue = (toEdit, newValue, setNewValue) => {
    if (newValue) {
      let requestParams = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          to_edit: toEdit,
          new_value: newValue
        })
      }
      fetch('/api/admin/edit_school_infos', requestParams)
        .then(res => {
          if (res.ok) {
            setNewValue(null)
          }
        })
    }
  }

  if (globalPageHasLoading) {
    return (
      <BlocPage>
        <Grid container>
          <Grid item align="center" xs={12}>
            <H1>Panel Admin</H1>
          </Grid>
        </Grid>

        <SearchBar />

        <Grid container>
          <Grid item xs={12} align="center">
            <WrapperDiv style={{margin: "10px 5%"}}>
              <Grid container>
                <Grid item xs={12} align="center">
                  <H2>Informations de l'école</H2>
                  <YellowDividerH2 />
                  <WrapperDiv>
                    <Grid container>
                      <Grid item xs={6} align="center">
                        <WrapperDiv style={{marginRight: 5}}>
                          <H3>Nom :</H3>
                          <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                            <InfosInput defaultValue={schoolInfos.name} type="text" onChange={e => setNewName(e.target.value)} autoComplete="none"/>
                            {newName ?
                              <Save onClick={() => handleSaveNewValue("name", newName, setNewName)} style={{cursor: "pointer"}}/>
                              :
                              <Save style={{fill: "white"}}/>
                            }
                          </div>    
                        </WrapperDiv>
                      </Grid>
                      <Grid item xs={6} align="center">
                        <WrapperDiv style={{marginLeft: 5}}>
                          <H3>Adresse :</H3>
                          <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                            <InfosInput defaultValue={schoolInfos.address} type="text" onChange={e => setNewAddress(e.target.value)} autoComplete="none"/>
                            {newAddress ?
                              <Save onClick={() => handleSaveNewValue("address", newAddress, setNewAddress)} style={{cursor: "pointer"}}/>
                              :
                              <Save style={{fill: "white"}}/>
                            }
                          </div>  
                        </WrapperDiv>
                      </Grid>
                      <Grid item xs={6} align="center">
                        <WrapperDiv style={{marginRight: 5}}>
                          <H3>Code postal :</H3>
                          <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                            <InfosInput defaultValue={schoolInfos.zipcode} type="text" onChange={e => setNewZipCode(e.target.value)} autoComplete="none"/>
                            {newZipCode ?
                              <Save onClick={() => handleSaveNewValue("zipcode", newZipCode, setNewZipCode)} style={{cursor: "pointer"}}/>
                              :
                              <Save style={{fill: "white"}}/>
                            }
                          </div>
                        </WrapperDiv>
                      </Grid>
                      <Grid item xs={6} align="center">
                        <WrapperDiv style={{marginLeft: 5}}>
                          <H3>Ville :</H3>
                          <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                            <InfosInput defaultValue={schoolInfos.city} type="text" onChange={e => setNewCity(e.target.value)} autoComplete="none"/>
                            {newCity ?
                              <Save onClick={() => handleSaveNewValue("city", newCity, setNewCity)} style={{cursor: "pointer"}}/>
                              :
                              <Save style={{fill: "white"}}/>
                            }
                          </div>
                        </WrapperDiv>
                      </Grid>
                    </Grid>
                  </WrapperDiv>
                </Grid>
              </Grid>
            </WrapperDiv>
          </Grid>
        </Grid>

        <Grid container>
          <Grid item xs={12} align="center">
            <WrapperDiv style={{margin: "10px 5%"}}>
              <Grid container>
                <Grid item xs={12} align="center">
                  <H2>Gestion de l'école</H2>
                  <YellowDividerH2 />
                </Grid>
                <Grid item xs={6} align="center" style={{padding: "0 5px 0 0"}}>
                  <WrapperDiv>
                    <H3>Nombre de classes</H3>
                    <WrapperDiv>
                      <H1>{schoolInfos.classrooms_count}</H1>
                    </WrapperDiv>
                  </WrapperDiv>
                </Grid>
                <Grid item xs={6} align="center" style={{padding: "0 0 0 5px"}}>
                  <WrapperDiv>
                    <H3>Nombre d'élèves</H3>
                    <WrapperDiv>
                      <H1>{schoolInfos.students_count}</H1>
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
                  <WrapperDiv>
                    <H3>Ajouter des items</H3>
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


const InfosInput = styled.input`
  text-align: center;
  font-size: 16px;
  outline: none;
  border: none;
  width: 100%;

  @media screen and (min-width: 768px) {
    font-size: 20px;
  }
`;


export default AdminPanel;