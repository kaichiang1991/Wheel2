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
 * 取得 server 資料
 * @param {*} url api 位址
 * @param {*} [method='GET'] http method
 * @param {*} data 要傳送的資料
 * @returns 收到的資料
 */
async function fetchData(url, method = 'GET', data){
    let res
    try{
        res = await axios({
            method, url, data
        })
    }catch(e){
        console.log('requset data', url, method, data, e)
    }
    finally{
        console.log('finally', res)
        return res
    }
}