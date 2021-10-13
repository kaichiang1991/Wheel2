import React, { useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { 
    StyledGameWrapper, 
    StyledListContainer,
    StyledGameButton
} from './index.style'
import {
    dataArrState,
    rollingTimelineState,
    titleState
} from '../../Recoil'
import { useHistory } from 'react-router'
import { nanoid } from 'nanoid'
import AppPIXI from '../../pixiComponents/AppPIXI'

const ListItem = props => {
    const {name, count} = props
    return (
        <li>
            <span className="name">{name}</span>
            <span className="count">{count} 個</span>
        </li>
    )
}

const Game = () => {
    const title = useRecoilValue(titleState)
    const dataArr = useRecoilValue(dataArrState)

    const history = useHistory()
    useEffect(()=>{
        // 避免重新整理後沒資料，回到上一頁
        if(!title || !dataArr.length){
            history.goBack()
        }
    }, [title, dataArr, history])

    const canvasDivRef = React.useRef()

    //#region 抽獎開始
    const [isRolling, setIsRolling] = useState(false)
    const handleClick = () => {
        // 檢查還有沒有獎項
        if(!dataArr.find(data => data.count > 0)){
            alert('沒有獎項了')
            return
        }

        if(!isRolling)
            setIsRolling(!isRolling)
    }       
    //#endregion 抽獎開始

    const rollingTimeline = useRecoilValue(rollingTimelineState)
    return (
        <StyledGameWrapper>
            <div className="middle">
                <h1>{title}</h1>
            </div>
            <div className="game-div">
                <div className="canvas-container" ref={canvasDivRef}>
                    <AppPIXI parent={canvasDivRef} isRolling={isRolling} setIsRolling={setIsRolling}/>
                </div>
                <StyledListContainer>
                    {
                        dataArr.map(data => <ListItem key={nanoid()} {...data} />)
                    }
                </StyledListContainer>
            </div>
            <div className="ui-container">
                <StyledGameButton className="start" children={'抽獎'} onClick={handleClick}/>
                <div className="export">
                    <StyledGameButton children="回上一頁" onClick={()=> {
                        if(!rollingTimeline){       // 判斷沒有在轉動才回上一頁
                            history.goBack()
                        }
                    }}/>
                    <StyledGameButton children="導出至excel"/>
                </div>
            </div>
        </StyledGameWrapper>
    )
}

export default Game