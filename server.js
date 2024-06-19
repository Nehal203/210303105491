import express from 'express';
import fetch from 'node-fetch';

const app = express();
const port = 9876;
const windowSize = 10;
const apiUrl = 'http://20.244.56.144/test';

let numbersStore = [];

const fetchNumbers = async (type) => {
    const url = `${apiUrl}/${type}`;
    try {
        const response = await fetch(url, { timeout: 500 });
        if (!response.ok) {
            throw new Error(`Failed to fetch ${type} numbers: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (!data || !data.numbers) {
            throw new Error(`Invalid response format for ${type} numbers: ${JSON.stringify(data)}`);
        }
        return data.numbers;
    } catch (error) {
        console.error(`Error fetching ${type} numbers:`, error);
        return [];
    }
};


const calculateAverage = (numbers) => {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return sum / numbers.length;
};

app.get('/', (req, res) => {
    res.send('Welcome to the Average Calculator Microservice!');
});

app.get('/numbers/:type', async (req, res) => {
    const { type } = req.params;
    const validTypes = ['primes', 'fibo', 'even', 'rand'];

    if (!validTypes.includes(type)) {
        return res.status(400).send({ error: 'Invalid number type' });
    }

    const newNumbers = await fetchNumbers(type);

    // Ensure uniqueness and avoid duplicates
    newNumbers.forEach(num => {
        if (!numbersStore.includes(num)) {
            if (numbersStore.length >= windowSize) {
                numbersStore.shift();
            }
            numbersStore.push(num);
        }
    });

    const windowPrevState = [...numbersStore];
    const windowCurrState = [...numbersStore];

    const avg = calculateAverage(windowCurrState);

    res.json({
        windowPrevState,
        windowCurrState,
        numbers: newNumbers,
        avg
    });
});

app.listen(port, () => {
    console.log(`Average Calculator microservice is running on http://localhost:${port}`);
});
