import React from 'react'
import { useRecoilValue } from 'recoil'
import { StyledGameWrapper } from './index.style'
import {
    titleState
} from '../../Recoil'

const Game = () => {
    const title = useRecoilValue(titleState)
    return (
        <StyledGameWrapper>
            <div className="middle">
                <h1>{title}</h1>
            </div>
            <div className="left">111</div>
            <div className="right">222</div>
        </StyledGameWrapper>
    )
}

export default Game