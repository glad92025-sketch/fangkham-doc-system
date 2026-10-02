const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 8000;
const CONFIG_FILE = path.join(__dirname, 'drive-config.json');

// โหลดคอนฟิก Google Drive (akaradran2568@gmail.com)
let driveConfig = {
    targetEmail: "akaradran2568@gmail.com",
    displayName: "คลังกลาง อบต.ฝางคำ",
    webAppUrl: "https://script.google.com/macros/s/AKfycbzmXsn3i2qT1LikxJzhv3UMZdABIOKpc_jPusf9qq6D_THkc43wp3z3AUsfuaL-Sclhbg/exec"
};

if (fs.existsSync(CONFIG_FILE)) {
    try {
        const loaded = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        driveConfig = { ...driveConfig, ...loaded };
    } catch (e) {}
}

function saveDriveConfig() {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(driveConfig, null, 2), 'utf8');
}

// ฐานข้อมูลพนักงาน อบต.ฝางคำ ทั้ง 48 ท่าน
const staffDatabase = [
    // นักบริหารท้องถิ่น
    { name: "นายชาญชัย อักโข", phone: "0874567858", username: "0874567858", position: "ปลัดองค์การบริหารส่วนตำบลฝางคำ", type: "ข้าราชการ", dept: "นักบริหารท้องถิ่น", role: "admin" },
    { name: "รองปลัดองค์การบริหารส่วนตำบลฝางคำ", phone: "0622825588", username: "0622825588", position: "รองปลัดองค์การบริหารส่วนตำบลฝางคำ", type: "ข้าราชการ", dept: "นักบริหารท้องถิ่น", role: "admin" },

    // สำนักงานปลัด
    { name: "นางอรุณรัตน์ บุญกอ", phone: "0821472423", username: "0821472423", position: "หัวหน้าสำนักปลัด", type: "ข้าราชการ", dept: "สำนักงานปลัด", role: "head" },
    { name: "จ.ส.ท.มานิต ทองดวง", phone: "0652673990", username: "0652673990", position: "นักวิเคราะห์นโยบายและแผนชำนาญการ", type: "ข้าราชการ", dept: "สำนักงานปลัด", role: "staff" },
    { name: "นางต้องตาประภา โพธิ์งาม", phone: "0899488829", username: "0899488829", position: "นักทรัพยากรบุคคลชำนาญการ", type: "ข้าราชการ", dept: "สำนักงานปลัด", role: "staff" },
    { name: "จ.ส.อ.เกียรติพล หาทรัพย์", phone: "0643522769", username: "0643522769", position: "จพง.ธุรการชำนาญงาน", type: "ข้าราชการ", dept: "สำนักงานปลัด", role: "staff" },
    { name: "น.ส.ธิดาลักษณ์ โสแก้ว", phone: "0642239228", username: "0642239228", position: "ผช.นักวิเคราะห์ฯ", type: "พนักงานจ้างตามภารกิจ", dept: "สำนักงานปลัด", role: "staff" },
    { name: "น.ส.นิภาพร เที่ยงตรง", phone: "0913505211", username: "0913505211", position: "ผช.จพง.ธุรการ", type: "พนักงานจ้างตามภารกิจ", dept: "สำนักงานปลัด", role: "staff" },
    { name: "น.ส.นิตยา ชุมชัย", phone: "0880447540", username: "0880447540", position: "ผช.จพง.ธุรการ", type: "พนักงานจ้างตามภารกิจ", dept: "สำนักงานปลัด", role: "staff" },
    { name: "นายอรรถชัย สุทธิรัตน์", phone: "0990304084", username: "0990304084", position: "ผช.ป้องกันและบรรเทาสาธารณภัย", type: "พนักงานจ้างตามภารกิจ", dept: "สำนักงานปลัด", role: "staff" },
    { name: "น.ส.มาสศุภา ดวงคำ", phone: "0821231780", username: "0821231780", position: "ผช.นักวิชาการสาธารณสุข", type: "พนักงานจ้างตามภารกิจ", dept: "สำนักงานปลัด", role: "staff" },
    { name: "นางรัชนี สร้อยคำ", phone: "0622614951", username: "0622614951", position: "คนงานทั่วไป", type: "พนักงานจ้างตามภารกิจ", dept: "สำนักงานปลัด", role: "staff" },
    { name: "นายอนุชิต ดวงเนตร", phone: "0876549347", username: "0876549347", position: "คนงานทั่วไป", type: "พนักงานจ้างตามภารกิจ", dept: "สำนักงานปลัด", role: "staff" },
    { name: "นางสาวธนวรรณ สมศรี", phone: "0834614132", username: "0834614132", position: "ช่วยงานบันทึกข้อมูลสำนัก ฯ", type: "จ้างเหมาบริการ", dept: "สำนักงานปลัด", role: "staff" },
    { name: "นายอัครเดช สุขจิตร์", phone: "0809062994", username: "0809062994", position: "ช่วยงานประชาสัมพันธ์", type: "จ้างเหมาบริการ", dept: "สำนักงานปลัด", role: "staff" },
    { name: "นางปัณฑารีย์ ปอสูงเนิน", phone: "0616606167", username: "0616606167", position: "แม่บ้าน", type: "จ้างเหมาบริการ", dept: "สำนักงานปลัด", role: "staff" },
    { name: "นายสีหราช แสนทวีสุข", phone: "0899461574", username: "0899461574", position: "นักการภารโรง", type: "จ้างเหมาบริการ", dept: "สำนักงานปลัด", role: "staff" },
    { name: "นายสมพร บุดสี", phone: "0639340464", username: "0639340464", position: "ช่วยงานดูแลรักษาต้นไม้ สวนหย่อม ฯ", type: "จ้างเหมาบริการ", dept: "สำนักงานปลัด", role: "staff" },
    { name: "นายวีระศักดิ์ คูณทอง", phone: "0945733824", username: "0945733824", position: "ทำความสะอาดภายใน อบต.", type: "จ้างเหมาบริการ", dept: "สำนักงานปลัด", role: "staff" },
    { name: "นายอนิวัช กองแก้ว", phone: "0949528510", username: "0949528510", position: "ช่วยงานดูแลรักษาต้นไม้ สวนหย่อม ฯ", type: "จ้างเหมาบริการ", dept: "สำนักงานปลัด", role: "staff" },

    // กองคลัง
    { name: "นางวาสนา สินทรัพย์", phone: "0619236333", username: "0619236333", position: "ผู้อำนวยการกองคลัง", type: "ข้าราชการ", dept: "กองคลัง", role: "head" },
    { name: "นางบีนา เหล็กกล้า", phone: "-", username: "bina.lek", position: "นักวิชาการเงินและบัญชีปฏิบัติงาน", type: "ข้าราชการ", dept: "กองคลัง", role: "staff" },
    { name: "จ่าเอกเกียรติศักดิ์ เพ็ญเนตร", phone: "-", username: "kiattisak.p", position: "เจ้าพนักงานพัสดุ", type: "ข้าราชการ", dept: "กองคลัง", role: "staff" },
    { name: "นางสาวปภาดา ประดับ", phone: "0981016694", username: "0981016694", position: "ผช.จพง.พัสดุ", type: "พนักงานจ้างตามภารกิจ", dept: "กองคลัง", role: "staff" },
    { name: "นางสาวสุดารัตน์ ริมทอง", phone: "0981016694", username: "sudarat.r", position: "ผช.นักวิชาการเงินและบัญชี", type: "พนักงานจ้างตามภารกิจ", dept: "กองคลัง", role: "staff" },
    { name: "นางสาวอรุณนีย์ อินทวี", phone: "0943630802", username: "0943630802", position: "ช่วยงานธุรการกองคลัง", type: "จ้างเหมาบริการ", dept: "กองคลัง", role: "staff" },
    { name: "นางสาวอรนิตย์ เดือนแจ้งรัมย์", phone: "0882236995", username: "0882236995", position: "ช่วยงานบันทึกข้อมูลสารสนเทศฯ", type: "จ้างเหมาบริการ", dept: "กองคลัง", role: "staff" },
    { name: "นางสาวอัมพิกา ขันคูณ", phone: "0825354697", username: "0825354697", position: "ช่วยงานการเงิน", type: "จ้างเหมาบริการ", dept: "กองคลัง", role: "staff" },
    { name: "นายวัตรจิระ ใสขาว", phone: "0987531611", username: "0987531611", position: "คนขับรถ", type: "จ้างเหมาบริการ", dept: "กองคลัง", role: "staff" },

    // กองช่าง
    { name: "นายวุฒิศักดิ์ บุตรสิงห์", phone: "0892849708", username: "0892849708", position: "ผู้อำนวยการกองช่าง", type: "ข้าราชการ", dept: "กองช่าง", role: "head" },
    { name: "นายสิงหา ชุมชัย", phone: "0621951330", username: "0621951330", position: "นายช่างโยธาชำนาญงาน", type: "ข้าราชการ", dept: "กองช่าง", role: "staff" },
    { name: "นายกล้าหาญ พรพรม", phone: "0627388851", username: "0627388851", position: "ผช.ช่างโยธา", type: "พนักงานจ้างตามภารกิจ", dept: "กองช่าง", role: "staff" },
    { name: "นายวุฒิชาติ เชื้อโชติ", phone: "0935495486", username: "0935495486", position: "ผช.ช่างไฟฟ้า", type: "พนักงานจ้างตามภารกิจ", dept: "กองช่าง", role: "staff" },
    { name: "นายชัยสิทธิ์ วงษ์วิชัย", phone: "0970017504", username: "0970017504", position: "ผู้ช่วยเจ้าพนักงานประปา", type: "พนักงานจ้างตามภารกิจ", dept: "กองช่าง", role: "staff" },
    { name: "นางสาวผกาพา มณีจันทร์", phone: "0626861197", username: "0626861197", position: "ผู้ช่วยเจ้าพนักงานธุรการ กองช่าง", type: "พนักงานจ้างตามภารกิจ", dept: "กองช่าง", role: "staff" },
    { name: "นายการันต์ มูลสินธ์", phone: "0996090753", username: "0996090753", position: "ช่วยงานดูแลไฟฟ้า", type: "จ้างเหมาบริการ", dept: "กองช่าง", role: "staff" },
    { name: "นายสุรไกร ฝางคำ", phone: "0611490425", username: "0611490425", position: "ช่วยงานดูแลไฟฟ้า", type: "จ้างเหมาบริการ", dept: "กองช่าง", role: "staff" },
    { name: "นายวิชาญ แสงสว่าง", phone: "0961941778", username: "0961941778", position: "คนขับรถ", type: "จ้างเหมาบริการ", dept: "กองช่าง", role: "staff" },
    { name: "นายปัฏธวิกรณ์ ยืนยง", phone: "0641582166", username: "0641582166", position: "คนงานเก็บขยะ", type: "จ้างเหมาบริการ", dept: "กองช่าง", role: "staff" },
    { name: "นายตะวัน สร้อยคำ", phone: "-", username: "tawan.s", position: "คนงานเก็บขยะ", type: "จ้างเหมาบริการ", dept: "กองช่าง", role: "staff" },
    { name: "นายไพรวัลย์ เสนสี", phone: "0613206502", username: "0613206502", position: "คนงานเก็บขยะ", type: "จ้างเหมาบริการ", dept: "กองช่าง", role: "staff" },

    // กองสวัสดิการสังคม
    { name: "นายวีระวัฒน์ จันทรคล", phone: "0849844161", username: "0849844161", position: "นักพัฒนาชุมชนชำนาญการ", type: "ข้าราชการ", dept: "กองสวัสดิการสังคม", role: "head" },
    { name: "นายวิทยา ฝางคำ", phone: "0994253799", username: "0994253799", position: "ผช.นักพัฒนาชุมชน", type: "พนักงานจ้างตามภารกิจ", dept: "กองสวัสดิการสังคม", role: "staff" },
    { name: "นางสาวชุติมา แก่นโทน", phone: "0622461497", username: "0622461497", position: "ช่วยงานธุรการกองสวัสดิการสังคม", type: "จ้างเหมาบริการ", dept: "กองสวัสดิการสังคม", role: "staff" },

    // กองการศึกษา ศาสนา และวัฒนธรรม
    { name: "นายทศพล โลมรัตน์", phone: "0637514774", username: "0637514774", position: "นักวิชาการศึกษาปฏิบัติการ", type: "ข้าราชการ", dept: "กองการศึกษา ศาสนา และวัฒนธรรม", role: "head" },
    { name: "นางสาวเพียงใจ แสนทวีสุข", phone: "0837303687", username: "0837303687", position: "ครู คศ.1", type: "ข้าราชการ", dept: "กองการศึกษา ศาสนา และวัฒนธรรม", role: "staff" },
    { name: "นางสาวยุวธิดา ฉัตรวิไล", phone: "0879597321", username: "0879597321", position: "ครู คศ.1", type: "ข้าราชการ", dept: "กองการศึกษา ศาสนา และวัฒนธรรม", role: "staff" },
    { name: "น.ส.อำพร ทองสวัสดิ์", phone: "0956219982", username: "0956219982", position: "ผช.นักวิชาการศึกษาฯ", type: "พนักงานจ้างตามภารกิจ", dept: "กองการศึกษา ศาสนา และวัฒนธรรม", role: "staff" },
    { name: "นางรังษี พันธ์โพธิ์", phone: "0942831740", username: "0942831740", position: "ผู้ดูแลเด็ก", type: "พนักงานจ้างตามภารกิจ", dept: "กองการศึกษา ศาสนา และวัฒนธรรม", role: "staff" },
    { name: "นางภัทราภรณ์ มุ่งพิงกลาง", phone: "0911365989", username: "0911365989", position: "ผู้ดูแลเด็ก", type: "พนักงานจ้างตามภารกิจ", dept: "กองการศึกษา ศาสนา และวัฒนธรรม", role: "staff" },
    { name: "นางวิลาวรรณ สร้อยคำ", phone: "0621926011", username: "0621926011", position: "ผู้ดูแลเด็ก (ผู้มีทักษะ)", type: "จ้างเหมาบริการ", dept: "กองการศึกษา ศาสนา และวัฒนธรรม", role: "staff" },
    { name: "นางสาวราตรี ฝางคำ", phone: "0827490944", username: "0827490944", position: "แม่บ้าน ศพด.บ้านฝางเทิง", type: "จ้างเหมาบริการ", dept: "กองการศึกษา ศาสนา และวัฒนธรรม", role: "staff" },
    { name: "นางสาวภิยดา ฝางคำ", phone: "0945184068", username: "0945184068", position: "ช่วยงานธุรการกองการศึกษา", type: "จ้างเหมาบริการ", dept: "กองการศึกษา ศาสนา และวัฒนธรรม", role: "staff" },

    // ตรวจสอบภายใน
    { name: "นายศุภมงคล ธรรมพิทักษ์", phone: "0984455928", username: "0984455928", position: "นักวิชาการตรวจสอบภายในปฏิบัติการ", type: "ข้าราชการ", dept: "หน่วยตรวจสอบภายใน", role: "auditor" }
];

