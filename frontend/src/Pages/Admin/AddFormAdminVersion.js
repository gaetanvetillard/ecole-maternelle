import React, {useState} from 'react';
import {Button, FormControl, FormControlLabel, FormGroup, InputLabel, MenuItem, Radio, RadioGroup, TextField, Select, FormHelperText} from "@material-ui/core"



const AddFormAdminVersion = props => {
  const [newOrExistingAccount, setNewOrExistingAccount] = useState("existing_account");
  const [formFieldsValues, setFormFieldsValues] = useState({name: "", firstname: "", email: "", username: "", classroom_id: props.classroom_id ? props.classroom_id : null})


  const handleAddClassroom = (e) => {
    if (newOrExistingAccount === "existing_account" || newOrExistingAccount === "new_account") {
      if (formFieldsValues.username || (formFieldsValues.name && formFieldsValues.firstname && formFieldsValues.email)) {
        e.preventDefault();
        const requestParams = {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            ...formFieldsValues,
            action: newOrExistingAccount
          })
        }

        setFormFieldsValues({name: "", firstname: "", email: "", username: "", classroom_id: props.classroom_id ? props.classroom_id : null});
        props.setAddLoading && props.setAddLoading(true);

        if (newOrExistingAccount === "existing_account") {
          let newList = props.freeList.filter((teacher) => {
            return teacher.username !== formFieldsValues.username
          });
          props.oldValue && newList.push(props.oldValue);
          props.setFreeList(newList)
        }

        fetch(props.url, requestParams)
          .then(res => {
            if (res.ok) {
              res.json()
                .then(data => {
                  props.setAddLoading && props.setAddLoading(false);
                  props.setList(prev => [...prev, data]);
                })
            } else {
              res.json()
                .then(data => {
                  console.log(data);
                  props.setAddLoading && props.setAddLoading(false)
                })
            }
          })
      } 
    }
  }


  return (
  <form>
    <RadioGroup onChange={(e) => setNewOrExistingAccount(e.target.value)} row style={{justifyContent: "center"}} defaultValue="existing_account" >
      <FormControlLabel value="existing_account" control={<Radio style={{color: '#ffb535'}} />} label="Compte existant"/>
      <FormControlLabel value="new_account" control={<Radio style={{color: '#ffb535'}} />} label="Nouveau compte"/>
    </RadioGroup>
    {newOrExistingAccount === "existing_account" &&
    <div style={{display: "flex", justifyContent: "center"}}>
      <FormControl style={{maxWidth: "300px", width: "100%"}} required disabled={props.freeList.length > 0 ? false : true}>
        <InputLabel id="username-label">Utilisateur</InputLabel>
        <Select
          labelId="username-label"
          value={formFieldsValues.username ? formFieldsValues.username : ""}
          onChange={e => setFormFieldsValues(prev => {return {...prev, username: e.target.value}})}
        >
          {props.freeList && props.freeList.map(teacher => {
            return <MenuItem key={teacher.id} value={teacher.username}>{teacher.name} {teacher.firstname}</MenuItem>
          })}
        </Select>
        {props.freeList.length > 0 && <FormHelperText>Séléctionner un compte</FormHelperText>}
        {props.freeList.length === 0 && <FormHelperText>{props.helperText}</FormHelperText>}
      </FormControl>
    </div>
    }
    {newOrExistingAccount === "new_account" &&
    <FormGroup style={{maxWidth: "300px"}}>
      <TextField label="Nom" required autoComplete="none" value={formFieldsValues.name} onChange={e => setFormFieldsValues(prev => {return {...prev, name: e.target.value}})}/>
      <TextField label="Prénom" required autoComplete="none" value={formFieldsValues.firstname} onChange={e => setFormFieldsValues(prev => {return {...prev, firstname: e.target.value}})}/>
      <TextField label="Adresse mail" required autoComplete="none" value={formFieldsValues.email} onChange={e => setFormFieldsValues(prev => {return {...prev, email: e.target.value}})}/>
    </FormGroup>
    }
    <Button type="submit" variant="contained" style={{width: "100%", maxWidth: 300, marginTop: 10}} onClick={e => handleAddClassroom(e)}>{props.buttonText}</Button>
  </form>)
}


export default AddFormAdminVersion