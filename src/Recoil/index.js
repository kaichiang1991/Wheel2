import { atom, selector } from "recoil";
import { SORT_STATE } from "../contant";

export const dataArr = atom({
    key: 'dataArr',
    default: []
})

export const sortState = atom({
    key: 'sortState',
    default: SORT_STATE.NONE
})

export const sortedDataArr = selector({
    key: 'sortedDataArr',
    get: ({get}) => {
        const arr = get(dataArr)
        const sort = get(sortState)

        switch(sort){
            default:
            case SORT_STATE.NONE:
                return arr.slice()
            case SORT_STATE.COUNT_GREATER:
                // 從大排到小
                return arr.slice().sort((a, b) => b.count - a.count)
            case SORT_STATE.COUNT_LESS:
                // 從小排到大
                return arr.slice().sort((a, b) => a.count - b.count)
        }
    }
})