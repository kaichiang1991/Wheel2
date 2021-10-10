import { Stage, Graphics } from '@inlet/react-pixi'
import gsap from 'gsap'
import { Power0 } from 'gsap/gsap-core'
import { Power1 } from 'gsap/gsap-core'
import React, { useEffect, useRef, useState } from 'react'
import { useRecoilState } from 'recoil'
import { dataArrState } from '../Recoil'
import Wheel from './Wheel'

const AppPIXI = props =>{

    const {isRolling} = props
    const [app, setApp] = useState()

    const appConfig = {
        width: 600,
        height: 600,
        options: {
            resolution: 1, autoDensity: false, transparent: true
        },
        onMount: e => {
            setApp(e)
        }
    }
    
    useEffect(()=>{
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

        return () =>{
            // unmount 時移除事件
            window.removeEventListener('resize', resizeFn)
        }

    }, [app])

    const wheelRef = useRef()
    const startRolling = async () => {
        const wheel = wheelRef.current
        const config = {degree: 0}
        let baseAngle = 0, remainAngle = 0

        const timeline = gsap.timeline()
        .to(config, {ease: Power1.easeOut, degree: -10})        // 往回拉
        .to(config, {ease: Power0.easeNone, duration: 10, degree: 360 * 5})
        .eventCallback('onUpdate', ()=>{
            wheel.angle = config.degree + baseAngle
            remainAngle = wheel.angle % 360
            // this.setCurrentIndex(remainAngle)
        })
    }

    useEffect(async ()=>{
        if(!isRolling)
            return

        await startRolling()

    }, [isRolling])

    const [dataArr, setDataArr] = useRecoilState(dataArrState)
    const [modDataArr] = useState(dataArr.map(data => ({...data, origCount: data.count})))

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

            <Wheel ref={wheelRef} dataArr={modDataArr} />
        </Stage>
    )
}

export default AppPIXI