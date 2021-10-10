import { nanoid } from 'nanoid'
import React from 'react'
import XLSX from 'xlsx'
import { useRecoilState } from 'recoil'
import { SORT_STATE } from '../../contant'
import List from '../List'
import { 
  StyledButton,
  StyledInput,
  StyledUploadBtn,
  StyledWrapper 
} from './index.style'

import { dataArrState, sortStatState, titleState } from '../../Recoil'
import { useHistory } from 'react-router'

let allExcelResult = []
const reader = new FileReader()
reader.onload = e =>{
  const {result} = e.target
  const {SheetNames, Sheets} = XLSX.read(result, {type: 'binary'})
        
  // 清空儲存的陣列
  allExcelResult = []
  for (const name of SheetNames) {
      const data = XLSX.utils.sheet_to_json(Sheets[name], {header: 1})
      if(!data[0])
          break

      const nameIdx = data[0].findIndex(obj => obj === '品項'), countIdx = data[0].findIndex(obj => obj === '數量')
      allExcelResult.push(...data.slice(1).map(data => ({name: data[nameIdx], count: +data[countIdx]})))
  }
}

const App = ()=>{
  //#region Title
  const [title, setTitle] = useRecoilState(titleState)
  const handleTitleChange = ({target: {value}}) => {
    setTitle(value)
  }
  //#endregion Title

  const [dataArr, setDataArr] = useRecoilState(dataArrState)

  //#region 手動輸入
  const [name, setName] = React.useState('')
  const [count, setCount] = React.useState('')
  const handleChange = ({target: {type, value}}) => {
    if(type === 'number'){    // 個數
      setCount(+value)
    }else{                    // 名稱
      setName(value)
    }
  }

  // 新增項目
  const addNewItem = () => {
    if(!name || !count)
      return

    let index
    if((index = dataArr.findIndex(obj => obj.name === name)) > -1){           // 重複的品名，直接改變數量
      setDataArr(dataArr.map((data, dataIdx) => dataIdx === index? {name, count}: data))
    }else{
      setDataArr([...dataArr, {name, count}])                         // 新的品項，新增
    }
  }
  //#endregion 手動輸入

  //#region 排序項目
  const [sortStat, setSortStat] = useRecoilState(sortStatState)
  const setSortStatByIndex = e => {    // 根據select index 去決定排序方式
    const {0: label_0, 1: label_1, 2: label_2, selectedIndex} = e.target.options
    setSortStat((selectedIndex === 0? label_0: selectedIndex === 1? label_1: label_2).label)
  }
  //#endregion 排序項目

  //#region 處理 excel
  const [uploadValue, setUploadValue] = React.useState('讀取檔案')
  const loadFile = ({target: {files}}) => {
    const [file] = files, {name} = file || {}
    if(!name)
      return

    // 設定讀取的檔案名稱
    setUploadValue(name)
    // 解析 excel
    reader.readAsBinaryString(file)
  }

  const importExcel = () => {
    setDataArr(allExcelResult)
  }
  //#endregion 處理 excel

  //#region 開始遊戲
  const history = useHistory()
  const jumpToGame = () => {
    if(!title){
      alert('抽獎名稱未設定')
      return
    }

    if(dataArr.length <= 0){
      alert('沒有抽獎資料')
      return
    }

    history.push('game')
  }
  //#endregion 開始遊戲

  return (
    <StyledWrapper>
      <div className="middle">
        <h1>抽獎</h1>
        <div className="block">
          <StyledInput placeholder='抽獎名稱' value={title} onChange={handleTitleChange}/>
          <StyledButton children="讀取" />
        </div>

        <div className="block">
          <StyledUploadBtn value={uploadValue}><input onChange={loadFile} type='file' accept={'.xls, .xlsx'}></input></StyledUploadBtn>
          <StyledButton children="匯入" onClick={importExcel}/>
        </div>

        <div className="block">
          <StyledInput placeholder="名稱" value={name} onChange={handleChange}/>
          <StyledInput placeholder="數量" value={count} onChange={handleChange} type="number" />
          <StyledButton children="新增" onClick={addNewItem} />
        </div>

        <div className="block">
          <List />
        </div>

        <div className="block">
          <select value={sortStat} onChange={setSortStatByIndex}>
            {
              Object.values(SORT_STATE).map(value => <option key={nanoid()} value={value} children={value} />)
            }
          </select>
          <StyledButton children="重置" onClick={()=> setDataArr([])}/>
          <StyledButton children="開始抽獎" onClick={jumpToGame}/>
        </div>
      </div>
    </StyledWrapper>
  )
}

export default App

