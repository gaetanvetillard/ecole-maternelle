import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Radio, FormControlLabel, RadioGroup, TextField } from '@material-ui/core';
import { AddCircleRounded, ExpandLess, ExpandMore } from '@material-ui/icons';
import React, { useState } from 'react';
import styled from 'styled-components';
import { YellowDividerH2 } from '../../Styles/Dividers';
import { WrapperDiv } from '../../Styles/Divs';
import { H2, H3 } from '../../Styles/Titles';
import { LoadingItem } from '../Loading';



const SkillTitle = styled.h3`
  margin: 10px 0px 0px;

  @media screen and (min-width: 768px) {
    font-size: 24px;
  }
`;

const SubskillTitle = styled.h4`
  margin: 0px;

  @media screen and (min-width: 768px) {
    font-size: 20px;
  }
`;

const ItemDiv = styled.div`
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
    width: 140px;
    height: 140px;
  }

  & .title {
    border-radius: 5px;
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

  @media screen and (min-width: 768px) {
    width: 195px;
    height: 312px;

    & .content img {
      width: 185px;
      height: 185px;
    }

  }
`;


export const Skill = props => {
  const [isExpand, setIsExpand] = useState(false);
  const [subskills, setSubskills] = useState(props.skill.subskills)
  const [addLoading, setAddLoading] = useState(false);

  const skill = props.skill;

  return (
    <Grid container>
      <Grid item xs={12} align="center">
        <WrapperDiv style={{margin: "10px 5%"}}>
          <div 
            onClick={() => isExpand ? setIsExpand(false) : setIsExpand(true)}
            style={{cursor: "pointer"}} 
          >
              <SkillTitle style={{margin: 0}}>{skill.name}</SkillTitle>
              {isExpand ?
                <ExpandLess style={{width: 32, height: 32}} />
                :
                <ExpandMore style={{width: 32, height: 32}}/>
              }
          </div>
          {isExpand && subskills.length > 0 && subskills.map(subskill => {
              return <Subskill key={subskill.id} subskill={subskill}/>
            })
          }
          {isExpand && subskills.length === 0 && !addLoading &&
            <h3>Aucune sous compétence </h3>
          }
          {addLoading &&
            <LoadingItem />
          }
          {isExpand &&
            <AddSubskill skill={skill} setAddLoading={setAddLoading} setSubskills={setSubskills}/>
          }
          </WrapperDiv>
      </Grid>
    </Grid>
  )
}


export const Subskill = props => {
  const [isExpand, setIsExpand] = useState(false);

  const subskill = props.subskill;
  const items = props.subskill.items;

  return (
    <WrapperDiv style={{margin: 0}}>
      <div 
        onClick={() => isExpand ? setIsExpand(false) : setIsExpand(true)}
        style={{cursor: "pointer"}}
      >
        <SubskillTitle 
          style={{fontFamily: 'inherit', fontWeight: "bold"}}
        >
          {subskill.name}
        </SubskillTitle>
        {isExpand ?
          <ExpandLess style={{width: 32, height: 32}} />
          :
          <ExpandMore style={{width: 32, height: 32}}/>
        }
      </div>
      {isExpand && items.length > 0 &&
        <div style={{display: "flex", flexWrap: "nowrap", overflow: "scroll hidden", width: "100%"}}>
          {items.map((item, index) => <Item item={item} subskill={subskill} key={item.id} index={index} />)}
        </div>
      }
      {isExpand &&
        <AddItem />
      }
    </WrapperDiv>
  )
}


export const Item = props => {

  const subskill = props.subskill
  const item = props.item

  return (
    <ItemDiv>
      <h4 className={"title"}>{subskill.name} ({props.index+1})</h4>
      <div className="content">
        {item.type === "complex" &&
          item.subitems.map(subitem => {
            return <p key={subitem.id} style={{padding: 5}}>{subitem.content}</p>
          })
        }
        {item.type === "simple" &&
          <img src="https://www.sesamath.net/images/Sesamath_bandeau.png" alt="illustration" />
        }
      </div>
      <p className="label">{item.label}</p>
    </ItemDiv>
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

      let requestParams = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          name: name,
          skill_id: props.skill.id
        })
      };

      fetch('/api/super_admin/add_subskill', requestParams)
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
  const [selectedFile, setSelectedFile] = useState(null);
  const [subitemsList, setSubitemsList] = useState([]);
  const [subitemName, setSubitemName] = useState("");

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleAddItem = () => {
    if (itemType === "simple") {
      console.log('slt')
    } else if (itemType === "complex") {
      console.log("slt")
    }
  }


  return (
    <div>
      <Button variant="contained" onClick={handleClickOpen}>
        Ajouter un item
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Ajouter un item</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Pour ajouter un item, remplissez ce formulaire
          </DialogContentText>
          <TextField
            autoFocus
            autoComplete="none"
            label="Nom"
            fullWidth
            required
          />
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
            {subitemsList.length < 30 &&
              <div style={{display: "flex", justifyContent: "center"}}>
                <TextField 
                  label="Ajouter un sous-item"
                  autoComplete="none"
                  value={subitemName}
                  onChange={e => setSubitemName(e.target.value)}
                />
                <Button
                  onClick={() => {
                    if (subitemName) {setSubitemsList(prev => [...prev, subitemName]); setSubitemName("")}
                  }}
                  style={{alignItems: "flex-end"}}
                ><AddCircleRounded style={{pading: 0}}/></Button>
              </div>
            }
          </>
        }

          
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleClose}>
            Annuler
          </Button>
          <Button variant="contained" onClick={handleAddItem}>
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );


}