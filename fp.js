const log = (title) => (data) => {
    console.log(`${title} =>`, data);
    return data;
}
// Working with functions
const compose = (...fns) => (x) => fns.reduce((v, f) => f(v), x);

// Working with arrays
const splitArrayBy = (boolfn, arr) => {
    const fnYes = (val) => boolfn(val);
    const fnNo = (val) => !boolfn(val);
    return [arr.filter(fnYes), arr.filter(fnNo)];
}

// Working with objects properties
const isAbove = (propName, val) => (obj) => obj[propName] > val;
const isBelow = (propName, val) => (obj) => !isAbove(propName, val)(obj);
const sumByProp = (propName) => (acc, obj) => acc + obj[propName];
const copyProp = (propNameFrom, propNameTo) => (obj) => ({ ...obj, [propNameTo]: obj[propNameFrom] });
const changePropBy = (propName, changerFn) => (obj) => ({ ...obj, [propName]: changerFn(obj[propName]) });

module.exports = {
    log,
    compose,
    sumByProp,
    isAbove,
    isBelow,
    copyProp,
    changePropBy,
    splitArrayBy
}