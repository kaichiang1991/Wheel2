import { Stage, Graphics, render, useApp } from '@inlet/react-pixi'
import React, { useEffect, useState } from 'react'

const AppPIXI = props =>{

    const [app, setApp] = useState()

    const appConfig = {
        width: 600,
        height: 600,
        options: {
            resolution: 1, autoDensity: false,
        },
        onMount: e => {
            setApp(e)
        }
    }
    
    useEffect(()=>{
        console.log('use effect', app)
        const resizeFn = () => {
            if(!app)
                return
            // 找出最小長度
            const {clientWidth, clientHeight} = props.parent.current
            const min = Math.min(clientWidth, clientHeight)
            // 透過 css 設定縮放
            app.view.style.width = min + 'px'
            app.view.style.height = min + 'px'
        }

        app && window.addEventListener('resize', resizeFn)
        resizeFn()
        
    }, [app])

    return (
        <Stage {...appConfig}>
            <Graphics interactive={true} buttonMode={true} pointerdown={()=> console.log('pt down')} draw={gp =>{
                gp.beginFill(0xFF0000)
                .drawRect(0, 0, 100, 100)
                .endFill()
            }}></Graphics>
            <Graphics interactive={true} buttonMode={true} pointerdown={()=> console.log('pt down')} draw={gp =>{
                gp.beginFill(0xFF0000)
                .drawRect(500, 500, 100, 100)
                .endFill()
            }}></Graphics>
        </Stage>
    )
}

export default AppPIXI