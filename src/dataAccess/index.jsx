import axios from 'axios'
import { useState, useEffect } from 'react'

/**
 * 取得符合 title 的 server data
 * @param {*} title document name
 * @returns {Array<Object>}
 */
export const useServerData = (title) => {
    const [state, setState] = useState(null)

    useEffect(() => {
        if(!title)
            return

        const fecthServerData = async () => {
            const res = await fetchData(`/wheel/${title}`)
            setState(JSON.parse(res.data))
        }
        fecthServerData()

    }, [title])

    return state
}

/**
 * 設定資料庫資料
 * @param {*} title 表格名稱
 * @param {*} dataArr 資料陣列
 */
export const useSetServerData = (title, dataArr) => {
    useEffect(() => {
        if(!title || !dataArr?.length)
            return

        fetchData(`/wheel/${title}`, 'POST', {dataArr})
    }, [title, dataArr])
}

export const fetchGameResult = async (title) => {
    const data= (await fetchData(`/wheel/${title}/result`)).data
    return JSON.parse(data).result
}

export const updateResult = async (title, name) => {
    await fetchData(`/wheel/${title}/${name}`, 'PATCH')
}

/**
 * 取得 server 資料
 * @param {*} url api 位址
 * @param {*} [method='GET'] http method
 * @param {*} data 要傳送的資料
 * @returns 收到的資料
 */
export async function fetchData(url, method = 'GET', data){
    let res
    try{
        res = await axios({
            method, url, data
        })
    }catch(e){
        console.log('requset data', url, method, data, e)
    }
    finally{
        return res
    }
}