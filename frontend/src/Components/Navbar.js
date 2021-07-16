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

  if (props.userInfos.role === 100) {
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
          <MenuItem onClick={() => props.history.push('/admin')}>Gérer l'école</MenuItem>
          <MenuItem onClick={() => props.history.push('/admin/classrooms')}>Gérer les classes</MenuItem>
          <MenuItem onClick={() => props.history.push('/admin/users')}>Gérer les utilisateurs</MenuItem>
          <MenuItem onClick={() => props.history.push('/admin/skills')}>Gérer les compétences</MenuItem>
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
  } else if (props.userInfos.role === 1000) {
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
          <MenuItem onClick={() => props.history.push('/super_admin')}>Gérer le site</MenuItem>
          <MenuItem onClick={() => props.history.push('/super_admin/schools')}>Gérer les écoles</MenuItem>
          <MenuItem onClick={() => props.history.push('/super_admin/skills')}>Gérer les compétences</MenuItem>
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
  } else if (props.userInfos.role === 10) {
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
          <MenuItem onClick={() => props.history.push('/teacher')}>Votre classe</MenuItem>
          <MenuItem onClick={() => props.history.push('/teacher/skills')}>Les compétences</MenuItem>
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
  } else if (props.userInfos.role === 1) {
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
          <MenuItem onClick={() => props.history.push('/student')}>Vos compétences</MenuItem>
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
  }
  
};

export default Navbar;