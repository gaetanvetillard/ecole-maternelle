import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Radio, FormControlLabel, RadioGroup, TextField, Select, MenuItem } from '@material-ui/core';
import { AddCircleRounded, Delete, ExpandLess, ExpandMore } from '@material-ui/icons';
import React, { useState } from 'react';
import styled from 'styled-components';
import { YellowDividerH2 } from '../../Styles/Dividers';
import { WrapperDiv } from '../../Styles/Divs';
import { H2, H3 } from '../../Styles/Titles';
import { LoadingItem } from '../Loading';
import axios from "axios";
import Autocomplete from "@material-ui/lab/Autocomplete";



export const ItemDiv = styled.div`
  position: relative;
  margin-bottom: 4px;
  min-width: 150px;
  width: 150px;
  height: 240px;
  border-radius: 10px;
  border: 2px solid #ffb535;
  margin-right: 10px;

  & .content {
    display: flex;
    flex-wrap: wrap;
    padding: 5px;
    justify-content: center;
    align-items: center;
    max-height: 140px;
    max-width: 150px;
  }

  & .content img {
    min-width: 140px;
    min-height: 140px;
    width: 140px;
    height: 140px;
  }

  & .title {
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    background: #ffb535;
    padding: 2px 3px 5px;
  }

  & .label {
    position: absolute;
    bottom: 0;
    width: 100%;
    margin-bottom: 5px;
    font-size: 18px;
    line-height: 18px;
  }

  & .validation_overlay {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0,0,0,0.4);
    border-radius: 8px;
  }

  @media screen and (min-width: 768px) {
    width: 195px;
    height: 312px;

    & .content img {
      min-width: 185px;
      min-height: 185px;
      width: 185px;
      height: 185px;
    }

  }
`;


export const Skill = props => {
  const [isExpand, setIsExpand] = useState(false);
  const [subskills, setSubskills] = useState(props.skill.subskills)
  const [addLoading, setAddLoading] = useState(false);
  const [freeSubskills, setFreeSubskills] = useState(props.skill.free_subskills)

  const skill = props.skill;

  const handleDeleteSkill = () => {
    let confirmation = window.confirm('Êtes vous sûr de vouloir supprimer cette compétence? Cela supprimera toutes les sous-compétences et items.')
    if (confirmation) {
      props.setSkills(prev => [...prev].filter(skill_ => skill_.id !== skill.id))

      fetch(`/api/${props.role === 1000 ? "super_admin" : "admin"}/delete_skill?id=${skill.id}`, {method: "POST"}) 
        .then(res => {
          if (!res.ok) {
            res.json()
              .then(data => alert(data['Error']))
          }
        })
    }
  }

  return (
    <Grid container>
      <Grid item xs={12} align="center">
        <WrapperDiv style={{margin: "10px 5%"}}>
          <div 
            onClick={() => isExpand ? setIsExpand(false) : setIsExpand(true)}
            style={{cursor: "pointer"}} 
          >
              <div style={{display: "flex", justifyContent:"center", alignItems: "center"}}>
                <H2 style={{margin: 0}}>{skill.name}</H2>
                {props.role === 1000 && <Delete onClick={handleDeleteSkill} style={{marginLeft: 5}}/>}
              </div>
              {isExpand ?
                <ExpandLess style={{width: 32, height: 32}} />
                :
                <ExpandMore style={{width: 32, height: 32}}/>
              }
          </div>
          {isExpand && subskills.length > 0 && subskills.map(subskill => {
              return <Subskill key={subskill.id} subskill={subskill} setSubskills={setSubskills} setFreeSubskills={setFreeSubskills} role={props.role}/>
            })
          }
          {isExpand && subskills.length === 0 && !addLoading &&
            <h3>Aucune sous compétence </h3>
          }
          {addLoading &&
            <LoadingItem />
          }
          {isExpand &&
            <AddSubskill skill={skill} setAddLoading={setAddLoading} setSubskills={setSubskills} freeSubskills={freeSubskills} setFreeSubskills={setFreeSubskills} role={props.role}/>
          }
          </WrapperDiv>
      </Grid>
    </Grid>
  )
}


