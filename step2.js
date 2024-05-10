const API = require('./api');
const { log, sumByProp, isAbove, isBelow, copyProp, changePropBy } = require('./fp');

const standartizeData = (user) => {
    try {
        return {
            ...user,
            age: parseInt(user.age),
            salary: parseFloat(user.salary),
            prevSalary: parseFloat(user.prevSalary),
        }
    }
    catch (error) {
        console.log('Error in standardizeData: ', error);
        throw error;
    }
}

const convert = async () => {
    const rates = await API.getRates();
    return (user) => {
        return {
            ...user,
            salary: user.salary / rates[user.currency],
            prevSalary: user.prevSalary / rates[user.currency]
        }
    }
}

const isActiveUsers = (user) => user.isActive;
const isInActiveUsers = (user) => !isActiveUsers(user);
const increase5Percent = (val) => val *= 1.05;
const increase10Percent = (val) => val *= 1.1;
const calcDifference = (user) => user.salary - user.prevSalary;
const sumDifference = (acc, user) => acc + calcDifference(user);

async function processUserData() {
    try {
        const users = await API.getUsers();
        const convertSalary = await convert();

        const allUsers = users
            .map(standartizeData)
            .map(log('Standardized Data'))
            .map(convertSalary)
            .map(log('Converted Data'));

        const activeUsers = allUsers.filter(isActiveUsers);
        const inactiveUsers = allUsers.filter(isInActiveUsers);
        const averageSalary = activeUsers.reduce(sumByProp('salary'), 0) / activeUsers.length;

        const aboveAvgUsers = activeUsers
            .filter(isAbove('salary', averageSalary))
            .map(copyProp('salary', 'prevSalary'))
            .map(changePropBy('currency', () => 'USD'))
            .map(changePropBy('salary', increase5Percent))
            .map(changePropBy('aboveAverage', () => true));

        const belowAvgUsers = activeUsers
            .filter(isBelow('salary', averageSalary))
            .map(copyProp('salary', 'prevSalary'))
            .map(changePropBy('currency', () => 'USD'))
            .map(changePropBy('salary', increase10Percent))
            .map(changePropBy('aboveAverage', () => false));

        const updatedUsers = [...aboveAvgUsers, ...belowAvgUsers];
        const totalIncrease = updatedUsers.reduce(sumDifference, 0);

        await API.postData([...updatedUsers, ...inactiveUsers]);

        console.log('Total number updated: ', updatedUsers.length);
        console.log('Total increase: ', totalIncrease);
    } catch (error) {
        console.log('Error in processUserData: ', error);
        throw error;
    }
}
processUserData();