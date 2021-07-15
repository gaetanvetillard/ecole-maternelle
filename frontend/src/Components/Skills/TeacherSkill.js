import { Checkbox, Dialog, DialogContent, DialogTitle, FormControlLabel, FormGroup, Grid } from "@material-ui/core";
import { CheckCircleOutline, ExpandLess, ExpandMore } from "@material-ui/icons";
import React, { useState } from "react";
import styled from "styled-components";
import { WrapperDiv } from "../../Styles/Divs";
import { H2, H3 } from "../../Styles/Titles";
import { ItemDiv } from "./SuperAdminSkill";
import {ProgressBarXS} from '../../Components/ProgressBar';



export const Skill = props => {
  const [isExpand, setIsExpand] = useState(false);
  const [validatedItemsCount, setValidatedItemsCount] = useState(props.skill.validated_items_count)

  const skill = props.skill;
  const subskills = props.skill.subskills;

  return (
    <Grid container>
      <Grid item xs={12} align="center">
        <WrapperDiv style={{margin: "10px 5%"}}>
          <div 
            onClick={() => isExpand ? setIsExpand(false) : setIsExpand(true)}
            style={{cursor: "pointer"}} 
          >
              <div style={{display: "flex", justifyContent:"center", alignItems: "center", flexDirection: "column"}}>
                <H2 style={{margin: 0, marginBottom: 5}}>{skill.name}</H2>
                {!props.multiple && <ProgressBarXS validated={validatedItemsCount} total={skill.items_count}/>}
              </div>
              {isExpand ?
                <ExpandLess style={{width: 32, height: 32}} />
                :
                <ExpandMore style={{width: 32, height: 32}}/>
              }
          </div>
          {isExpand && subskills.length > 0 && subskills.map(subskill => {
              return <Subskill 
                key={subskill.id} 
                subskill={subskill} 
                role={props.role} 
                studentUsername={props.studentUsername} 
                setValidatedItemsCount={setValidatedItemsCount}
                setTotalValidatedItems={props.setTotalValidatedItems}
                multiple={props.multiple}
              />
            })
          }
          {isExpand && subskills.length === 0 &&
            <h3>Aucune sous compétence </h3>
          }
          </WrapperDiv>
      </Grid>
    </Grid>
  )
}


const Subskill = props => {
  const [isExpand, setIsExpand] = useState(false);

  const items = props.subskill.items
  const subskill = props.subskill;

  return (
    <WrapperDiv style={{margin: 0, marginTop: 10}}>
      <div 
        onClick={() => isExpand ? setIsExpand(false) : setIsExpand(true)}
        style={{cursor: "pointer"}}
      >
        <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
          <H3>{subskill.name}</H3>
        </div>

        {isExpand ?
          <ExpandLess style={{width: 32, height: 32}} />
          :
          <ExpandMore style={{width: 32, height: 32}}/>
        }
      </div>
      {isExpand && items.length > 0 &&
        <WrapperDiv style={{display: "flex", flexWrap: "nowrap", overflow: "scroll hidden", marginTop: 0}}>
          {items.map((item, index) => <Item 
                item={item} 
                subskill={subskill} 
                key={item.id} 
                index={index} 
                role={props.role} 
                studentUsername={props.studentUsername} 
                setValidatedItemsCount={props.setValidatedItemsCount}
                setTotalValidatedItems={props.setTotalValidatedItems}
                multiple={props.multiple}
              />)}
        </WrapperDiv>
      }
    </WrapperDiv>
  )
}


