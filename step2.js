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

const processUsersData = async() => {
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
processUsersData();