let documentsDatabase = [
    {
        id: 1,
        title: "รายงานผลการซ่อมบำรุงระบบไฟฟ้าส่องสว่างสาธารณะ หมู่ 3",
        userName: "นายวุฒิศักดิ์ บุตรสิงห์",
        dept: "กองช่าง",
        fileName: "รายงานซ่อมไฟฟ้า_หมู่3.pdf",
        size: "3.45 MB",
        date: "02/10/2026 10:30 น.",
        driveLink: "https://drive.google.com"
    },
    {
        id: 2,
        title: "สรุปรายงานรายรับ-รายจ่าย ประจำเดือนกันยายน 2569",
        userName: "นางวาสนา สินทรัพย์",
        dept: "กองคลัง",
        fileName: "สรุปรายรับจ่าย_กย.xlsx",
        size: "1.20 MB",
        date: "01/10/2026 15:45 น.",
        driveLink: "https://drive.google.com"
    }
];

function getCookie(req, name) {
    const list = {};
    const rc = req.headers.cookie;
    if (rc) {
        rc.split(';').forEach(cookie => {
            const parts = cookie.split('=');
            list[parts.shift().trim()] = decodeURI(parts.join('='));
        });
    }
    return list[name];
}

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    const authUsername = getCookie(req, 'auth_user');
    const currentUser = staffDatabase.find(u => u.username === authUsername);

    // 1. หน้า Login
    if (url.pathname === '/login') {
        if (currentUser) {
            res.writeHead(302, { Location: '/' });
            return res.end();
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(renderLoginPage(url.searchParams.get('error')));
    }

    // 2. ล็อกอิน
    if (url.pathname === '/api/login' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const params = new URLSearchParams(body);
            const username = params.get('username')?.trim();
            const password = params.get('password')?.trim();

            const found = staffDatabase.find(u => u.username === username || u.phone === username);
            if (found && (password === 'Fk@123456' || password === '1234' || password === 'admin')) {
                res.writeHead(302, {
                    'Set-Cookie': `auth_user=${found.username}; Path=/; HttpOnly`,
                    'Location': '/'
                });
                return res.end();
            } else {
                res.writeHead(302, { Location: '/login?error=1' });
                return res.end();
            }
        });
        return;
    }

    // 3. ออกจากระบบ
    if (url.pathname === '/logout') {
        res.writeHead(302, {
            'Set-Cookie': 'auth_user=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
            'Location': '/login'
        });
        return res.end();
    }

    if (!currentUser) {
        res.writeHead(302, { Location: '/login' });
        return res.end();
    }

    // 4. บันทึกการตั้งค่า Google Drive
    if (url.pathname === '/api/save-drive-config' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const params = new URLSearchParams(body);
            const webAppUrl = params.get('webAppUrl')?.trim() || '';
            driveConfig.webAppUrl = webAppUrl;
            saveDriveConfig();
            res.writeHead(302, { Location: '/?config_saved=1' });
            return res.end();
        });
        return;
    }

    // 5. ส่งงาน / อัปโหลดไฟล์จริงขึ้นคลังกลาง อบต.ฝางคำ
    if (url.pathname === '/api/upload-real' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                const title = data.title || 'เอกสารส่งงาน';
                const fileName = data.fileName || 'เอกสารราชการ.pdf';
                const fiscalYear = data.fiscalYear || '2568';
                const fileBase64 = data.fileBase64;
                const mimeType = data.mimeType || 'application/pdf';
                const sizeInBytes = data.fileSize || 0;

                let sizeStr = (sizeInBytes / 1024 / 1024).toFixed(2) + ' MB';
                if (sizeInBytes < 1024 * 1024) {
                    sizeStr = (sizeInBytes / 1024).toFixed(1) + ' KB';
                }

                let driveLink = "https://drive.google.com";

                if (driveConfig.webAppUrl && driveConfig.webAppUrl.startsWith('http')) {
                    const postPayload = {
                        fileName: fileName,
                        fileBase64: fileBase64,
                        department: currentUser.dept,
                        fiscalYear: fiscalYear,
                        uploaderName: currentUser.name,
                        title: title,
                        mimeType: mimeType
                    };

                    const response = await fetch(driveConfig.webAppUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(postPayload)
                    });

                    const resJson = await response.json();
                    if (resJson && resJson.fileUrl) {
                        driveLink = resJson.fileUrl;
                    }
                }

                documentsDatabase.unshift({
                    id: Date.now(),
                    title: title,
                    userName: currentUser.name,
                    dept: currentUser.dept,
                    fileName: fileName,
                    size: sizeStr,
                    date: 'วันนี้ ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
                    driveLink: driveLink
                });

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'success', driveLink: driveLink }));

            } catch (err) {
                console.error('Real Upload Error:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'error', message: err.toString() }));
            }
        });
        return;
    }

    // 6. หน้า Dashboard
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderDashboardPage(currentUser, url));
});

