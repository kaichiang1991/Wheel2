import styled from "styled-components";

export const StyledWrapper = styled.div`
    text-align: center;
    
    .middle{
        margin: 0 auto;
    }

    .block{
        margin: 12px 0;
    }
`

export const StyledInput = styled.input`
    height: 32px;
    margin: 0 8px;
    padding: 4px;
`

export const StyledButton = styled.button`
    height: 32px;
    margin: 0 8px;
    padding: 4px 8px;
`

export const StyledUploadBtn = styled.label`

    input{
        display: none;
    }

    &:before{
        content: attr(value);

        display: inline-block;
        background-color: #EFEFEF;
        border: 1px solid black;

        line-height: 32px;
        height: 32px;
        padding: 4px 8px;

        font-weight: ${props => props.value === '讀取檔案'? 'unset': 'bold'}
    }
`