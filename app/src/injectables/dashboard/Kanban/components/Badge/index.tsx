 import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from 'styled-components';
import getCategoryBackgroundColor from '../../helpers/getCategoryBackgroundColor';

import ICategory from '../../interfaces/ICategory';
import { BadgeContainer } from './styles';
 import lightTheme from "../../styles/themes/light";
 import darkTheme from "../../styles/themes/dark";

interface BadgeProps {
  category: ICategory
}

const Badge: React.FC<BadgeProps> = ({ category }) => {
  const theme = useContext(ThemeContext); 

  const [color, setColor] = useState<string>(theme.colors.placeholder);
  const [textColor, setTextColor] = useState(theme.colors.text_white);

  useEffect(() => {
    if (category) {
      const categoryColor = getCategoryBackgroundColor(theme, category);
      if(ICategory.Not_Open === category || ICategory.Passive === category && theme === lightTheme) {
        setTextColor(theme.colors.text_black);
      }
      if(ICategory.Not_Open === category || ICategory.Passive === category && theme === darkTheme){
        setTextColor(theme.colors.text_white);
      }
      setColor(categoryColor);
    }
  }, [category,theme])

  return (
    <BadgeContainer color={color} textColor={textColor}>
      <p>{category}</p>
    </BadgeContainer>
  )
}

export default Badge;