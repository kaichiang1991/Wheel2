import { atom, selector } from "recoil";
import { SORT_STATE as SORT_STAT } from "../contant";

export const titleState = atom({
    key: 'title',
    default: 'AAA'  // ToDo 測試
})

export const dataArrState = atom({
    key: 'dataArr',
    default: []
})

export const sortStatState = atom({
    key: 'sortStat',
    default: SORT_STAT.NONE
})

export const sortedDataArr = selector({
    key: 'sortedDataArr',
    get: ({get}) => {
        const arr = get(dataArrState)
        const sort = get(sortStatState)

        switch(sort){
            default:
            case SORT_STAT.NONE:
                return arr.slice()
            case SORT_STAT.COUNT_GREATER:
                // 從大排到小
                return arr.slice().sort((a, b) => b.count - a.count)
            case SORT_STAT.COUNT_LESS:
                // 從小排到大
                return arr.slice().sort((a, b) => a.count - b.count)
        }
    }
})

export const rollingTimelineState = atom({
    key: 'rollingTimeline',
    default: null
})