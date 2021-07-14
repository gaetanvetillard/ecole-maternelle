import { Grid } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { LoadingItem, LoadingPage } from '../../Components/Loading';
import Navbar from '../../Components/Navbar';
import { AddSkill, Skill } from '../../Components/Skills/SuperAdminSkill';
import { BlocPage } from '../../Styles/Divs';
import { H1 } from '../../Styles/Titles';


const SuperAdminSkills = props => {
  const [userInfos, setUserInfos] = useState(null);
  const [globalPageHasLoading, setGlobalPageHasLoading] = useState(false);
  const [skills, setSkills] = useState(null);
  const [addLoading, setAddLoading] = useState(false);

  

  useEffect(() => {

    fetch('/api/is_login')
      .then(res => {
        if (res.ok) {
          res.json()
            .then(data => {
              if (data.role !== 1000) {
                props.history.push('/');
              } else {
                setUserInfos(data)
                fetch('/api/super_admin/get_skills')
                  .then(res => {
                    if (res.ok) {
                      res.json()
                        .then(data => {
                          setSkills(data);
                          setGlobalPageHasLoading(true)
                        })
                    }
                  })
              }
            })
        } else {
          res.json()
            .then(data => {
              props.history.push('/');
              alert(data["Error"])
            })
        }
      })

  }, [props.history])

  if (globalPageHasLoading) {
    return (
      <BlocPage>
        <Grid container>
          <Grid item xs={12} align="center">
            <H1>Liste des compétences</H1>
          </Grid>
        </Grid>

        {/* Liste des compétences */}
        <Grid container>
          <Grid item xs={12} align="center">
            {skills.length > 0 && skills.map(skill => {
              return <Skill skill={skill} key={skill.id} setSkills={setSkills} role={1000}/>
            })}
            {skills.length === 0 &&
              <h3>Aucune compétence</h3>
            }
            {addLoading &&
              <LoadingItem />
            }
            <AddSkill setAddLoading={setAddLoading} setSkills={setSkills} role={1000}/>
          </Grid>
        </Grid>


        <Navbar {...props} userInfos={userInfos}/>
      </BlocPage>
    )
  } else {
    return <LoadingPage />
  }
}

export default SuperAdminSkills;