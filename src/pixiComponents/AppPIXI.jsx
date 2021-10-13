import { Stage, Container, Text } from '@inlet/react-pixi'
import gsap from 'gsap'
import { Elastic, Power0 } from 'gsap/gsap-core'
import { Power1 } from 'gsap/gsap-core'
import React, { useEffect, useRef, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { dataArrState, rollingTimelineState, titleState } from '../Recoil'
import Wheel from './Wheel'
import Arrow from './Arrow'
import { fetchGameResult, updateResult } from '../dataAccess'

const wheelConfig = {
    duration: 1,            // 數字越小，轉盤越快
    leastDur: 1000,         // 最少轉動時間 (ms)
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

    const title = useRecoilValue(titleState)
    const [dataArr, setDataArr] = useRecoilState(dataArrState)
    const [rollingTimeline, setRollingTimeline] = useRecoilState(rollingTimelineState)

    const [showResult, setShowResult] = useState('')
    const wheelRef = useRef(), arrowRef = useRef(), textRef = useRef()

    // 監聽是否開始轉動
    useEffect(()=>{
        if(!isRolling)
            return

        /** 開始轉動 */
        const startRolling = async () => {
            return new Promise(async res =>{

                const wheel = wheelRef.current
                const config = {degree: 0}
                const {duration} = wheelConfig
                let baseAngle = wheel.angle % 360, remainAngle = 0
                let result
                
                const timeline = gsap.timeline()
                .to(config, {ease: Power1.easeOut, degree: -10})        // 往回拉
                .to(config, {ease: Power0.easeNone, repeat: -1, duration, degree: 360, onComplete: () => {
                    timeline.kill()
                    playResult(result, res)
                }})
                .eventCallback('onUpdate', ()=>{
                    wheel.angle = config.degree + baseAngle
                    remainAngle = wheel.angle % 360
                    calcCurrentIndex(remainAngle)
                })
                setRollingTimeline(timeline)
                
                // 獲取結果
                const [_result] = await Promise.all([
                    fetchGameResult(title),
                    new Promise(res => setTimeout(res, wheelConfig.leastDur))
                ])
                result = _result
                
                // 通知停止
                const repeatTween = timeline.getChildren()[1]
                const repeatTimes = Math.ceil(repeatTween.totalTime() / repeatTween.duration())
                repeatTween.repeat(repeatTimes)
            })
        }
    
        /** 播放結果 */
        const playResult = async (result, endFn) => {
            const wheel = wheelRef.current
    
            let remainAngle = 0, baseAngle = wheel.angle % 360
            const resultAngle = getResultAngle(result), config = {degree: 0}, target = resultAngle <= baseAngle? (resultAngle + 360): resultAngle
    
            gsap.to(config, {ease: Power0.easeNone, duration: target / 360 * wheelConfig.duration, degree: target - baseAngle})
            .eventCallback('onUpdate', ()=>{
                wheel.angle = config.degree + baseAngle
                remainAngle = wheel.angle % 360
                calcCurrentIndex(remainAngle)
            })
            .eventCallback('onComplete', async ()=>{
                await updateResult(title, result)       // 更新 database
                await playShowResultEffect()            // 強調結果
                setDataArr(dataArr.map(data => data.name === result? {...data, count: data.count - 1}: data))
                endFn()
            })
        }

        /** 播放結果的文字演出 */
        const playShowResultEffect = async () => {
            return new Promise(res =>{
                const text = textRef.current
                gsap.to(text.scale, {yoyo: true, repeat: 3, duration: .3, x: 1.2, y: 1.2})
                .eventCallback('onComplete', res)
            })
        }

        /**
         * 設定目前指到的獎項 index
         * @param {*} angle 角度 degree
         */
        const calcCurrentIndex = (angle)=>{
            const totalCount = dataArr.reduce((pre, curr) => pre + curr.origCount, 0)
            const clockwiseAngle = 360 - angle
            const key = dataArr.findIndex((_, idx) => clockwiseAngle <= dataArr.slice(0, idx + 1).reduce((pre, curr) => pre + (curr.origCount / totalCount * 360), 0))

            if(key !== currentIndex){
                wheelRef.current.emit(boundEvent, key)     // 通知換邊界了
            }
        }
        
        /** 取得結果的角度 */
        const getResultAngle = (name)=>{
            const totalCount = dataArr.reduce((pre, curr) => pre + curr.origCount, 0)

            const reverse = dataArr.slice().reverse()
                , reverseIndex = reverse.findIndex(obj => obj.name === name)
                , preCount = reverse.slice(0, reverseIndex).reduce((pre, curr) => pre + curr.origCount, 0)

            const bottom = preCount / totalCount * 360, top = (preCount + dataArr.find(obj => obj.name === name).origCount) / totalCount * 360
            return gsap.utils.random(bottom, top, 1) 
        }
        
        // 滾動的流程
        const rollingProcess = async ()=>{

            if(rollingTimeline)
                return

            //#region 設定監聽
            const wheel = wheelRef.current, arrow = arrowRef.current
            // 箭頭抖動
            const arrowTween = gsap.timeline()
            .to(arrow, {duration: .2, ease: Power1.easeOut, angle: '-=15'})
            .to(arrow, {duration: .45, ease: Elastic.easeOut.config(1.75, .5), angle: '+=15'})
            arrowTween.pause()
    
            wheel.on(boundEvent, ctx => {
                currentIndex = ctx
                currentIndex > -1 && setShowResult(dataArr[currentIndex].name)      // 顯示結果文字
                arrowTween.isActive() && arrowTween.kill()
                arrowTween.totalProgress(0).play()
            })
            //#endregion 設定監聽

            await startRolling()
            wheel.off(boundEvent)

            setIsRolling(false)             // 讓開始按鈕可以按
            setRollingTimeline(null)        // 讓他可以返回上一頁
        }

        rollingProcess()

    }, [isRolling, setIsRolling, dataArr, setDataArr, title, rollingTimeline, setRollingTimeline])

    return (
        <Stage {...appConfig}>
            <Container position={[0, 300]}>
                <Wheel ref={wheelRef} dataArr={dataArr} />
                <Arrow ref={arrowRef} />
                <Text ref={textRef} position={[360, 0]} anchor={[-.2, .5]} text={showResult} style={{
                    fontSize: 48
                }} />
            </Container>
        </Stage>
    )
}

export default AppPIXI