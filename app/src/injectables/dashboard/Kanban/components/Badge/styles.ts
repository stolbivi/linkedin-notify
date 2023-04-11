import styled from 'styled-components';

interface BadgeContainerProps{
  color: string;
}

export const BadgeContainer = styled.div<BadgeContainerProps>`
  background-color: ${({color}) => color};
  border-radius: 16px;
  
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 9px;

  p {
    color: #fff;
    text-transform: uppercase;
    padding: 4px 2px;
    font-family: 'Helvetica';
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
  }
`;
