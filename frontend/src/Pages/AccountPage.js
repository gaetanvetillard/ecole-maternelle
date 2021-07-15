import React, { useEffect, useState } from "react";
import { H1, H3 } from "../Styles/Titles";

import {Button, FormHelperText, Grid, TextField} from "@material-ui/core"
import Navbar from "../Components/Navbar";
import { LoadingPage } from "../Components/Loading";
import { BlocPage, WrapperDiv } from "../Styles/Divs";

const AccountPage = props => {
  const [userInfos, setUserInfos] = useState(null);
  const [globalPageHasLoading, setGlobalPageHasLoading] = useState(false);

  // on expand
  // const [newMail, setNewMail] = useState(""); // edit mail

  // edit password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [eightCharacters, setEightCharacters] = useState(false);
  const [oneMaj, setOneMaj] = useState(false);
  const [oneMin, setOneMin] = useState(false);
  const [oneNumber, setOneNumber] = useState(false);

  useEffect(() => {
    fetch('/api/get_my_infos')
      .then(res => {
        if (res.ok) {
          res.json()
            .then(data => {
              if (!data.is_login) {
                props.history.push('/');
              } else {
                setUserInfos(data);
                setGlobalPageHasLoading(true);
              }
            })
        }
      })

  }, [props.history])


  const handleNewPasswordChanged = (e) => {
    setNewPassword(e.target.value)

    if (e.target.value.search(/[a-z]/) === -1) {
      setOneMin(false)
    } if (e.target.value.search(/[A-Z]/) === -1) {
      setOneMaj(false)
    } if (e.target.value.search(/[1-9]/) === -1) {
      setOneNumber(false)
    }
    if (!oneMin && e.target.value.search(/[a-z]/) > -1) {
      setOneMin(true)
    } else if (!oneMaj && e.target.value.search(/[A-Z]/) > -1) {
      setOneMaj(true)
    } else if (!oneNumber && e.target.value.search(/[1-9]/) > -1) {
      setOneNumber(true)
    } if (e.target.value.length >= 8) {
      setEightCharacters(true)
    } else {
      setEightCharacters(false)
    }
  };

  // const handleConfirmEmailButtonClicked = (e) => {
  //   if (newMail.length > 0 && newMail.includes('@')) {
  //     e.preventDefault()
  //     const requestParams = {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         username: userInfos.username,
  //         new_mail: newMail
  //       })
  //     };

  //     fetch('/api/edit-email', requestParams)
  //       .then(res => {
  //         if (res.ok) {
  //           setNewMail('');
  //           setExpandEditMail(false);
  //           fetch(`/api/get-email-address/${userInfos.username}`)
  //             .then(res => res.json())
  //             .then(data => {
  //               setUserInfos(data)
  //             });
  //         } else {
  //           res.json()
  //             .then(data => {
  //               setNewMail('');
  //               alert(data['Error'])
  //             });
  //         };
  //       });
  //   };
  // };

  const handleConfirmPasswordButtonClicked = (e) => {
    if (currentPassword.length > 0 && newPassword.length > 0 && confirmNewPassword.length > 0) {
      e.preventDefault()
    }
    if (oneMin && oneMaj && eightCharacters && oneNumber &&
      currentPassword.length > 0 && newPassword.length > 0 && confirmNewPassword.length > 0 &&
      newPassword === confirmNewPassword && newPassword !== currentPassword) {

      const requestParams = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: userInfos.username,
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirm: confirmNewPassword,
        }),
      };

      fetch("/api/edit_password", requestParams).then((res) => {
        if (res.ok) {
          setNewPassword("");
          setCurrentPassword("");
          setConfirmNewPassword("");
          setOneNumber(false);
          setOneMin(false);
          setOneMaj(false);
          setEightCharacters(false);
        } else {
          res.json().then((data) => {
            setNewPassword("");
            setCurrentPassword("");
            setConfirmNewPassword("");
            setOneNumber(false);
            setOneMin(false);
            setOneMaj(false);
            setEightCharacters(false);
            alert(data['Error'])
          });
        }
      });
    };
  };


  if (globalPageHasLoading) {
    return (
      <BlocPage>
        <Grid container>
          <Grid item xs={12} align="center">
            <H1>Votre compte</H1>
          </Grid>  
        </Grid>

        {/* Username */}
        <Grid container>
          <Grid item xs={12} align="center">
            <WrapperDiv style={{margin: "10px 5%"}}>
              <H3><span style={{textDecoration: "underline"}}>Nom d'utilisateur :</span> {userInfos.username}</H3>
            </WrapperDiv>
          </Grid>
        </Grid>

        {/* Email */}
        <Grid container>
          <Grid item xs={12} align="center">
            <WrapperDiv style={{margin: "10px 5%"}}>
              <H3><span style={{textDecoration: "underline"}}>Adresse mail :</span>{userInfos.email}</H3>
            </WrapperDiv>
          </Grid>
        </Grid>

        {/* Password */}
        <Grid container>
          <Grid item xs={12} align="center">
            <WrapperDiv style={{margin: "10px 5%"}}>
            <form onSubmit={() => false}>
                <TextField
                  label='Mot de passe actuel'
                  type="password"
                  style={{ width: "100%" }}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  minLength={8}
                />
                <TextField
                  label='Nouveau mot de passe'
                  type="password"
                  style={{ width: "100%" }}
                  required
                  value={newPassword}
                  onChange={handleNewPasswordChanged}
                  minLength={8}
                />
                <div style={{ display: "flex", flexWrap: 'wrap' }}>
                  <FormHelperText style={{ fontSize: "14px", marginRight: "20px", color: `${eightCharacters ? 'green' : "rgba(0, 0, 0, 0.54)"}` }}>8+ caractères</FormHelperText>
                  <FormHelperText style={{ fontSize: "14px", marginRight: "20px", color: `${oneMaj ? 'green' : "rgba(0, 0, 0, 0.54)"}` }}>1 Majuscule</FormHelperText>
                  <FormHelperText style={{ fontSize: "14px", marginRight: "20px", color: `${oneMin ? 'green' : "rgba(0, 0, 0, 0.54)"}` }}>1 Minuscule</FormHelperText>
                  <FormHelperText style={{ fontSize: "14px", color: `${oneNumber ? 'green' : "rgba(0, 0, 0, 0.54)"}` }}>1 Chiffre</FormHelperText>
                </div>
                <TextField
                  label='Confirmation'
                  type="password"
                  style={{ width: "100%" }}
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  minLength={8}
                />
                <Button
                  variant='contained'
                  type="submit"
                  style={{
                    marginTop: '15px',
                    width: "100%",
                    backgroundColor: "#ffb535"
                  }}
                  onClick={handleConfirmPasswordButtonClicked}
                >Confirmer les changements
                </Button>
              </form>
            </WrapperDiv>
          </Grid>
        </Grid>
      

        <Navbar {...props} userInfos={userInfos}/>
      </BlocPage>
    )
  } else {
    return <LoadingPage />
  }
};

export default AccountPage;