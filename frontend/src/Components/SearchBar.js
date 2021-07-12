import { Search } from '@material-ui/icons';
import React from 'react';
import styled from "styled-components";


const SearchBox = styled.div`
  width: 250px;
  height: 30px;
  margin: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid #ffb535;
  border-radius: 30px;

  @media screen and (min-width: 768px) {
    height: 50px;
    width: 400px;
  }
`;

const SearchLogo = styled.div`
  width: 30px;
  height: 30px;
  background-color: #ffb535;
  border-top-left-radius: 50%;
  border-bottom-left-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #ffb535;

  @media screen and (min-width: 768px) {
    height: 50px;
    width: 60px;

    & .MuiSvgIcon-root {
      width: 34px;
      height: 34px
    }
  }
`;

const InputBox = styled.input`
  width: 180px;
  margin-right: 30px;
  padding-left: 8px;
  height: 25px;
  border: none;
  font-size: 18px;

  &:focus {
    outline: none
  }

  @media screen and (min-width: 768px) {
    width: 350px;
    font-size: 24px;
  }
`;




const Searchbar = props => {

  return (
    <SearchBox>
      <SearchLogo>
        <Search />
      </SearchLogo>
      <InputBox onChange={props.onChangeFunction} value={props.value} />
    </SearchBox>
  )
};


export const SearchbarXS = props => {
  return (
    <SearchBox>
      <SearchLogo onClick={props.searchFunction} style={{cursor: "pointer"}}> 
        <Search />
      </SearchLogo>
      <InputBox onChange={props.onChangeFunction} value={props.value} placeholder={props.placeholder} />
    </SearchBox>
  )
}


export default Searchbar;