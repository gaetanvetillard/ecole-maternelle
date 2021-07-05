import React, { useState } from 'react';
import {
  AccountCircle,
  Menu as MenuIcon,
  ExitToApp
} from '@material-ui/icons';
import {
  ButtonGroup,
  Button,
  Menu,
  MenuItem
} from '@material-ui/core';
import styled from 'styled-components';


const NavbarBalise = styled.nav`
  position: fixed;
  padding: 5px 0;
  bottom: 0;
  height: 50px;
  width: 100%;
  background: #ffb535;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;


const Navbar = props => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClose = () => setAnchorEl(null)

  const handleLogout = () => {
    fetch('/api/logout')
      .then(res => {
        if (res.ok) {
          props.history.push('/')
        } else {
          res.json()
            .then(data => console.log(data))
        }
      })
  }

  return (
    <NavbarBalise>
      <Button onClick={(e) => setAnchorEl(e.currentTarget)} style={{ marginLeft: "10px" }}>
        <MenuIcon fontSize='large' />
      </Button>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem>Gérer la liste de compétences</MenuItem>
      </Menu>
      

      <ButtonGroup variant="text" style={{ marginRight: '10px' }}>
        <Button>
          <AccountCircle fontSize='large' onClick={() => props.history.push('/account')} />
        </Button>
        <Button>
          <ExitToApp fontSize='large' onClick={handleLogout}/>
        </Button>
      </ButtonGroup>
    </NavbarBalise>
  )
};

export default Navbar;