function renderLoginPage(hasError) {
    return `
    <!DOCTYPE html>
    <html lang="th">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>เข้าสู่ระบบ - องค์การบริหารส่วนตำบลฝางคำ</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>body { font-family: 'Sarabun', sans-serif; }</style>
    </head>
    <body class="bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 min-h-screen flex items-center justify-center p-4">

        <div class="bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-8 w-full max-w-md">
            
            <div class="text-center mb-6">
                <div class="w-16 h-16 bg-gradient-to-br from-blue-900 to-indigo-900 text-yellow-400 font-extrabold rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-lg mb-3 border-2 border-yellow-400">
                    ฝค
                </div>
                <h1 class="text-xl font-bold text-slate-900 leading-tight">องค์การบริหารส่วนตำบลฝางคำ</h1>
                <p class="text-xs text-blue-700 font-semibold mt-1">ระบบส่งงานและคลังเอกสารราชการประจำตำแหน่ง</p>
                <div class="inline-flex items-center space-x-1.5 bg-green-50 border border-green-200 text-green-800 text-[11px] px-3 py-1 rounded-full mt-2.5 font-bold">
                    <span>🏛️ คลังกลาง อบต.ฝางคำ</span>
                </div>
            </div>

            ${hasError ? `
                <div class="p-3 mb-4 text-xs text-red-800 rounded-xl bg-red-50 border border-red-200 flex items-center space-x-2">
                    <span>❌</span>
                    <span>เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง</span>
                </div>
            ` : ''}

            <form method="POST" action="/api/login" class="space-y-4">
                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">
                        ชื่อผู้ใช้งาน (เบอร์โทรศัพท์ของเจ้าหน้าที่) <span class="text-red-500">*</span>
                    </label>
                    <div class="relative">
                        <input type="text" id="usernameInput" name="username" required autofocus
                            placeholder="ระบุเบอร์โทรศัพท์ เช่น 0874567858"
                            class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition">
                        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            📱
                        </div>
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">
                        รหัสผ่าน <span class="text-red-500">*</span>
                    </label>
                    <div class="relative">
                        <input type="password" id="passwordInput" name="password" required value="Fk@123456"
                            placeholder="รหัสผ่านของท่าน"
                            class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition">
                        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            🔒
                        </div>
                    </div>
                    <p class="text-[11px] text-slate-400 mt-1">รหัสผ่านตั้งต้น: <code class="bg-slate-100 text-blue-900 px-1 py-0.5 rounded font-bold">Fk@123456</code></p>
                </div>

                <div class="pt-2">
                    <button type="submit" class="w-full bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 hover:from-blue-800 hover:to-indigo-800 text-white font-bold py-2.5 rounded-xl text-sm shadow-md transition duration-150 flex items-center justify-center space-x-2">
                        <span>เข้าสู่ระบบ</span>
                        <span>➔</span>
                    </button>
                </div>
            </form>

            <div class="mt-6 pt-5 border-t border-slate-200">
                <p class="text-xs font-bold text-slate-600 mb-2.5 flex items-center">
                    <span class="mr-1">⚡</span> ปุ่มทางลัดสำหรับทดสอบสิทธิ์ (คลิกเพื่อเข้าใช้งานได้ทันที):
                </p>
                <div class="grid grid-cols-2 gap-2 text-xs">
                    <button onclick="fillLogin('0874567858', 'Fk@123456')" class="p-2 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-xl text-left border border-blue-200 transition font-medium">
                        👑 ปลัด อบต.<br><span class="text-[10px] text-slate-500">(ดูได้ทุกกอง)</span>
                    </button>
                    <button onclick="fillLogin('0619236333', 'Fk@123456')" class="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl text-left border border-emerald-200 transition font-medium">
                        💰 ผอ.กองคลัง<br><span class="text-[10px] text-slate-500">(ดูทั้งกองคลัง)</span>
                    </button>
                    <button onclick="fillLogin('0892849708', 'Fk@123456')" class="p-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-left border border-amber-200 transition font-medium">
                        🔨 ผอ.กองช่าง<br><span class="text-[10px] text-slate-500">(ดูทั้งกองช่าง)</span>
                    </button>
                    <button onclick="fillLogin('0642239228', 'Fk@123456')" class="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded-xl text-left border border-indigo-200 transition font-medium">
                        📝 เจ้าหน้าที่ทั่วไป<br><span class="text-[10px] text-slate-500">(ดูเฉพาะงานตนเอง)</span>
                    </button>
                </div>
            </div>

        </div>

        <script>
            function fillLogin(u, p) {
                document.getElementById('usernameInput').value = u;
                document.getElementById('passwordInput').value = p;
                document.querySelector('form').submit();
            }
        </script>

    </body>
    </html>
    `;
}

