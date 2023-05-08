import logo from './logo.svg';
import './App.css';
import React, { useRef, useEffect } from 'react'
import { useQuery, gql } from '@apollo/client';

const width = 600
const height = 400

const STEP = gql`
    query {
      observation {
        fields {
          name
          values
          shape
        }
        pixels
      }
    }
`;

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const Canvas = props => {

  const { loading, error, data, refetch } = useQuery(STEP);  
  const canvasRef = useRef(null)

  
  const draw = (ctx, drawData) => {
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, width, height)

    const pixels = drawData?.observation?.pixels;

    if (pixels) {
      var obj = JSON.parse(pixels.replace(/^"|"$/g, ""));

      console.log("obj", typeof obj, obj);

      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      
      let idx = 0;
      for (var i = 0; i < height; i++) {
        for (var j = 0; j < width; j++) {
          data[idx] = obj[i][j][0];
          data[idx+1] = obj[i][j][1];
          data[idx+2] = obj[i][j][2];
          idx += 4;

        }
      }

      ctx.putImageData(imageData, 0, 0);
    }

  }
  
  useEffect(() => {
    
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    context.canvas.width = width
    context.canvas.height = height
    
    draw(context, data)

    setTimeout(() => {
      refetch()
    }, 50);
    
  }, [data, refetch])


  
  return <canvas ref={canvasRef} {...props}/>
}



function App() {
  return (
      <Canvas  />
  );
}

export default App;
