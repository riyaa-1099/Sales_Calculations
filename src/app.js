const fs = require('fs').promises;
const path = require('path');

const filePath = path.resolve(__dirname, './sales.txt');

const monthMap = {
    '01': 'January',
    '02': 'February',
    '03': 'March',
    '04': 'April',
    '05': 'May',
    '06': 'June',
    '07': 'July',
    '08': 'August',
    '09': 'September',
    '10': 'October',
    '11': 'November',
    '12': 'December'
};

const processSalesData = async () => {
    try {
        // Read file asynchronously
        const data = await fs.readFile(filePath, 'utf-8');

        // Process data
        const finalData = [];
        const lines = data.trim().split('\n');
        const headers = lines[0].split(',');

        for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(',');
            const rowData = {};
            headers.forEach((header, index) => {
                let value = row[index].trim();
                if (header.trim() === 'Unit Price' || header.trim() === 'Quantity' || header.trim() === 'Total Price') {
                    value = parseFloat(value)
                } 
                rowData[header.trim()] = value;
            });
            finalData.push(rowData);
        }

        return finalData;
    } catch (err) {
        console.error('Error processing file:', err);
        throw err;
    }
}

const main = async () => {
    try {
        const data = await processSalesData();

        // Total sales of store
        const totalPrice = calculateTotalSales(data);
        console.log('Total Sales:', totalPrice);

        // Total sales of store month wise
        const totalMonthlySale = monthWiseTotalSales(data);
        console.log('Monthly Sales:', totalMonthlySale);

        // Popular item of month
        const popularItems = popularItemOfMonth(data);
        console.log('Popular Items:', popularItems);

        // Most revenue generating item of each month
        const monthlyrevenueItem = revenueGeneratingItemOfMonth(data);
        console.log('Most Revenue Generating Items:', monthlyrevenueItem);

        // Details of popular item of each month
        const itemDetails = popularItemOfMonthDetails(data);
        console.log('Most Popular Item Details:', itemDetails);

    } catch (error) {
        console.error('Error in main function:', error);
    }
}

// Calculate total sales
function calculateTotalSales(data) {
    const totalSales = data.reduce((acc, curr) => acc + curr['Total Price'], 0);
    return totalSales;
}

// Calculate month wise sales
function monthWiseTotalSales(data) {
    const result = {};
    data.forEach(eachData => {
        // Extract year and month from Date
        const dateParts = eachData['Date'].split('-');
        const year = dateParts[0];
        const month = dateParts[1];

        if (!result[year]) {
            result[year] = {};
        }
        if (!result[year][monthMap[month]]) {
            result[year][monthMap[month]] = 0;
        }
        result[year][monthMap[month]] += eachData['Total Price'];
    });
 
    return result;
}

// Calculate most popular item of each month
function popularItemOfMonth(data) {
    const result = {};
    const popularItems = {};

    data.forEach(eachData => {
        // Extract year and month from Date
        const dateParts = eachData['Date'].split('-');
        const year = dateParts[0];
        const month = dateParts[1];
        const sku = eachData['SKU']

        if (!result[year]) {
            result[year] = {};
        }
        if (!result[year][monthMap[month]]) {
            result[year][monthMap[month]] = {};
        }
        if (!result[year][monthMap[month]][sku]) {
            result[year][monthMap[month]][sku] = 0;
        }
        result[year][monthMap[month]][sku] += eachData['Quantity'];
    });

    for (const year in result) {
        popularItems[year] = {};
        for (const month in result[year]) {
            let maxSku = null;
            let maxQuantity = 0;
            for (const sku in result[year][month]) {
                if (result[year][month][sku] > maxQuantity) {
                    maxSku = sku;
                    maxQuantity = result[year][month][sku];
                }
            }
            popularItems[year][month] = {
                sku: maxSku,
                quantity: maxQuantity
            };
        }
    }

    return popularItems;
}

// Calculate most revenue generating item of each month
function revenueGeneratingItemOfMonth(data) {
    const result = {};
    const popularItems = {};

    data.forEach(eachData => {
        // Extract year and month from Date
        const dateParts = eachData['Date'].split('-');
        const year = dateParts[0];
        const month = dateParts[1];
        const sku = eachData['SKU']

        if (!result[year]) {
            result[year] = {};
        }
        if (!result[year][monthMap[month]]) {
            result[year][monthMap[month]] = {};
        }
        if (!result[year][monthMap[month]][sku]) {
            result[year][monthMap[month]][sku] = 0;
        }
        result[year][monthMap[month]][sku] += eachData['Total Price'];
    });

    for (const year in result) {
        popularItems[year] = {};
        for (const month in result[year]) {
            let maxSku = null;
            let maxRevenue = 0;
            for (const sku in result[year][month]) {
                if (result[year][month][sku] > maxRevenue) {
                    maxSku = sku;
                    maxRevenue = result[year][month][sku];
                }
            }
            popularItems[year][month] = {
                sku: maxSku,
                revenue : maxRevenue
            };
        }
    }

    return popularItems;
}

// Calculate min max avg of most popular item of each month
function popularItemOfMonthDetails(data) {
    const result = {};
    const popularItems = {};

    data.forEach(eachData => {
        // Extract year and month from Date
        const dateParts = eachData['Date'].split('-');
        const year = dateParts[0];
        const month = dateParts[1];
        const sku = eachData['SKU']

        if (!result[year]) {
            result[year] = {};
        }
        if (!result[year][monthMap[month]]) {
            result[year][monthMap[month]] = {};
        }
        if (!result[year][monthMap[month]][sku]) {
            result[year][monthMap[month]][sku] = { min: 0, max: 0, total: 0, days: 0 };
        }

        const currentMin = result[year][monthMap[month]][sku].min;
        const currentMax = result[year][monthMap[month]][sku].max;

        result[year][monthMap[month]][sku].min = Math.min(currentMin, eachData['Quantity']);
        result[year][monthMap[month]][sku].max = Math.max(currentMax, eachData['Quantity']);
        result[year][monthMap[month]][sku].days += 1;
        result[year][monthMap[month]][sku].total += eachData['Quantity'];
    });

    for (const year in result) {
        popularItems[year] = {};
        for (const month in result[year]) {
            let maxSku = null;
            let maxQuantitySku = 0;
            for (const sku in result[year][month]) {
                const totalQuantity = result[year][month][sku].total;
                if (totalQuantity > maxQuantitySku) {
                    maxSku = sku;
                    maxQuantitySku = totalQuantity;
                }
            }

            const minQuantity = result[year][month][maxSku].min
            const maxQuantity = result[year][month][maxSku].max
            const daysInMonth = result[year][month][maxSku].days


            popularItems[year][month] = {
                sku: maxSku,
                average: (maxQuantitySku/daysInMonth).toFixed(2),
                minQuantity,
                maxQuantity,
            };
        }
    }

    return popularItems;
}

main();