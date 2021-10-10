import React, { useEffect } from 'react'
import { useRecoilValue } from 'recoil'
import { 
    StyledGameWrapper, 
    StyledListContainer,
    StyledGameButton
} from './index.style'
import {
    dataArrState,
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
        // if(!title || !dataArr.length){
        //     // history.goBack()
        // }
    }, [])

    const canvasDivRef = React.useRef()
    console.log('ref', canvasDivRef)
    return (
        <StyledGameWrapper>
            <div className="middle">
                <h1>{title}</h1>
            </div>
            <div className="game-div">
                <div className="canvas-container" ref={canvasDivRef}>
                    <AppPIXI parent={canvasDivRef}/>
                </div>
                <StyledListContainer>
                    {
                        dataArr.map(data => <ListItem key={nanoid()} {...data} />)
                    }
                </StyledListContainer>
            </div>
            <div className="ui-container">
                <StyledGameButton className="start" children={'抽獎'}/>
                <StyledGameButton className="export" children="導出至excel"/>
            </div>
        </StyledGameWrapper>
    )
}

export default Game