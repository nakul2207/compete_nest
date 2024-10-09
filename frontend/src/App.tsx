import { Box } from '@chakra-ui/react';
import { CodeEditor } from './components/CodeEditor';
import { useState, useEffect } from 'react';
import { Output } from './components/Output';

function App() {
  const [leftWidth, setLeftWidth] = useState<number>(50); 
  const [isDragging, setIsDragging] = useState<boolean>(false);


  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };


  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const newLeftWidth = (e.clientX / window.innerWidth) * 100; 
    setLeftWidth(Math.max(10, Math.min(newLeftWidth, 90)));
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className='flex w-screen h-screen' style={{ cursor: isDragging ? 'col-resize' : 'default', overflow: 'hidden' }}>
      <Box
        flex="none"
        width={`${leftWidth}%`}
        minH="100vh"
        bg='gray.800'
        color='white'
        px={6}
        py={8}
        overflowY="auto" 
      >
        <h1>Question:</h1>
        <p>Write a program that finds the longest common substring between two strings.</p>
      </Box>

      <Box
        flex="none"
        width="5px"
        bg="gray.600"
        cursor="col-resize"
        height="100%"       
        onMouseDown={handleMouseDown}  
      />

      <Box
        flex="none"
        width={`${100 - leftWidth}%`} 
        minH="100vh"
        bg='gray.800'
        color='white'
        px={6}
        py={8}
        overflowY="auto" 
      >
        <CodeEditor />
        <Output />
      </Box>
    </div>
  );
}

export default App;