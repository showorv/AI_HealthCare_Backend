

const pick = <T extends Record<string, unknown>, K extends keyof T> (obj: T, keys: K[]): Partial<T>=>{

    const finalObject:  Partial<T> = {}

    for(const key of keys){
        if(obj && Object.hasOwnProperty.call(obj,key)) {
            finalObject[key]= obj[key]
        }
    }

    // console.log({obj,keys});
    

    // console.log(finalObject);
    
    return finalObject

}

export default pick