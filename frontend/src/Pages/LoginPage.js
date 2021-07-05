import React, { useState, useEffect } from "react";
import styled from 'styled-components';
import { H1 } from "../Styles/Titles";
import { Button, TextField } from '@material-ui/core';
import axios from "axios";

const LoginPage = props => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    axios.get('/api/is_login')
      .then(res => {
        if (res.data.is_login) {
          props.history.push('/')
        }
      })
      .catch(err => {
        console.log(err)
      })
  }, [props.history])


  const handleLoginButton = (e) => {
    if (username.length > 0 && password.length > 0) {
      e.preventDefault(); 
      
      let requestParams = {
        method: "POST",
        headers: {'Content-Type': "application/json"},
        body: JSON.stringify({username: username, password: password})
      }

      fetch('/api/login', requestParams)
        .then(res => {
          if (res.ok) {
            props.history.push('/');
          } else {
            res.json().then(data => console.log(data))
          }
        })
    }
  }


  return (
    <>
      <BlocPage>
        <LoginForm>
          <H1>Connexion</H1>
          <TextField 
            label="Nom d'utilisateur"
            type='text'
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            required
            onChange={e => setUsername(e.target.value)}
          />
          <TextField 
            label="Mot de passe"
            type='password'
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            required
            onChange={e => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            onClick={e => handleLoginButton(e)}
          >Se connecter</Button>
          <Button
            variant="outlined"
          >Mot de passe oublié</Button>
        </LoginForm>
      </BlocPage>
    </>
  )
};


const BlocPage = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background-color: #ffb535;
`;

const LoginForm = styled.form`
  min-width: 400px;
  min-height: 400px;
  max-width: 600px;
  max-height: 700px;
  width: 40%;
  height: 50%;
  border-radius: 25px;
  background-color: #fff;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;



export default LoginPage