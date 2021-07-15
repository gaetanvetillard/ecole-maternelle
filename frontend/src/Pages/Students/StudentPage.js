import React, { useEffect, useState } from "react";
import { H1 } from "../../Styles/Titles";

import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid} from "@material-ui/core"
import Navbar from "../../Components/Navbar";
import { LoadingPage } from "../../Components/Loading";

import {Skill} from "../../Components/Skills/TeacherSkill";
import { BlocPage } from "../../Styles/Divs";
import Searchbar from "../../Components/SearchBar";
import { ProgressBar } from "../../Components/ProgressBar";
import { PictureAsPdf } from "@material-ui/icons";
import styled from "styled-components";
import PDF from "../../Components/PDF";


const StudentPage = props => {
  const [userInfos, setUserInfos] = useState(null);
  const [globalPageHasLoading, setGlobalPageHasLoading] = useState(false);
  const [studentInfos, setStudentInfos] = useState(null);
  const [totalValidatedItems, setTotalValidatedItems] = useState(null)
  const [searchField, setSearchField] = useState('')
  const [askPDF, setAskPDF] = useState(false);
  const [confirmAskPDF, setConfirmAskPDF] = useState(false);

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
    <> 
      <BlocPage>
        <Grid container>
          <Grid item align="center" xs={12}>
            <H1>{studentInfos.firstname} {studentInfos.name}</H1>
          </Grid>
        </Grid>
  
        <Searchbar onChangeFunction={e => setSearchField(e.target.value)} value={searchField}/>

        <Grid container>
          <Grid item xs={12} align="center" style={{margin: "20px 5% 0"}}>
            <PDFButton onClick={() => setAskPDF(true)}><PictureAsPdf style={{width: "24px", height: "24px", marginRight: "10px"}}/>Générer en PDF</PDFButton>

            <ProgressBar validated={totalValidatedItems} total={studentInfos.total_items}/>
          </Grid>
        </Grid>

        {/* Liste des compétences */}
        <Grid container style={{marginTop: 15}}>
          <Grid item xs={12} align="center">
            {studentInfos.skills.length > 0 && studentInfos.skills.filter(e => includesChar(e)).map(skill => {
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


      <Dialog
        open={askPDF}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Attention</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {!confirmAskPDF ?
              "Générer un fichier PDF consomme des données et peut prendre quelques temps avant de se générer en totalité. Assurez-vous d'avoir une connexion stable avant de générer le fichier PDF."
              :
              "Le fichier PDF est en train de se générer, ne quittez pas cette page."
            }
          </DialogContentText>
          <div style={{display: "flex", justifyContent: "center"}}><br />{askPDF && confirmAskPDF && <PDF data={studentInfos} closePage={() => {setConfirmAskPDF(false); setAskPDF(false)}} />}</div>
        </DialogContent>
        <DialogActions>
          {!confirmAskPDF &&
          <>
            <Button onClick={() => setAskPDF(false)} color="primary">
              Annuler
            </Button>
            <Button onClick={() => { setConfirmAskPDF(true)}} color="primary">
              Générer le PDF
            </Button>
          </>
          }
        </DialogActions>
      </Dialog>
    </>
    )
  } else {
    return <LoadingPage />
  }
};

const PDFButton = styled.div`
  width: 200px;
  background: #ffb535;
  padding: 5px;
  border-radius: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 15px;
  cursor: pointer;
  box-shadow: 0px 5px 5px -3px rgb(0 0 0 / 20%), 0px 8px 10px 1px rgb(0 0 0 / 14%), 0px 3px 14px 2px rgb(0 0 0 / 12%);
`;


export default StudentPage;