const Subskill = props => {
  const [isExpand, setIsExpand] = useState(false);
  const [items, setItems] = useState(props.subskill.items);
  const [addLoading, setAddLoading] = useState(false);
  const [freeItems, setFreeItems] = useState(props.subskill.free_items);

  const subskill = props.subskill;

  const handleDeleteSubskill = () => {
    let confirmation = window.confirm("Êtes vous sûr de vouloir supprimer cette sous-compétence ? Cela supprimera également les items associés.")
    if (confirmation) {
      props.setSubskills(prev => [...prev].filter(subskill_ => subskill_.id !== subskill.id))
      props.setFreeSubskills(prev => [...prev, subskill.name])

      fetch(`/api/${props.role === 1000 ? "super_admin" : "admin"}/delete_subskill?id=${subskill.id}`, {method: "POST"})
        .then(res => {
          if (!res.ok) {
            res.json()
              .then(data => alert(data['Error']))
          }
        })
    }
  }

  return (
    <WrapperDiv style={{margin: 0, marginTop: 10}}>
      <div 
        onClick={() => isExpand ? setIsExpand(false) : setIsExpand(true)}
        style={{cursor: "pointer"}}
      >
        <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
          <H3>{subskill.name}</H3>
          <Delete style={{marginLeft: 5, width: 20, height: 20}} onClick={handleDeleteSubskill}/>
        </div>

        {isExpand ?
          <ExpandLess style={{width: 32, height: 32}} />
          :
          <ExpandMore style={{width: 32, height: 32}}/>
        }
      </div>
      {isExpand && items.length > 0 &&
        <WrapperDiv style={{display: "flex", flexWrap: "nowrap", overflow: "scroll hidden", marginTop: 0}}>
          {items.map((item, index) => <Item item={item} subskill={subskill} key={item.id} index={index} setFreeItems={setFreeItems} setItems={setItems} role={props.role}/>)}
          {addLoading && isExpand &&
            <div style={{display: "flex", alignItems:"center"}}>
              <LoadingItem />
            </div>
          }
        </WrapperDiv>
      }
      {isExpand &&
        <AddItem subskill_id={subskill.id} setList={setItems} freeItems={freeItems} setFreeItems={setFreeItems} setAddLoading={setAddLoading} role={props.role} />
      }
    </WrapperDiv>
  )
}


const Item = props => {
  const subskill = props.subskill
  const item = props.item

  const handleDeleteItem = () => {
    let confirmation = window.confirm("Êtes vous sûr de vouloir supprimer cet item? Cette action est irréversible.")
    if (confirmation) {

      props.setItems(prev => [...prev].filter(item_ => item_.id !== item.id))
      props.role === 100 && props.setFreeItems(prev => [...prev, item.label])

      let requestParams = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          id: item.id
        })
      };

      fetch(`/api/${props.role === 1000 ? "super_admin" : "admin"}/delete_item`, requestParams)
        .then(res => {
          if (!res.ok) {
            res.json()
              .then(data => alert(data['Error']))
          }
        })

    }
  }

  return (
    <div style={{display: "flex", flexDirection: "column"}}>
      <ItemDiv>
        <h4 className={"title"}>{subskill.name} ({props.index+1})</h4>
        <div className="content">
          {item.type === "complex" &&
            item.subitems.map((subitem, index) => {
              return <p key={index} style={{padding: 5}}>{subitem.content}</p>
            })
          }
          {item.type === "simple" &&
            <img src={`${item.image_url}`} alt="illustration" />
          }
        </div>
        <p className="label">{item.label}</p>
      </ItemDiv>
      <Button
        style={{marginRight: 10, borderRadius: 10, borderColor: "#ffb535"}}
        variant="outlined"
        onClick={handleDeleteItem}
      >Supprimer</Button>
    </div>
  )
}


