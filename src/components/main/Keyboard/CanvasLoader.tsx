import { Html, useProgress } from '@react-three/drei'
import React from 'react'

function CanvasLoader() {
    const { progress } = useProgress()
    return (
        // in canvas to load a html we have to use the tag as html
        <Html
            as="div"
            center
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',

            }}
        >
            <span className='canvas-loader' />
            <p style={{
                fontSize: 14,
                color: '#F1F1F1',
                fontWeight: 800,
                marginTop: 40
            }}>
                {progress != 0 ? `${progress.toFixed(2)}%` : 'loading...'}
            </p>
        </Html>
    )
}

export default CanvasLoader