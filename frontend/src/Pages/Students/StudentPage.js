import React, { useEffect, useState } from "react";
import { H1 } from "../../Styles/Titles";

import {Grid} from "@material-ui/core"
import Navbar from "../../Components/Navbar";
import { LoadingPage } from "../../Components/Loading";

import {Skill} from "../../Components/Skills/TeacherSkill";
import { BlocPage } from "../../Styles/Divs";
import Searchbar from "../../Components/SearchBar";
import { ProgressBar } from "../../Components/ProgressBar";


const StudentPage = props => {
  const [userInfos, setUserInfos] = useState(null);
  const [globalPageHasLoading, setGlobalPageHasLoading] = useState(false);
  const [studentInfos, setStudentInfos] = useState(null);
  const [totalValidatedItems, setTotalValidatedItems] = useState(null)

  useEffect(() => {
    fetch('/api/is_login')
      .then(res => {
        if (res.ok) {
          res.json()  
            .then(data => {
              if (data.role === 1 || data.role === 10) {
                setUserInfos(data);
                if (data.role === 1) {
                  fetch('/api/student/get_infos')
                    .then(res => {
                      res.json()
                        .then(data => {
                          setStudentInfos(data);
                          setTotalValidatedItems(data.total_validated_items);
                          setGlobalPageHasLoading(true);
                        })
                    })
                } else {
                  const classroomId = props.match.params.classroomId;
                  const studentUsername = props.match.params.studentUsername;
                  fetch(`/api/teacher/get_student_infos/${classroomId}/${studentUsername}`)
                    .then(res => {
                      if (res.ok) { 
                        res.json()
                          .then(data => {
                            if (data.is_allowed) {
                              setStudentInfos(data);
                              setTotalValidatedItems(data.total_validated_items);
                              setGlobalPageHasLoading(true)
                            }
                          })
                      } else {
                        props.history.push('/')
                      }
                    })
                }
              } else {
                props.history.push('/')
              }
            })
        }
      })

  }, [props.history, props.match.params.classroomId, props.match.params.studentUsername])


  if (globalPageHasLoading) {
    return (
      <BlocPage>
        <Grid container>
          <Grid item align="center" xs={12}>
            <H1>{studentInfos.firstname} {studentInfos.name}</H1>
          </Grid>
        </Grid>
  
        <Searchbar/>

        <div style={{margin: "20px 5% 0"}}>
          <ProgressBar validated={totalValidatedItems} total={studentInfos.total_items}/>
        </div>

        {/* Liste des compétences */}
        <Grid container style={{marginTop: 15}}>
          <Grid item xs={12} align="center">
            {studentInfos.skills.length > 0 && studentInfos.skills.map(skill => {
              return <Skill 
                skill={skill} 
                key={skill.id} 
                role={userInfos.role} 
                studentUsername={props.match.params.studentUsername}
                setTotalValidatedItems={setTotalValidatedItems}
              />
            })}
            {studentInfos.skills.length === 0 &&
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
};

export default StudentPage;