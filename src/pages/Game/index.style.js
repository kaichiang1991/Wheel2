import styled from "styled-components";

export const StyledGameWrapper = styled.div`
    height: 100%;
    width: 100%;

    .middle{
        text-align: center;
    }

    .canvas-container{
        float: left;
        width: 70%;
        height: 100%;
        border: solid 1px black;
    }

    .game-div{
        height: 70%
    }

    .game-div:after{
        content: '';
        clear: both;
        display: block;
    }

    .ui-container{
        top: 10px;
    }

    .ui-container .start{
        left: 50%;
        transform: translateX(-50%)
    }

    .ui-container .export{
        position: fixed;
        bottom: 0;
        right: 0;
        margin-bottom: 4px;
    }
`

export const StyledListContainer = styled.ul`
    float: right;
    width: 30%;
    height: 100%;
    background-color: rgba(255, 255, 255, .4);
    overflow: auto;

    li{
        list-style: none;
        display: flex;
        justify-content: space-between;
    }

    li span{
        padding: 8px;
    }
`

export const StyledGameButton = styled.button`
    height: 48px;
    margin: 0 8px;
    padding: 4px 20px;
    box-shadow: black 4px 4px 4px;

    &:active{
        transform: translate(2px, 2px)
    }
`