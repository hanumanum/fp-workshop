// TASK
// 1. Retrieve data from the "server".
// 3. For active employees whose salary is below the average, increase the salary by 10%.
// 4. For active employees whose salary is above the average, increase the salary by 5%.
// 5. Store the previous salary value for record-keeping.
// 6. Normalize data inconsistencies: Ensure that all salary and age fields are stored as numbers.
// 7. Bring all values to the same currency (USD) using the provided exchange rates.
// 8. Post the updated data back to the "server".
// 9. Log the number of salaries updated and the total amount of salary increase.


const API = require('./api');
const { sumByProp: fnSumByProp
    , isAbove: fnIsAbove
    , copyProp: fnCopyProp
    , changePropBy: fnChangePropBy
    , splitArrayBy
    , compose
} = require('./fp');

const fnStandartizeData = (user) => {
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

const fnConvert = async () => {
    const rates = await API.getRates();
    return (user) => {
        return {
            ...user,
            salary: user.salary / rates[user.currency],
            prevSalary: user.prevSalary / rates[user.currency]
        }
    }
}

const fnIsActiveUsers = (user) => user.isActive;
const fnIncrease5Percent = (val) => val * 1.05;
const fnIncrease10Percent = (val) => val * 1.1;
const fnCalcDifference = (user) => user.salary - user.prevSalary;
const fnSumDifference = (acc, user) => acc + fnCalcDifference(user);

const processUsersData = async() => {
    try {
        const fnConvertSalary = await fnConvert();
        const fnPrepareData = compose(
            fnStandartizeData,
            fnConvertSalary,
            fnChangePropBy('currency', () => 'USD'),
            fnCopyProp('salary', 'prevSalary')
        );

        const fnProcessAboveAvgUsers = compose(
            fnChangePropBy('salary', fnIncrease5Percent),
            fnChangePropBy('aboveAverage', () => true)
        );

        const fnProcessBelowAvgUsers = compose(
            fnChangePropBy('salary', fnIncrease10Percent),
            fnChangePropBy('aboveAverage', () => false)
        );

        const users = await API.getUsers();
        const allUsers = users.map(fnPrepareData);

        const [activeUsers, inactiveUsers] = splitArrayBy(fnIsActiveUsers, allUsers);
        const averageSalary = activeUsers.reduce(fnSumByProp('salary'), 0) / activeUsers.length;

        const fnIsAboveAvarege = fnIsAbove('salary', averageSalary);
        const [aboveAvgUsers, belowAvgUsers] = splitArrayBy(fnIsAboveAvarege, activeUsers);

        const updatedUsers = [
            ...aboveAvgUsers.map(fnProcessAboveAvgUsers),
            ...belowAvgUsers.map(fnProcessBelowAvgUsers)
        ];
        const totalIncrease = updatedUsers.reduce(fnSumDifference, 0);

        await API.postData([...updatedUsers, ...inactiveUsers]);

        console.log('Total number updated: ', updatedUsers.length);
        console.log('Total increase: ', totalIncrease);
    } catch (error) {
        console.log('Error in processUserData: ', error);
        throw error;
    }
}
processUsersData();