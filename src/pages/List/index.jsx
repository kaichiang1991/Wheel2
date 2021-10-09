import React, { useEffect, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { 
    StyledListContainer,
    StyledListItem
} from './index.style'

import {
    dataArr, sortedDataArr
} from '../../Recoil'
import { nanoid } from 'nanoid'

const fetchAPI = () => Math.random()

const ListItem = (props) =>{
    const {name, count} = props
    const [arr, setDataArr] = useRecoilState(dataArr)
    // 調整項目的數量
    const adjustCount = flag =>{
        const index = arr.findIndex(obj => obj.name === name), obj = arr[index]
        const count = flag? obj.count + 1: obj.count - 1 > 0? obj.count - 1: 0
        setDataArr([...arr.slice(0, index === 0? 0: index), {name, count}, ...arr.slice(index + 1, arr.length)])
    }

    // 從清單中刪除項目
    const deleteItem = () => {
        const index = arr.findIndex(obj => obj.name === name)
        const copyArr = arr.slice()
        copyArr.splice(index, 1)
        setDataArr(copyArr)
    }

    return (
        <StyledListItem>
            <td>{name}</td>
            <td>{count} 個</td>
            <td><button children="+" onClick={adjustCount.bind(this, true)}/></td>
            <td><button children="-" onClick={adjustCount.bind(this, false)}/></td>
            <td><button children="刪除" onClick={deleteItem}/></td>
        </StyledListItem>
    )
}

const List = () => {

    const [arr, setDataArr] = useRecoilState(dataArr)
    const sortedData = useRecoilValue(sortedDataArr)

    return (
        <StyledListContainer>
            <table>
                <thead onClick={()=> setDataArr([...arr, {name: 'aa', count: 10}, {name: 'bb', count: 5}])}>
                    <tr>
                        <th colSpan="5"><h2>品項清單</h2></th>
                    </tr>
                </thead>
                <tbody>
                    {
                        sortedData.map(data => <ListItem key={nanoid()} {...data}></ListItem>)
                    }
                </tbody>
            </table>
        </StyledListContainer>
    )    
}

export default List