const Item = props => {
  const [complexDialogOpen, setComplexDialogOpen] = useState(false);
  const [multipleDialogOpen, setMultipleDialogOpen] = useState(false);
  const subskill = props.subskill
  const [item, setItem] = useState(props.item)
  var validatedSubitems = null
  var multipleValidationStudentsCount = 0
  if (props.multiple) {
    for (let s of item.students) {
      if (s.validation) {
        multipleValidationStudentsCount++;
      }
    }
  }
  if (item.subitems) {validatedSubitems = [...item.subitems].filter(subitem_ => subitem_.validation)}


  const handleCheckSubitem = (subitem) => {
    setItem(prev => {
      let newList = [...prev.subitems].filter(subitem_ => subitem_.id !== subitem.id);
      newList.push({
        content: subitem.content, 
        id: subitem.id, 
        validation: !subitem.validation
      });
      newList.sort((a,b) => a.id - b.id)

      // Verify if all validated
      if (newList.length === [...newList].filter(subitem_ => subitem_.validation).length) {
        props.setValidatedItemsCount(prev => prev+1)
        props.setTotalValidatedItems(prev => prev+1)

        return {
          ...prev, 
          subitems: newList,
          validation: {
            status: 1,
            date: new Date().toLocaleDateString("fr-FR", { day: '2-digit', month: 'long', year: "numeric" }),
          }
        }
      } else if ([...newList].filter(subitem_ => subitem_.validation).length === 0) {
        props.setValidatedItemsCount(prev => prev-1)
        props.setTotalValidatedItems(prev => prev-1)

        return {
          ...prev, 
          subitems: newList,
          validation: null
        };

      } else {
        if (item.subitems.length === [...item.subitems].filter(subitem_ => subitem_.validation).length) {
          props.setValidatedItemsCount(prev => prev-1)
          props.setTotalValidatedItems(prev => prev-1)
        } 
        return {
          ...prev, 
          subitems: newList,
          validation: {
            date: null,
            status: 0
          }
        }
      }

      
    })
  }

  const handleCloseComplexDialog = () => {
    setComplexDialogOpen(!complexDialogOpen);

    let requestParams = {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        student_username: props.studentUsername,
        item: item
      })
    };

    fetch('/api/teacher/validate_complex_item', requestParams)
      .then(res => {
        if (!res.ok) {
          res.json()  
            .then(data => {
              alert(data['Error']);
            })
        }
      })

  }

  const handleValidationSimpleItem = () => {
    var validation_ = null
    if (!item.validation) {
      validation_ = {status: 0}
    } else if (item.validation && item.validation.status === 0) {
      validation_ = {
        status: 1,
        date: new Date().toLocaleDateString("fr-FR", { day: '2-digit', month: 'long', year: "numeric" }),
      };
      props.setValidatedItemsCount(prev => prev+1)
      props.setTotalValidatedItems(prev => prev+1)
    } else if (item.validation && item.validation.status === 1) {
      validation_ = null;
      props.setValidatedItemsCount(prev => prev-1)
      props.setTotalValidatedItems(prev => prev-1)
    }

    setItem(prev => {return {
      ...prev,
      validation: validation_
    }})

    let requestParams = {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        student_username: props.studentUsername,
        item: {...item, validation: validation_}
      })
    }

    fetch('/api/teacher/validate_simple_item', requestParams)
      .then(res => {
        if (!res.ok) {
          res.json()  
            .then(data => alert(data['Error']))
        }
      })


  }

  const handleMultipleValidation = () => {
    setMultipleDialogOpen(!multipleDialogOpen);

    let requestParams = {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        item_id: item.id,
        students: item.students,
        date: new Date().toLocaleDateString("fr-FR", { day: '2-digit', month: 'long', year: "numeric" }),
      })
    }

    fetch('/api/teacher/multiple_validation', requestParams)  
      .then(res => {
        if (!res.ok) {
          res.json()  
            .then(data => alert(data['Error']))
        }
      })
  }

  const handleCheckStudent = (student) => {
    let new_student_list = [...item.students].filter(s => s.id !== student.id)
    new_student_list.push({...student, validation: !student.validation})

    setItem(prev => {
      return {...prev, students: new_student_list}
    })
  }

  return (
    <>
      <div style={{display: "flex", flexDirection: "column"}}>
        <ItemDiv>
          {item.validation && item.validation.status === 1 &&
            <div className={"validation_overlay"}>
              <CheckCircleOutline fontSize="large" style={{ color: "#ffb535", fontSize: "60px" }} />
            </div>
          }
          <h4 className={"title"}>{subskill.name} ({props.index+1})</h4>
          <div className="content">
            {item.type === "complex" && !props.multiple && validatedSubitems.length > 0 &&
              validatedSubitems.map((subitem, index) => {
                return <p key={index} style={{padding: 5}}>{subitem.content}</p>
              })
            }
            {item.type === "complex" && props.multiple &&
              item.subitems.map((subitem, index) => {
                return <p key={index} style={{padding: 5}}>{subitem.content}</p>
              })
            }
            {item.type === "complex" && !props.multiple && validatedSubitems.length === 0 &&
              <p style={{pading: 5}}>Aucun sous-item validé</p>
            }
            {item.type === "simple" &&
              <img src={`${item.image_url}`} alt="illustration" />
            }
          </div>
          <p className="label">{item.label}</p>
        </ItemDiv>
        
        {/* TEACHER BUTTONS */}
        {/* COMPLEX ITEMS */}
        {item.type === "complex" && props.role === 10 && item.validation && item.validation.status === 0 &&
          <ValidationButton
            onClick={() => setComplexDialogOpen(true)}  
          >En cours de validation</ValidationButton>
        }
        {item.type === "complex" && props.role === 10 && item.validation && item.validation.status === 1 &&
          <ValidationButton
            onClick={() => setComplexDialogOpen(true)}
          ><strong>{item.validation.date}</strong></ValidationButton>
        }
        {item.type === "complex" && props.role === 10 && !props.multiple && !item.validation &&
          <ValidationButton 
            style={{background: "black", color: "#ffb535"}}
            onClick={() => setComplexDialogOpen(true)}  
          >Non évaluée</ValidationButton>
        }

        {/* SIMPLE ITEMS */}
        {item.type === "simple" && props.role === 10 && !props.multiple && item.validation && item.validation.status === 0 &&
          <ValidationButton
            onClick={handleValidationSimpleItem}
          >En cours de validation</ValidationButton>
        }
        {item.type === "simple" && props.role === 10 && !props.multiple && item.validation && item.validation.status === 1 &&
          <ValidationButton
            onClick={handleValidationSimpleItem}
          ><strong>{item.validation.date}</strong></ValidationButton>
        }
        {item.type === "simple" && props.role === 10 && !props.multiple && !item.validation &&
          <ValidationButton
            onClick={handleValidationSimpleItem}
            style={{background: "black", color: "#ffb535"}}
          >Non évaluée</ValidationButton>
        }

        {/* STUDENT BUTTONS STATIC */}
        {/* COMPLEX ITEMS */}
        {item.type === "complex" && props.role === 1 && !props.multiple && item.validation && item.validation.status === 0 &&
          <ValidationButton
            style={{cursor: "default"}} 
          >En cours de validation</ValidationButton>
        }
        {item.type === "complex" && props.role === 1 && !props.multiple && item.validation && item.validation.status === 1 &&
          <ValidationButton
            style={{cursor: "default"}} 
          ><strong>{item.validation.date}</strong></ValidationButton>
        }
        {item.type === "complex" && props.role === 1 && !props.multiple && !item.validation &&
          <ValidationButton 
            style={{background: "black", color: "#ffb535", cursor: "default"}}
          >Non évaluée</ValidationButton>
        }

        {/* SIMPLE ITEMS */}
        {item.type === "simple" && props.role === 1 && !props.multiple && item.validation && item.validation.status === 0 &&
          <ValidationButton
            style={{cursor: "default"}} 
          >En cours de validation</ValidationButton>
        }
        {item.type === "simple" && props.role === 1 && !props.multiple && item.validation && item.validation.status === 1 &&
          <ValidationButton
            style={{cursor: "default"}} 
          ><strong>{item.validation.date}</strong></ValidationButton>
        }
        {item.type === "simple" && props.role === 1 && !props.multiple && !item.validation &&
          <ValidationButton
            style={{background: "black", color: "#ffb535", cursor: "default"}}
          >Non évaluée</ValidationButton>
        }



        {/* MULTIPLE VALIDATION */}
        {item.type === "complex" && props.role === 10 && props.multiple &&
          <ValidationButton
            style={{background: "#252525", color: "#ffb535", cursor: "default"}}
          >Indisponible</ValidationButton>
        }
        {item.type === "simple" && props.role === 10 && props.multiple &&
          <ValidationButton
            style={{background: "#ffb535"}}
            onClick={() => setMultipleDialogOpen(true)}
          >{multipleValidationStudentsCount}/{item.students.length} élèves</ValidationButton>
        }

      </div>
      {item.type === "complex" && props.role === 10 &&
        <Dialog
        open={complexDialogOpen}
        onClose={handleCloseComplexDialog}
        >
          <DialogTitle>Valider des sous-items</DialogTitle>
          <DialogContent>
            <FormGroup>
              {item.subitems.length > 0 && item.subitems.map(subitem => {
                return (
                  <FormControlLabel 
                    key={subitem.id}
                    label={`${subitem.content}`}
                    control={
                      <Checkbox 
                        checked={subitem.validation}
                        onChange={() => handleCheckSubitem(subitem)}
                        color="primary"
                      />
                    }
                  />
                )
              })}
            </FormGroup>
          </DialogContent>
        </Dialog>
      }

      {item.type === "simple" && props.role === 10 && props.multiple &&
        <Dialog
        open={multipleDialogOpen}
        onClose={handleMultipleValidation}
        >
          <DialogTitle>Liste des élèves</DialogTitle>
          <DialogContent>
            <FormGroup>
              {item.students.length > 0 && item.students.sort((a, b) => a.name.localeCompare(b.name)).map(student => {
                return (
                  <FormControlLabel 
                    key={student.id}
                    label={`${student.name} ${student.firstname}`}
                    control={
                      <Checkbox 
                        checked={student.validation}
                        onChange={() => handleCheckStudent(student)}
                        color="primary"
                      />
                    }
                  />
                )
              })}
            </FormGroup>
          </DialogContent>
        </Dialog>
      }


      
    </>
  )
}


const ValidationButton = styled.div`
  border-radius: 20px;
  min-height: 30px;
  margin-right: 10px;
  cursor: pointer;
  background: #ffb535;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0px 0 3px;
`;