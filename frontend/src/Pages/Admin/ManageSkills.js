import React, { useEffect, useState } from "react";
import { H1 } from "../../Styles/Titles";

import {Grid} from "@material-ui/core"
import Navbar from "../../Components/Navbar";
import { LoadingPage } from '../../Components/Loading';
import {BlocPage} from '../../Styles/Divs';
import { Skill } from "../../Components/Skills/SuperAdminSkill";

const ManageSkills = props => {
  const [userInfos, setUserInfos] = useState(null);
  const [globalPageHasLoading, setGlobalPageHasLoading] = useState(false);
  const [skills, setSkills] = useState([]);


  useEffect(() => {
    fetch('/api/is_login')
      .then(res => {
        res.json()
          .then(data => {
            if (data.role !== 100) {
              props.history.push('/')
            } else {
              setUserInfos(data);
              fetch('/api/admin/get_skills')
                .then(res => {
                  if (res.ok) {
                    res.json()
                      .then(data => {
                        setSkills(data);
                        setGlobalPageHasLoading(true);
                      })
                  } else {
                    res.json()
                      .then(data => alert(data['Error']))
                  }
                })
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
            {skills.length > 0 && skills.map(skill => {
              return <Skill skill={skill} key={skill.id} setSkills={setSkills} role={100}/>
            })}
            {skills.length === 0 &&
              <h3>Aucune compétence</h3>
            }
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