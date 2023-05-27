import styled from 'styled-components';

interface BadgeContainerProps{
  color: string;
  textColor: string;
}

export const BadgeContainer = styled.div<BadgeContainerProps>`
  background-color: ${({color}) => color};
  border-radius: 16px;
  
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 9px;
  margin-right: 1px;

  p {
    color: ${({textColor}) => textColor};
    padding: 4px 2px;
    font-family: 'Helvetica';
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    margin-bottom: 0px;
  }
`;
