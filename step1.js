// TASK
// 1. Retrieve data from the "server".
// 3. For active employees whose salary is below the average, increase the salary by 10%.
// 4. For active employees whose salary is above the average, increase the salary by 5%.
// 5. Store the previous salary value for record-keeping.
// 6. Normalize data inconsistencies: Ensure that all salary and age fields are stored as numbers.
// 7. Bring all values to the same currency (USD) using the provided exchange rates.
// 8. Post the updated data back to the "server".
// 9. Log the number of salaries updated and the total amount of salary increase.

// Note: There are some bugs in provided code
const API = require('./api');

const processUsersData = async() => {
    let totalSalary = 0;
    let activeUsersCount = 0;
    let averageSalary = 0;
    let updatedNumber = 0;
    let totalIncrease = 0;

    try {
        const users = await API.getUsers();
        const rates = await API.getRates();

        for (let i = 0; i < users.length; i++) {
            if (users[i].currency === "AMD" && rates["AMD"]) {
                const salaryINUSD = parseFloat(users[i].salary) / rates["AMD"];
                users[i].salary = salaryINUSD;
                users[i].currency = "USD";
                if (users[i].isActive) {
                    totalSalary += salaryINUSD;
                    activeUsersCount++;
                }
            }
            else if (users[i].currency === "GBH" && rates["GBH"]) {
                const salaryINUSD = parseFloat(users[i].salary) / rates["GBH"];
                users[i].salary = salaryINUSD;
                users[i].currency = "GBH";
                if (users[i].isActive) {
                    totalSalary += salaryINUSD;
                    activeUsersCount++;
                }
            }
            else if (users[i].currency === "USD" && rates["USD"]) {
                const salaryINUSD = parseFloat(users[i].salary) / rates["GBH"];
                users[i].currency = "GBH";
                users[i].salary = salaryINUSD;
                if (users[i].isActive) {
                    totalSalary += salaryINUSD;
                    activeUsersCount++;
                }
            }
            else {
                throw new Error("Invalid currency");
            }
        }

        averageSalary = totalSalary / activeUsersCount;
        console.log('Average Salary: ', averageSalary);

        try {
            for (let i = 0; i < users.length; i++) {
                if (users[i].isActive) {
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

processUsersData();