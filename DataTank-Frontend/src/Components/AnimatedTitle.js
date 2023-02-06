import React, { useState, useEffect } from 'react';

function AnimatedTitle(){
    const [mouseX, setMouseX] = useState(0);
    const [mouseY, setMouseY] = useState(0);
    useEffect(() => {
        const handleMouseMove = event => {
          setMouseX(event.clientX);
          setMouseY(event.clientY);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => {
          window.removeEventListener('mousemove', handleMouseMove);
        };
      }, []);
    return(
        <div>
        <div
            style={{
            position: 'relative',
            fontSize: 72,
            fontFamily: 'Niko',
            color: '#5eff00'
            }}
            className="select-none"
        >
        DataTank Dao
        <div
          style={{
            position: 'absolute',
            left: mouseX / 40,
            top: mouseY / 40,
            fontSize: 72,
            fontFamily: 'Niko',
            color: 'rgba(189, 89, 182, 0.21)',
            minWidth:'120%',
            fontWeight:'bold'
           // textShadow: '0 0 10px #fff, 0 0 20px #fff, 0 0 30px #fff, 0 0 40px #00ffc6, 0 0 70px #00ffc6, 0 0 80px #00ffc6, 0 0 100px #00ffc6, 0 0 150px #00ffc6'
          }}
          className="select-none"
        >
          DataTank Dao
        </div>
      </div>
        <span className='font-bold text-white text-2xl text-center select-none'>A Data fundraising platform</span>
      </div>
    )
}

export default AnimatedTitle;