import { Box, Button, Menu, MenuButton, MenuItem, MenuList, Text } from "@chakra-ui/react";
import { LANGUAGE_VERSIONS } from "../constants";
import { CODE_SNIPPETS } from '../constants';
type Language = keyof typeof CODE_SNIPPETS;

interface LangSelectorProps {
  language: string;
  onSelect: (language: Language) => void;
}

const languages = Object.entries(LANGUAGE_VERSIONS);

export const LangSelector = ({language,onSelect}: LangSelectorProps) => {
  return (
    <Box > 
      <Text mb={1} fontSize="lg">
        Select Language:
      </Text>
      <Menu >
        <MenuButton as={Button}
        bg="white"
        my={2}
        borderRadius="sm"
        borderWidth='1px'
        color="black"     
        _hover={{ bg: 'gray.400' }}
        outline="black"
        >{language}</MenuButton>
        <MenuList>
          {languages.map(([language, version]) => (
            <MenuItem key={language} onClick={()=>onSelect(language as Language)}>
              {language}
              &nbsp;
              <Text as="span" color="gray.500" fontSize="sm">
                {version}
              </Text>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </Box>
  );
};