import { Box,Text,Button } from "@chakra-ui/react"
export const Output = () => {
  return (
    <Box >
        <Text my={2} fontSize="lg">
            Output
        </Text>
        <Box
        height="25vh"
        p={2}
        border="1px solid"
        borderColor="#333">
            Output
        </Box>
        <Box
          display="flex"
          justifyContent="flex-end"
          mt={4} 
        >
          <Button
            variant="outline"
            colorScheme="blue"
            my={4}
          >
            Run Code
          </Button>
          <Button
            variant="outline"
            colorScheme="blue"
            mx={2}
            my={4}
          >
            Submit Code
          </Button>
        </Box>
    </Box>
  )
}
