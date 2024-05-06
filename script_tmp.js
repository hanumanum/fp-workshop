const API = require('./api');

// TASK
// 1. Retrieve data from the "server".
// 2. Calculate the average salary of all active employees excluding.
// 3. For active employees whose salary is below the average, increase the salary by 10%.
// 4. For active employees whose salary is above the average, increase the salary by 5%.
// 5. Store the previous salary value for record-keeping.
// 6. Exclude any adjustments to salaries of employees marked as 'isCGrade'.
// 7. Normalize data inconsistencies: Ensure that all salary and age fields are stored as numbers.
// 8. Post the updated data back to the "server".
// 9. Log the number of salaries updated and the total amount of salary increase.

// Note: There are some bugs in provided code

//PLAN
// 1. Introduce stnadardizeData() to standardize data: standardizeData(user) => user  //for use in map
// 2. Introduce fp log function log => ('title') => (data) => console.log(title, data) && return data; 
// 2. Introduce function to convert salary in USD: convert()(user) => {... user, salaryInUSD, prevSalaryInUSD } //to show function returning function 
// 3. filter users by isActive: filter (with function filterer: actives: bool)
// 4. calculate average salary: reduce (with reducer function) reducer(field)(acc, user) => acc + user[field]
// 5. 


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

const log = (title) => (data) => {
    console.log(`${title} =>`, data);
    return data;
}

const convert = async () => {
    const rates = await API.getRates();
    return (user) => {
        return {
            ...user,
            salaryInUSD: user.salary / rates[user.currency],
            prevSalaryInUSD: user.prevSalary / rates[user.currency]
        }
    }
}

const isActiveUsers = (user) => user.isActive;
const isCGradeUsers = (user) => user.isCGrade;
const isNotCGradeUsers = (user) => !isCGradeUsers(user);
const isInActiveUsers = (user) => !isActiveUsers(user);
const sumByProp = (propName) => (acc, obj) => acc + obj[propName];
const multiplyProp = (propName, multiplyer) => (obj) => ({ ...obj, [propName]: [propName] * multiplyer }); // TODO: fix this
const aboveAvg  = (prop, avg) => (obj) => obj[prop] > avg;
const belowAvg = (prop, avg) => (obj) => !aboveAvg(prop, avg)(obj);
const copyPropVal = (propFrom, propTo) => (obj) => ({ ...obj, [propTo]: obj[propFrom] });
const setPropVal = (prop, val) => (obj) => ({ ...obj, [prop]: val });

async function processUserData() {
    const convertToUSD = await convert();
    const sumSalaryInUSD = sumByProp('salaryInUSD');

    let averageSalary = 0;
    let updatedNumber = 0;
    let totalIncrease = 0;

    try {
        const users = await API.getUsers();

        const _users = users
            .map(standartizeData)
            .map(log('Standardized Data'))
            .map(convertToUSD)
            .map(log('Converted'))

        const activeUsers = _users
            .filter(isActiveUsers)
        const inactiveUsers = _users
            .filter(isInActiveUsers)

        const avgSalary = activeUsers.reduce(sumSalaryInUSD, 0) / activeUsers.length;
        log('Average Salary')(avgSalary);

         const aboveAvgUser = [] /* activeUsers
            .filter(isNotCGradeUsers)
            .filter(aboveAvg('salaryInUSD', avgSalary))
            .map(copyPropVal('salaryInUSD', 'prevSalaryInUSD'))
            .map(multiplyProp('salaryInUSD', 1.05))
            .map(setPropVal('aboveAverage', true)); */
        
        const belowAvgUsers = activeUsers
            .filter(isNotCGradeUsers)
            .filter(belowAvg('salaryInUSD', avgSalary))
            .map(copyPropVal('salaryInUSD', 'prevSalaryInUSD'))
            .map(multiplyProp('salaryInUSD', 1.1))
            .map(setPropVal('aboveAverage', false));
        
        const cGradeUsers = activeUsers
            .filter(isCGradeUsers);
        

        const updatedUsers = [...aboveAvgUser, ...belowAvgUsers].map(log('Updated Users'));
        log('Total number updated:')(updatedUsers.length);

        const totalIncrease = updatedUsers.reduce((acc, user) => acc + user.salaryInUSD - user.prevSalaryInUSD, 0);
        log('Total increase: ')(totalIncrease);

        return;

        console.log('Average Salary: ', averageSalary);

        try {
            for (let i = 0; i < users.length; i++) {
                if (users[i].isActive && !users[i].isCGrade) {
                    if (parseFloat(users[i].salary) < averageSalary) {
                        users[i].aboveAverage = false;
                        users[i].prevSalary = users[i].salary;
                        users[i].salary = parseFloat(users[i].salary) * 1.1;
                    }
                    else {
                        users[i].aboveAverage = true;
                        users[i].prevSalary = users[i].salary;
                        users[i].salary = parseFloat(users[i].salary) * 1.05;
                    }
                    updatedNumber++;
                    totalIncrease += users[i].salary - users[i].prevSalary;
                    users.age = parseInt(users[i].age);
                }
            }
        } catch (error) {
            console.log('Error in updating salaries: ', error);
            throw error;
        }

        await API.postData(users);
        console.log('Total number updated: ', updatedNumber);
        console.log('Total increase: ', totalIncrease);
    } catch (error) {
        console.log('Error in processUserData: ', error);
        throw error;
    }
}

processUserData();