export const AddSkill = props => {
  const [name, setName] = useState("");

  const handleAddSkill = e => {
    if (name) {
      e.preventDefault();
      setName("");
      props.setAddLoading(true);

      let requestParams = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({name: name})
      };

      fetch('/api/super_admin/add_skill', requestParams)
        .then(res => {
          if (res.ok) {
            res.json()
              .then(data => {
                props.setSkills(prev => [...prev, data]);
                props.setAddLoading(false);
              });
          } else {
            res.json()
              .then(data => {
                alert(data['Error']);
                props.setAddLoading(false);
              })
          }
        })
    }
  }

  return (
    <Grid container>
      <Grid item xs={12} align="center">
        <WrapperDiv style={{margin: "10px 5%"}}>
          <H2>Ajouter une compétence</H2>
          <YellowDividerH2 style={{margin: 0}} />
          <form method="POST" style={{display: "flex", justifyContent: "center", alignItems: "flex-end"}}>
            <TextField 
              label='Nom'
              onChange={e => setName(e.target.value)}
              value={name}
              required
            />
            <Button
              type="submit"
              variant="contained"
              onClick={handleAddSkill}
              >
                Ajouter
            </Button>
          </form>
        </WrapperDiv>
      </Grid>
    </Grid>
  )

}


const AddSubskill = props => {
  const [name, setName] = useState("");

  

  const handleAddSubskill = e => {
    if (name) {
      e.preventDefault();
      setName("");
      props.setAddLoading(true)

      if (props.freeSubskills && props.freeSubskills.includes(name)) {
        props.setFreeSubskills(prev => [...prev].filter(e => e !== name))
      }


      let requestParams = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          name: name,
          skill_id: props.skill.id
        })
      };

      fetch(`/api/${props.role === 1000 ? "super_admin" : "admin"}/add_subskill`, requestParams)
        .then(res => {
          if (res.ok) {
            res.json()
              .then(data => {
                props.setSubskills(prev => [...prev, data]);
                props.setAddLoading(false);
              });
          } else {
            res.json()
              .then(data => {
                alert(data['Error']);
                props.setAddLoading(false);
              })
          }
        })
    }
  }

  return (
    <Grid container>
      <Grid item xs={12} align="center">
        <WrapperDiv>
          <H3>Ajouter une sous-compétence</H3>
          <YellowDividerH2 style={{margin: 0, marginTop: -5}} />
          <form method="POST" style={{display: "flex", justifyContent: "center", alignItems: "flex-end"}}>
            {props.role === 1000 ?
              <TextField 
              label='Nom'
              onChange={e => setName(e.target.value)}
              value={name}
              required
              />
              :
              <Autocomplete
                disableClearable
                options={props.freeSubskills.map((option) => option)}
                style={{maxWidth: "300px", width: "100%"}}
                value={name}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Nom"
                    required
                    InputProps={{ ...params.InputProps, type: "search" }}
                    onSelect={e => setName(e.target.value)}
                    value={name}
                  />
                )}
              />
            }
            <Button
              type="submit"
              variant="contained"
              onClick={handleAddSubskill}
              >
                Ajouter
            </Button>
          </form>
        </WrapperDiv>
      </Grid>
    </Grid>
  )


}

