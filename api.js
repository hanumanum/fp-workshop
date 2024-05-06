const usersData = [
    {
        id: 1,
        name: "Alice",
        age: 25,
        salary: 50000,
        prevSalary: 40000,
        isCGrade: true,
        currency: "USD",
        aboveAverage: null,
        friends: [{ id: 2 }, { id: 3 }],
        isActive: true
    },
    {
        id: 2,
        name: "Bob",
        age: 30,
        salary: 60000,
        prevSalary: 50000,
        currency: "AMD",
        aboveAverage: null,
        friends: [{ id: 1 }],
        isActive: true
    },
    {
        id: 3,
        name: "Charlie",
        age: '35',
        salary: '70000',
        prevSalary: '70000',
        currency: "USD",
        aboveAverage: null,
        friends: [{ id: 1 }],
        isActive: false
    }
]


const getRates = async () => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({ USD: 1, AMD: 500, GBH: 1.1 });
        }, 1000);
    });
}

const getUsers = async () => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(usersData);
        }, 1000);
    });
}

const postData = (data) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(data);
        }, 500);
    });
}

module.exports = {
    getRates,
    getUsers,
    postData
};