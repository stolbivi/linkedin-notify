import styled from "styled-components";

interface ColorProps {
  color: string;
}

interface CardContainerProps {
  hideCard: boolean;
}

export const CardContainer = styled.div<CardContainerProps>`
  opacity:  ${({ hideCard }) => hideCard ? 0.2 : 1};

  width: 220px;
  height: 110px;
  margin: 0.7rem 0;
  padding: 1.2rem 1rem 0.7rem 1rem;
  padding-left: 15px;
  padding-right: 15px;
  padding-bottom: 10px;

  border-radius: 5px;
  border: 1px solid ${({theme}) => theme.colors.border};

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  position: relative;

  h3 {
    text-overflow: ellipsis;
    width: 100%;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    font-size: 13px;
  }
`

export const CardBorder = styled.div<ColorProps>`
  cursor: grab;
  position: absolute;
  top: -1px;
  left: -1px;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  height: 10px;
`

export const CardBottom = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between ;
  width: 100%;
  border-radius: 16px;

  p {
    cursor: pointer !important;
    font-family: Helvetica;
    font-size: 10px;
    font-style: normal;
    font-weight: 400;
    line-height: 11px;
    letter-spacing: 0em;
    text-align: center;
    display: flex;
    align-items: center;
    margin-bottom: 0px;
    text-transform: capitalize;
    padding: 9px 6px;
  }
`
