import { nanoid } from 'nanoid'
import React from 'react'
import XLSX from 'xlsx'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { SORT_STATE } from '../../contant'
import List from '../../List'
import { 
  StyledButton,
  StyledInput,
  StyledUploadBtn,
  StyledWrapper 
} from './index.style'

import { dataArr, sortState } from '../../Recoil'

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
  const [uploadValue, setUploadValue] = React.useState('讀取檔案')

  const [state, setSortState] = useRecoilState(sortState)
  const setSortStateByIndex = e => {    // 根據select index 去決定排序方式
    const {0: label_0, 1: label_1, 2: label_2, selectedIndex} = e.target.options
    setSortState((selectedIndex === 0? label_0: selectedIndex === 1? label_1: label_2).label)
  }

  const [arr, setDataArr] = useRecoilState(dataArr)
  const nameRef = React.useRef(), countRef = React.useRef()
  const addNewItem = () => {
    const {value: name} = nameRef.current, {value: count} = countRef.current
    if(!name || !count)
      return

    let index
    if((index = arr.findIndex(obj => obj.name === name)) > -1){           // 重複的品名，直接改變數量
      setDataArr([...arr.slice(0, index === 0? 0: index), {name, count: +count}, ...arr.slice(index + 1, arr.length)])
    }else{
      setDataArr([...arr, {name, count: +count}])                         // 新的品項，新增
    }
  }

  //#region 處理 excel
  const loadFile = (e) => {
    const [file] = e.target.files, {name} = file || {}
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

  return (
    <StyledWrapper>
      <div className="middle">
        <h1>抽獎</h1>
        <div className="block">
          <StyledInput placeholder='抽獎名稱' />
          <StyledButton children="讀取" />
        </div>

        <div className="block">
          <StyledUploadBtn value={uploadValue}><input onChange={loadFile} type='file' accept={'.xls, .xlsx'}></input></StyledUploadBtn>
          <StyledButton children="匯入" onClick={importExcel}/>
        </div>

        <div className="block">
          <StyledInput ref={nameRef} placeholder="名稱"/>
          <StyledInput ref={countRef} type="number" placeholder="數量"/>
          <StyledButton children="新增" onClick={addNewItem} />
        </div>

        <div className="block">
          <List />
        </div>

        <div className="block">
          <select value={state} onChange={setSortStateByIndex}>
            {
              Object.values(SORT_STATE).map(value => <option key={nanoid()} value={value} children={value} />)
            }
          </select>
          <StyledButton children="重置" onClick={()=> setDataArr([])}/>
          <StyledButton children="開始抽獎" />
        </div>
      </div>
    </StyledWrapper>
  )
}

export default App

