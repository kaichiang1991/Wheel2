import { Stage, Graphics, Container } from '@inlet/react-pixi'
import gsap from 'gsap'
import { Elastic, Power0 } from 'gsap/gsap-core'
import { Power1 } from 'gsap/gsap-core'
import React, { useEffect, useRef, useState } from 'react'
import { useRecoilState } from 'recoil'
import { dataArrState } from '../Recoil'
import Wheel from './Wheel'
import Arrow from './Arrow'

const wheelConfig = {
    duration: 1,           // 數字越小，轉盤越快
}
const boundEvent = 'boundEvent'     // 邊界事件的名稱
let currentIndex = 0

const AppPIXI = props =>{

    const {isRolling, setIsRolling} = props
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
    
    // 設定自適應
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

    }, [app, props.parent])

    const wheelRef = useRef(), arrowRef = useRef()

    // 監聽是否開始轉動
    useEffect(()=>{
        if(!isRolling)
            return

        const startRolling = async () => {
            const wheel = wheelRef.current
            const config = {degree: 0}
            const {duration} = wheelConfig
            let baseAngle = wheel.angle % 360, remainAngle = 0
    
            const timeline = gsap.timeline()
            .to(config, {ease: Power1.easeOut, degree: -10})        // 往回拉
            .to(config, {ease: Power0.easeNone, repeat: -1, duration, degree: 360, onComplete: () => {
                timeline.kill()
                playResult()
            }})
            .eventCallback('onUpdate', ()=>{
                wheel.angle = config.degree + baseAngle
                remainAngle = wheel.angle % 360
                calcCurrentIndex(remainAngle)
            })
    
            // ToDo 先計時停止
            setTimeout(() => {
                const repeatTween = timeline.getChildren()[1]
                const repeatTimes = Math.ceil(repeatTween.totalTime() / repeatTween.duration())
                repeatTween.repeat(repeatTimes)
            }, 100);
        }
    
        const playResult = async () => {
            const wheel = wheelRef.current
            console.log('play result', wheel.angle)
    
            let remainAngle = 0, baseAngle = wheel.angle % 360
            const item = getResult(), result = getResultAngle(item), config = {degree: 0}, target = result <= baseAngle? (result + 360): result
    
            console.log('item', item, ' result', result)
            // request server
            // requestServer('/api/update', 'POST', {title: this.state.title, name: item})
            
            gsap.to(config, {ease: 'none', duration: target / 360 * wheelConfig.duration, degree: target - baseAngle})
            .eventCallback('onUpdate', ()=>{
                wheel.angle = config.degree + baseAngle
                remainAngle = wheel.angle % 360
                calcCurrentIndex(remainAngle)
            })
            .eventCallback('onComplete', ()=>{
                console.log(`%ccomplete`, 'color:red', wheel.angle)
                setIsRolling(false)
            })
        }

        /**
         * 設定目前指到的獎項 index
         * @param {*} angle 角度 degree
         */
        const calcCurrentIndex = (angle)=>{
            const totalCount = modDataArr.reduce((pre, curr) => pre + curr.origCount, 0)
            const clockwiseAngle = 360 - angle
            const key = modDataArr.findIndex((_, idx) => clockwiseAngle <= modDataArr.slice(0, idx + 1).reduce((pre, curr) => pre + (curr.origCount / totalCount * 360), 0))

            if(key !== currentIndex){
                wheelRef.current.emit(boundEvent, key)     // 通知換邊界了
            }
        }
        
        /** 取得結果 */
        const getResult = ()=>{
            const totalCount = modDataArr.reduce((pre, curr) => pre + curr.count, 0)
            const index = gsap.utils.random(1, totalCount, 1) - 1
            , key = modDataArr.findIndex((_, idx) => modDataArr[idx].count > 0 && index < modDataArr.slice(0, idx + 1).reduce((pre, curr) => pre + curr.origCount, 0))
            return modDataArr[key].name
        }

        /** 取得結果的角度 */
        const getResultAngle = (itemName)=>{
            const totalCount = modDataArr.reduce((pre, curr) => pre + curr.origCount, 0)

            const reverse = modDataArr.slice().reverse()
                , reverseIndex = reverse.findIndex(obj => obj.item === itemName)
                , preCount = reverse.slice(0, reverseIndex).reduce((pre, curr) => pre + curr.origCount, 0)

            const bottom = preCount / totalCount * 360, top = (preCount + modDataArr.find(obj => obj.name === itemName).origCount) / totalCount * 360
            return gsap.utils.random(bottom, top, 1) 
        }
        
        const rollingProcess = async ()=>{

            //#region 設定監聽
            const wheel = wheelRef.current, arrow = arrowRef.current
            // 箭頭抖動
            const arrowTween = gsap.timeline()
            .to(arrow, {duration: .2, ease: Power1.easeOut, angle: '-=15'})
            .to(arrow, {duration: .45, ease: Elastic.easeOut.config(1.75, .5), angle: '+=15'})
            arrowTween.pause()
    
            wheel.on(boundEvent, ctx => {
                currentIndex = ctx
                console.log('on bound', ctx)
                arrowTween.isActive() && arrowTween.kill()
                arrowTween.totalProgress(0).play()
            })
            //#endregion 設定監聽

            await startRolling()
        }

        
        rollingProcess()

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

            <Container position={[0, 300]}>
                <Wheel ref={wheelRef} dataArr={modDataArr} />
                <Arrow ref={arrowRef} />
            </Container>

        </Stage>
    )
}

export default AppPIXI