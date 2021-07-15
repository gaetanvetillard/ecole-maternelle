import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  width: 100%;
  height: 34px;
  border-radius: 34px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #e2e2e2;
  box-shadow: 0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12);
  overflow: hidden;

  @media screen and (min-width: 768px) {
    height: 44px;
    border-radius: 44px;

`;

const Progress = styled.div`
  height: 34px;
  border-radius: 34px;
  position: absolute;
  left: 0;
  background-color: #ffb535;

  @media screen and (min-width: 768px) {
    height: 44px;
    border-radius: 44px;
  }
`;


const Text = styled.p`
  position: absolute;
  font-weight: bold;
`;



export const ProgressBar = (props) => {

  const width = props.validated * 100 / props.total

  return (
    <>
      <Wrapper>
        <Progress style={{width: `${width}%`}}/>
        <Text>{props.validated}/{props.total}</Text>
      </Wrapper>
    </>
  )
};

export const ProgressBarXS = props => {
  const width = props.validated * 100 / props.total

  return (
    <>
      <Wrapper style={{width: "50%"}} className={"xs"}>
        <Progress style={{width: `${width}%`}}/>
        <Text>{props.validated}/{props.total}</Text>
      </Wrapper>
    </>
  )
}