import React, { useEffect, useState } from "react";
import { H1 } from "../../Styles/Titles";

import {Grid} from "@material-ui/core"
import Navbar from "../../Components/Navbar";
import { LoadingPage } from "../../Components/Loading";

import {Skill} from "../../Components/Skills/TeacherSkill";
import { BlocPage } from "../../Styles/Divs";
import Searchbar from "../../Components/SearchBar";



const SkillsListTeacher = props => {
  const [userInfos, setUserInfos] = useState(null);
  const [globalPageHasLoading, setGlobalPageHasLoading] = useState(false);
  const [searchField, setSearchField] = useState('')
  const [skills, setSkills] = useState(null)


  useEffect(() => {
    fetch('/api/is_login')
      .then(res => {
        if (res.ok) {
          res.json()  
            .then(data => {
              if (data.role !== 10) {
                props.history.push('/')
              } else {
                setUserInfos(data);
                fetch('/api/teacher/multiple_validation_get_skills')
                  .then(res => {
                    if (res.ok) {
                      res.json()  
                        .then(data => {
                          setSkills(data);
                          setGlobalPageHasLoading(true);
                        })
                    }
                  })
              }
        })
      }

  })}, [props.history])

  const includesChar = e => {
    if (e.name) {
      if (`${e.name.toLowerCase()}`.includes(searchField.toLowerCase())) {
        return e
      } else {
        for (let subskill of e.subskills) {
          if (`${subskill.name.toLowerCase()}`.includes(searchField.toLowerCase())) {
            return e
          } else {
            for (let item of subskill.items) {
              if (`${item.label.toLowerCase()}`.includes(searchField.toLocaleLowerCase())) {
                return e
              }
            }
          }
        }
      }
    }
  }


  if (globalPageHasLoading) {
    return ( 
    <BlocPage>
      <Grid container>
        <Grid item align="center" xs={12}>
          <H1>Les compétences</H1>
        </Grid>
      </Grid>

      <Searchbar onChangeFunction={e => setSearchField(e.target.value)} value={searchField}/>



      {/* Liste des compétences */}
      <Grid container style={{marginTop: 15}}>
        <Grid item xs={12} align="center">
          {skills.length > 0 && skills.filter(e => includesChar(e)).map(skill => {
            return <Skill 
              skill={skill} 
              key={skill.id} 
              role={userInfos.role} 
              multiple={true}
            />
          })}
          {skills.length === 0 &&
            <h3>Aucune compétence</h3>
          }
        </Grid>
      </Grid>

      <Navbar {...props} userInfos={userInfos} />
    </BlocPage>
    )
  } else {
    return <LoadingPage />
  }

}

export default SkillsListTeacher