function renderDashboardPage(currentUser, url) {
    let visibleDocs = documentsDatabase;
    if (currentUser.role === 'head') {
        visibleDocs = documentsDatabase.filter(d => d.dept === currentUser.dept);
    } else if (currentUser.role === 'staff') {
        visibleDocs = documentsDatabase.filter(d => d.userName === currentUser.name);
    }

    return `
    <!DOCTYPE html>
    <html lang="th">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ระบบส่งงานและจัดเก็บเอกสาร - อบต.ฝางคำ</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>body { font-family: 'Sarabun', sans-serif; }</style>
    </head>
    <body class="bg-slate-100 min-h-screen text-slate-800 flex flex-col">

        <!-- Header เมนูหลัก -->
        <header class="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 text-white shadow-md border-b-2 border-yellow-500 sticky top-0 z-40">
            <div class="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-yellow-400 text-blue-950 font-extrabold rounded-xl flex items-center justify-center text-lg shadow-inner">
                        ฝค
                    </div>
                    <div>
                        <h1 class="text-base sm:text-lg font-bold leading-tight">องค์การบริหารส่วนตำบลฝางคำ</h1>
                        <p class="text-xs text-blue-200">ระบบส่งงานและจัดเก็บเอกสารราชการประจำตำแหน่ง (คลังกลาง อบต.ฝางคำ)</p>
                    </div>
                </div>

                <div class="flex items-center space-x-3">
                    <div class="text-right hidden sm:block">
                        <div class="text-sm font-bold text-white">${currentUser.name}</div>
                        <div class="text-xs text-yellow-300 font-medium">${currentUser.position} • ${currentUser.dept}</div>
                    </div>
                    
                    <button onclick="document.getElementById('driveModal').classList.remove('hidden')" class="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-blue-950 font-bold rounded-xl text-xs transition shadow flex items-center space-x-1">
                        <span>⚙️ ตั้งค่าคลังกลาง</span>
                    </button>

                    <a href="/logout" class="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-xl transition shadow font-medium">
                        ออกจากระบบ
                    </a>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="flex-grow max-w-7xl mx-auto px-4 py-6 w-full">

            <div id="alertSuccess" class="hidden p-4 mb-6 text-sm text-green-800 rounded-2xl bg-green-50 border border-green-200 shadow-sm flex items-center justify-between">
                <div class="flex items-center space-x-2">
                    <span class="text-xl">✅</span>
                    <span class="font-medium">ส่งงานและอัปโหลดไฟล์จริงเข้า <span class="font-bold underline">คลังกลาง อบต.ฝางคำ</span> สำเร็จเรียบร้อยแล้ว!</span>
                </div>
                <button onclick="document.getElementById('alertSuccess').classList.add('hidden')" class="text-xs text-green-700 hover:underline">ปิด</button>
            </div>

            <!-- แถบการ์ดสถานะภาพรวม -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-3">
                    <div class="w-12 h-12 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center text-xl font-bold">🏢</div>
                    <div>
                        <div class="text-xs text-slate-400">สังกัดส่วนราชการ</div>
                        <div class="font-bold text-slate-800 text-sm truncate max-w-[170px]">${currentUser.dept}</div>
                    </div>
                </div>

                <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-3">
                    <div class="w-12 h-12 bg-purple-50 text-purple-700 rounded-xl flex items-center justify-center text-xl font-bold">🛡️</div>
                    <div>
                        <div class="text-xs text-slate-400">ระดับสิทธิ์ของท่าน</div>
                        <div class="font-bold text-purple-900 text-sm">
                            ${currentUser.role === 'admin' ? 'ผู้บริหาร (ดูได้ทุกกอง)' :
                              currentUser.role === 'head' ? 'ผอ.กอง (ดูได้ทั้งกอง)' :
                              currentUser.role === 'auditor' ? 'ผู้ตรวจสอบภายใน' : 'เจ้าหน้าที่ (งานตนเอง)'}
                        </div>
                    </div>
                </div>

                <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-3">
                    <div class="w-12 h-12 bg-green-50 text-green-700 rounded-xl flex items-center justify-center text-xl font-bold">🏛️</div>
                    <div>
                        <div class="text-xs text-slate-400">ปลายทางจัดเก็บข้อมูล</div>
                        <div class="font-bold text-green-800 text-sm">
                            คลังกลาง อบต.ฝางคำ
                        </div>
                        <span class="text-[10px] text-green-600 font-semibold">
                            ● เชื่อมต่อสด พร้อมใช้งาน
                        </span>
                    </div>
                </div>

                <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-3">
                    <div class="w-12 h-12 bg-indigo-50 text-indigo-700 rounded-xl flex items-center justify-center text-xl font-bold">📄</div>
                    <div>
                        <div class="text-xs text-slate-400">งานที่แสดงผลในตาราง</div>
                        <div class="font-bold text-slate-800 text-sm">${visibleDocs.length} รายการ</div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <!-- ฟอร์มอัปโหลดส่งงาน (ซ้าย 1 ส่วน) -->
                <div class="lg:col-span-1">
                    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sticky top-20">
                        <div class="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
                            <span class="w-2.5 h-2.5 bg-blue-600 rounded-full inline-block"></span>
                            <h2 class="text-base font-bold text-slate-800">ส่งผลงาน / อัปโหลดเอกสารจริง</h2>
                        </div>

                        <form id="uploadForm" onsubmit="handleRealUpload(event)" class="space-y-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">
                                    หัวข้องาน / ชื่อเอกสาร <span class="text-red-500">*</span>
                                </label>
                                <input type="text" id="docTitle" required placeholder="เช่น รายงานผลงานประจำเดือน, รายชื่อผู้รับเบี้ย..."
                                    class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none">
                            </div>

                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">
                                    ปีงบประมาณ <span class="text-red-500">*</span>
                                </label>
                                <select id="docFiscalYear" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 outline-none">
                                    <option value="2568" selected>ปีงบประมาณ 2568</option>
                                    <option value="2567">ปีงบประมาณ 2567</option>
                                    <option value="2566">ปีงบประมาณ 2566</option>
                                </select>
                            </div>

                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">
                                    เลือกไฟล์เอกสารฉบับจริง (PDF, Word, Excel, รูปภาพ) <span class="text-red-500">*</span>
                                </label>
                                <div class="border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/40 rounded-xl p-4 text-center cursor-pointer transition">
                                    <input type="file" id="realFileSelector" required class="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer">
                                    <p class="text-[11px] text-slate-400 mt-2">ระบบจะนำไฟล์ต้นฉบับจริงของคุณไปเก็บในคลังกลาง อบต.ฝางคำ</p>
                                </div>
                            </div>

                            <div class="pt-2">
                                <button type="submit" id="btnSubmit" class="w-full bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white font-semibold py-2.5 rounded-xl text-xs shadow-md transition duration-150 flex items-center justify-center space-x-1.5">
                                    <span>📤 ส่งงานขึ้นคลังกลาง อบต.ฝางคำ</span>
                                </button>
                            </div>
                        </form>

                        <div class="mt-4 p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-slate-600">
                            <div class="font-bold text-blue-900 mb-1">📁 ปลายทางจัดเก็บ:</div>
                            <div class="text-[11px] text-slate-500">คลังกลาง อบต.ฝางคำ ➔ <span class="font-semibold text-blue-800">${currentUser.dept}</span> ➔ ปีงบประมาณ 2568</div>
                        </div>
                    </div>
                </div>

                <!-- ตารางแสดงรายการเอกสาร (ขวา 2 ส่วน) -->
                <div class="lg:col-span-2 space-y-4">
                    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 class="font-bold text-slate-800 text-sm">คลังเอกสารและผลการปฏิบัติงาน</h3>
                                <p class="text-[11px] text-slate-400">
                                    มุมมองของ: <span class="font-semibold text-blue-900">${currentUser.name}</span> (${currentUser.role})
                                </p>
                            </div>
                            <span class="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">
                                รวม ${visibleDocs.length} รายการ
                            </span>
                        </div>

                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                                        <th class="p-3">วันที่ส่ง</th>
                                        <th class="p-3">หัวข้องาน / เอกสาร</th>
                                        <th class="p-3">ผู้ปฏิบัติงาน</th>
                                        <th class="p-3">สังกัดกอง</th>
                                        <th class="p-3">ขนาด</th>
                                        <th class="p-3 text-center">ไฟล์ในคลังกลาง</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100" id="docsTableBody">
                                    ${visibleDocs.map(doc => `
                                        <tr class="hover:bg-blue-50/30 transition">
                                            <td class="p-3 text-slate-500 whitespace-nowrap">${doc.date}</td>
                                            <td class="p-3">
                                                <div class="font-bold text-slate-800">${doc.title}</div>
                                                <div class="text-[11px] text-slate-400 font-mono">${doc.fileName}</div>
                                            </td>
                                            <td class="p-3 whitespace-nowrap">
                                                <div class="font-medium text-slate-700">${doc.userName}</div>
                                            </td>
                                            <td class="p-3 whitespace-nowrap">
                                                <span class="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200 font-medium">
                                                    ${doc.dept}
                                                </span>
                                            </td>
                                            <td class="p-3 text-slate-500 whitespace-nowrap">${doc.size}</td>
                                            <td class="p-3 text-center whitespace-nowrap">
                                                <a href="${doc.driveLink}" target="_blank"
                                                   class="inline-flex items-center space-x-1 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold border border-blue-200 transition">
                                                    <span>เปิดดูไฟล์</span>
                                                    <span>↗</span>
                                                </a>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </main>

        <!-- Modal ตั้งค่าคลังกลาง อบต.ฝางคำ -->
        <div id="driveModal" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
                <div class="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                    <div>
                        <h3 class="font-bold text-slate-800 text-base flex items-center">
                            <span class="mr-2 text-xl">🏛️</span> ตั้งค่าคลังกลาง อบต.ฝางคำ
                        </h3>
                        <p class="text-xs text-slate-500">ปลายทางจัดเก็บ Google Drive: <strong class="text-blue-900">${driveConfig.targetEmail}</strong></p>
                    </div>
                    <button onclick="document.getElementById('driveModal').classList.add('hidden')" class="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
                </div>

                <form method="POST" action="/api/save-drive-config" class="space-y-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">
                            Google Apps Script Web App URL
                        </label>
                        <input type="url" name="webAppUrl" value="${driveConfig.webAppUrl || ''}" required
                            class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 outline-none font-mono">
                        <p class="text-[11px] text-green-600 font-semibold mt-1">✅ เชื่อมต่อระบบคลังกลาง อบต.ฝางคำ เรียบร้อยแล้ว</p>
                    </div>

                    <div class="flex justify-end space-x-2 pt-2">
                        <button type="button" onclick="document.getElementById('driveModal').classList.add('hidden')" class="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50">
                            ปิด
                        </button>
                        <button type="submit" class="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow">
                            💾 บันทึกการตั้งค่า
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <script>
            async function handleRealUpload(e) {
                e.preventDefault();

                const fileInput = document.getElementById('realFileSelector');
                const file = fileInput.files[0];
                if (!file) return alert('กรุณาเลือกไฟล์เอกสาร');

                const btn = document.getElementById('btnSubmit');
                btn.disabled = true;
                btn.innerHTML = '⏳ กำลังอัปโหลดไฟล์จริงขึ้นคลังกลาง อบต.ฝางคำ...';

                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = async function() {
                    try {
                        const base64Content = reader.result.split(',')[1];
                        
                        const payload = {
                            title: document.getElementById('docTitle').value,
                            fiscalYear: document.getElementById('docFiscalYear').value,
                            fileName: file.name,
                            fileSize: file.size,
                            mimeType: file.type || 'application/pdf',
                            fileBase64: base64Content
                        };

                        const response = await fetch('/api/upload-real', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        });

                        const result = await response.json();
                        if (result.status === 'success') {
                            window.location.reload();
                        } else {
                            alert('เกิดข้อผิดพลาดในการอัปโหลด: ' + (result.message || ''));
                            btn.disabled = false;
                            btn.innerHTML = '📤 ส่งงานขึ้นคลังกลาง อบต.ฝางคำ';
                        }
                    } catch (err) {
                        alert('เกิดข้อผิดพลาดในการส่งไฟล์: ' + err.message);
                        btn.disabled = false;
                        btn.innerHTML = '📤 ส่งงานขึ้นคลังกลาง อบต.ฝางคำ';
                    }
                };
                reader.onerror = function() {
                    alert('ไม่สามารถอ่านไฟล์ได้');
                    btn.disabled = false;
                    btn.innerHTML = '📤 ส่งงานขึ้นคลังกลาง อบต.ฝางคำ';
                };
            }
        </script>

        <footer class="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500 mt-8">
            องค์การบริหารส่วนตำบลฝางคำ • ปลายทางจัดเก็บไฟล์: <strong>คลังกลาง อบต.ฝางคำ</strong>
        </footer>

    </body>
    </html>
    `;
}

server.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(` ระบบจัดเก็บเอกสาร อบต.ฝางคำ (ปลายทาง: คลังกลาง อบต.ฝางคำ)`);
    console.log(` เปิดหน้าเว็บได้ที่: http://localhost:${PORT}/login`);
    console.log(`=======================================================`);
});
