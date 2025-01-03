import styled from "styled-components";
import { SCREEN_BREAKPOINTS } from "../../constants/breakpoints";

interface ContainerProps{
  isFirstColumn: boolean
}

export const Container = styled.div<ContainerProps>`
  width: 300px;

  ${({ isFirstColumn }) => isFirstColumn && `
    
  `}

  @media(max-width: ${SCREEN_BREAKPOINTS.EXTRA_LARGE}px) {
    ${({ isFirstColumn }) => isFirstColumn && `
    margin-left: 2rem;
    `}
  }
`

export const CardsList = styled.div`
  margin-top: 1rem;
  height: 100%;
  width: 220px;
`;