const AddItem = props => {
  const [open, setOpen] = useState(false);
  const [itemType, setItemType] = useState("simple");
  const [itemName, setItemName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [subitemsList, setSubitemsList] = useState([]);
  const [subitemName, setSubitemName] = useState("");

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleAddItem = () => {
    if (itemType === "simple") {
      if (selectedFile.length > 0 && itemName) {
        props.setAddLoading(true);
        setItemName('');
        setSelectedFile(null);
        handleClose();

        const formData = new FormData();
        formData.append('image', selectedFile[0], selectedFile[0].name);
       
        axios.post(`/api/${props.role === 1000 ? "super_admin" : "admin"}/add_simple_item?subskill_id=${props.subskill_id}&name=${itemName}`, formData)
          .then(res => {
            if (res.status === 200) {
              props.setList(prev => [...prev, res.data]);
              props.setAddLoading(false);
            } else {
              alert(res.data['Error'])
            }
          })
      }
    } else if (itemType === "complex") {
      if (itemName && subitemsList.length > 0) {
        props.setAddLoading(true);
        setItemName('');
        setSubitemsList([]);
        handleClose();

        let requestParams = {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            subskill_id: props.subskill_id,
            name: itemName,
            subitems: subitemsList
          })
        };

        fetch(`/api/${props.role === 1000 ? "super_admin" : "admin"}/add_complex_item`, requestParams)
          .then(res => {
            if (res.ok) {
              res.json()
                .then(data => {
                  props.setList(prev => [...prev, data]);
                  props.setAddLoading(false);
                })
            } else {
              res.json()  
                .then(data => {
                  props.setAddLoading(false);
                  alert(data['Error']);
                })
            }
          })

      }
    } else if (itemType === "existing") {
      if (itemName) {
        props.setAddLoading(true);
        setItemName('')
        handleClose();

        let requestParams = {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            subskill_id: props.subskill_id,
            name: itemName,
          })
        };

        fetch(`/api/admin/add_existing_item`, requestParams)
          .then(res => {
            if (res.ok) {
              res.json()
                .then(data => {
                  props.setFreeItems(prev => [...prev].filter(e => e !== itemName));
                  props.setList(prev => [...prev, data]);
                  props.setAddLoading(false);
                })
            } else {
              res.json()  
                .then(data => {
                  props.setAddLoading(false);
                  alert(data['Error']);
                })
            }
          })
      }
    }
  }


  return (
    <div>
      <Button variant="contained" onClick={handleClickOpen} style={{marginTop: 10}}>
        Ajouter un item
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Ajouter un item</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Pour ajouter un item, remplissez ce formulaire
          </DialogContentText>
          {itemType !== "existing" ?
            <TextField
              autoFocus
              autoComplete="none"
              label="Nom"
              fullWidth
              required
              value={itemName}
              onChange={e => setItemName(e.target.value)}
            />
            :
            <Select
              value={itemName ? itemName : ""}
              onChange={e => setItemName(e.target.value)}
              style={{width: "100%"}}
            >
              {props.freeItems && props.freeItems.map((item, index) => {
                return <MenuItem key={index} value={item}>{item}</MenuItem>
              })}
            </Select>
          }
          <RadioGroup 
            value={itemType} 
            onChange={e => setItemType(e.target.value)}
            style={{flexDirection: "row", justifyContent: "center"}}
          >
            <FormControlLabel 
              value="simple" 
              control={<Radio style={{color: "#ffb535"}}/>} 
              label="Simple" 
            />
            <FormControlLabel 
              value="complex" 
              control={<Radio style={{color: "#ffb535"}} />} 
              label="Complexe"
            />
            {props.role !== 1000 && 
              <FormControlLabel 
                value="existing" 
                control={<Radio style={{color: "#ffb535"}} />} 
                label="Existant"
                disabled={props.freeItems && props.freeItems.length > 0 ? false : true}
              />
            }
            
          </RadioGroup>

          
        {itemType === "simple" &&
          <div style={{display: "flex", justifyContent: "center"}}>
            <label htmlFor="btn-upload">
              <input
                id="btn-upload"
                style={{ display: 'none' }}
                type="file"
                onChange={e => setSelectedFile(e.target.files)}
                accept="image/png, image/jpeg"
                multiple={false}
                required />
              <Button
                className="btn-choose"
                variant="outlined"
                component="span"
                style={{ width: "200px", textAlign: "center" }}>
                {selectedFile && selectedFile[0].name}
                {!selectedFile && "Choisir une illustration"}
              </Button>
            </label>
          </div>
        }
        

        {itemType === "complex" && 
          <>
            <ol>
              {subitemsList && subitemsList.map((subitem, index) => {
                return <li key={index}>{subitem}</li>
              })}
            </ol>
            {subitemsList && subitemsList.length < 30 &&
              <form style={{display: "flex", justifyContent: "center"}}>
                <TextField 
                  label="Ajouter un sous-item"
                  autoComplete="none"
                  value={subitemName}
                  onChange={e => setSubitemName(e.target.value)}
                  required
                />
                <Button
                  onClick={(e) => {
                    if (subitemName) {e.preventDefault(); setSubitemsList(prev => [...prev, subitemName]); setSubitemName("")}
                  }}
                  type="submit"
                  style={{alignItems: "flex-end"}}
                ><AddCircleRounded style={{pading: 0}}/></Button>
              </form>
            }
          </>
        }

          
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleClose}>
            Annuler
          </Button>
          <Button 
            variant="contained" 
            onClick={handleAddItem}
            disabled={(itemType === "existing" && props.freeItems.length === 0) ? true : false}
          >
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );


}