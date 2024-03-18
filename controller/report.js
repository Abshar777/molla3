const path = require('path');
const fs = require('fs');
const { v4: uuid } = require('uuid')
const ejs = require('ejs');
const orderModal = require('../models/orders')
const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');




//report yearly
const report = async (req, res) => {
    try {
        if (req.params.id == 'weekly') {
            const currentDate = new Date();
            const currentWeekStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay());
            const currentWeekEnd = new Date(currentWeekStart);
            currentWeekEnd.setDate(currentWeekEnd.getDate() + 6);
            const report = await orderModal.find({ orderDate: { $gte: currentWeekStart, $lte: currentWeekEnd } });
            const grantTotal = await orderModal.aggregate([
                {
                    $match: {
                        orderDate: { $gte:  currentWeekStart, $lte:currentWeekEnd } 
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: "$orderAmount" } 
                    }
                }
            ]);
        
            res.render('admin/report', { grantTotal,report, data: 'weekly', gg: req.params.id });
            
        }
        else if (req.params.id == 'monthly') {
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth();
            const startDate = new Date(currentDate.getFullYear(), currentMonth);
            const endDate = new Date(currentDate.getFullYear(), currentMonth + 1, 0);
            const report = await orderModal.find({ orderDate: { $gte: startDate, $lte: endDate } })
            const grantTotal = await orderModal.aggregate([
                {
                    $match: {
                        orderDate: { $gte: startDate, $lte:endDate } 
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: "$orderAmount" } 
                    }
                }
            ]);
        
            res.render('admin/report', { grantTotal,report, data: 'monthly', gg: req.params.id })

        }
        else if (req.params.id == 'yearly') {
            const currentDate = new Date();
            const currentYearStart = new Date(currentDate.getFullYear(), 0, 1);
            const currentYearEnd = new Date(currentDate.getFullYear() + 1, 0, 0);
            const report = await orderModal.find({ orderDate: { $gte: currentYearStart, $lte: currentYearEnd } });
            const grantTotal = await orderModal.aggregate([
                {
                    $match: {
                        orderDate: { $gte: currentYearStart, $lte:currentYearEnd } 
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: "$orderAmount" } 
                    }
                }
            ]);
            res.render('admin/report', { grantTotal,report, data: 'yearly', gg: req.params.id });

        } else if (req.params.id = 'costum') {
            res.render('admin/report', { custom: true, gg: req.params.id, data: 'costum' });
        } else {
            res.redirect('/admin')
        }
    } catch (err) {
        console.log(err.message + '     report')
    }
}

//customreport
const customreport = async (req, res) => {
    try {
        const start = new Date(req.body.start);
        const end = new Date(req.body.end)
        const data = await orderModal.find({ orderDate: { $gte: start, $lte: end } })
        const grantTotal = await orderModal.aggregate([
            {
                $match: {
                    orderDate: { $gte: start, $lte: end } 
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$orderAmount" } 
                }
            }
        ]);
    
        res.send({ data,grantTotal })

    } catch (err) {
        console.log(err.message + '     customreport')
    }
}

//report for download
const reportG = async (data, end) => {
    if (data == 'weekly') {
        const currentDate = new Date();
        const currentWeekStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay());
        const currentWeekEnd = new Date(currentWeekStart);
        currentWeekEnd.setDate(currentWeekEnd.getDate() + 6);
        return await orderModal.find({ orderDate: { $gte: currentWeekStart, $lte: currentWeekEnd } });

    }
    else if (data == 'monthly') {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const startDate = new Date(currentDate.getFullYear(), currentMonth);
        const endDate = new Date(currentDate.getFullYear(), currentMonth + 1, 0);
        return await orderModal.find({ orderDate: { $gte: startDate, $lte: endDate } })


    }
    else if (data == 'yearly') {
        const currentDate = new Date();
        const currentYearStart = new Date(currentDate.getFullYear(), 0, 1);
        const currentYearEnd = new Date(currentDate.getFullYear() + 1, 0, 0);
        return await orderModal.find({ orderDate: { $gte: currentYearStart, $lte: currentYearEnd } });


    } else {
        const start = new Date(data);
        const end1 = new Date(end);
        return await orderModal.find({ orderDate: { $gte: start, $lte: end1 } })
    }
}

//report download
const reportdownload = async (req, res) => {
    try {

        if (req.body.report == 'exec') {
            console.log(req.query.start, req.query.end)
            if (req.query.start && req.query.end) {
                var data = await reportG(req.query.start, req.query.end);
            } else if (req.params.id) {

                var data = await reportG(req.params.id);
            }


            // Create a new Excel workbook
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Data');

            // Add headers to the worksheet
            const headers = Object.keys(data[0].toObject());
            worksheet.addRow(headers);

            // Add data rows to the worksheet
            data.forEach(item => {
                const row = [];
                headers.forEach(header => {
                    row.push(item[header]);
                });
                worksheet.addRow(row);
            });

            // Generate a buffer containing the Excel file
            const buffer = await workbook.xlsx.writeBuffer();

            // Set the response headers for downloading the Excel file
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=data.xlsx');
            res.send(buffer);
        } else {
            if (req.query.start && req.query.end) {

                var report = await reportG(req.query.start, req.query.end);
            } else if (req.params.id) {

                var report = await reportG(req.params.id);
            }
            const ejspagepath = path.resolve(__dirname, '../views/admin/report.ejs');
            const data = {
                report: report,
                gg: req.params.id
            };
            const ejsPage = await ejs.renderFile(ejspagepath, data);

            // Optimize Puppeteer launch options for better performance
            const browser = await puppeteer.launch({
                headless: true, // Set to true to run in headless mode
                args: ['--no-sandbox', '--disable-setuid-sandbox'], // Add additional args for improved performance and security
                defaultViewport: null, // Set to null for faster page loading
                ignoreHTTPSErrors: true // Ignore HTTPS errors to avoid potential slowdowns
            });

            const page = await browser.newPage();
            await page.setContent(ejsPage);

            const uuidb = uuid();
            const pdfPath = path.join(__dirname, '../public/files', `${uuidb}.pdf`);

            await page.pdf({
                path: pdfPath,
                printBackground: true,
                format: 'A4'
            });

            await browser.close();

            res.download(pdfPath, `${uuidb}.pdf`, (err) => {
                if (err) {
                    console.error(err.message + '      reportdownload route');
                } else {
                    fs.unlinkSync(pdfPath);
                }
            });
        }

    } catch (err) {
        console.log(err.message + '      reportdownload route');
    }
};

module.exports={
    report,
    reportdownload,
    customreport,
  
}
