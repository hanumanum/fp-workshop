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
// 2. Introduce function to calculate salary in USD: calculate()(user) => {... user, salaryInUSD, prevSalaryInUSD } //to show function returning function 
// 3. filter users by isActive: filter (with function filterer: actives: bool)
// 4. calculate average salary: reduce (with reducer function) reducer(field)(acc, user) => acc + user[field]
// 5. 



async function processUserData() {
    let totalSalary = 0;
    let averageSalary = 0;
    let updatedNumber = 0;
    let totalIncrease = 0;

    try {
        const users = await API.getUsers();
        const rates = await API.getRates();

        for (let i = 0; i < users.length; i++) {
            if (users[i].isActive) {
                if (users[i].currency === "AMD" && rates["AMD"]) {
                    totalSalary += parseFloat(users[i].salary) / rates["AMD"];
                }
                else if (users[i].currency === "GBH" && rates["GBH"]) {
                    totalSalary += parseFloat(users[i].salary) / rates["GBH"];
                }
                else if (users[i].currency === "USD" && rates["USD"]) {
                    totalSalary += parseFloat(users[i].salary);
                }
                else {
                    throw new Error("Invalid currency");
                }
            }
        }

        averageSalary = totalSalary / users.length;
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