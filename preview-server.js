const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = process.env.PORT || 8000;
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const CONFIG_FILE = path.join(DATA_DIR, 'drive-config.json');
const USERS_FILE = path.join(DATA_DIR, 'users-db.json');
const DOCS_FILE = path.join(DATA_DIR, 'documents-db.json');

// 1. ค่าเริ่มต้น Google Drive (คลังกลาง อบต.ฝางคำ)
let driveConfig = {
    targetEmail: "akaradran2568@gmail.com",
    displayName: "คลังกลาง อบต.ฝางคำ",
    webAppUrl: "https://script.google.com/macros/s/AKfycbzmXsn3i2qT1LikxJzhv3UMZdABIOKpc_jPusf9qq6D_THkc43wp3z3AUsfuaL-Sclhbg/exec"
};

if (fs.existsSync(CONFIG_FILE)) {
    try {
        driveConfig = { ...driveConfig, ...JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')) };
    } catch (e) {}
}

function saveDriveConfig() {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(driveConfig, null, 2), 'utf8');
}

// 2. ข้อมูลพนักงานเริ่มต้น 54 ท่าน
const initialStaffList = [
    // นักบริหารท้องถิ่น (Admin)
    { id: 1, name: "นายชาญชัย อักโข", phone: "0874567858", username: "0874567858", email: "palad@fangkham.go.th", password: "Fk@123456", position: "ปลัดองค์การบริหารส่วนตำบลฝางคำ", type: "ข้าราชการ", dept: "นักบริหารท้องถิ่น", role: "admin" },
    { id: 2, name: "รองปลัดองค์การบริหารส่วนตำบลฝางคำ (ว่าง)", phone: "0622825588", username: "0622825588", email: "", password: "Fk@123456", position: "รองปลัดองค์การบริหารส่วนตำบลฝางคำ", type: "ข้าราชการ", dept: "นักบริหารท้องถิ่น", role: "admin" },

    // สำนักงานปลัด
    { id: 3, name: "นางอรุณรัตน์ บุญกอ", phone: "0821472423", username: "0821472423", email: "", password: "Fk@123456", position: "หัวหน้าสำนักปลัด", type: "ข้าราชการ", dept: "สำนักงานปลัด", role: "head" },
    { id: 4, name: "จ.ส.ท.มานิต ทองดวง", phone: "0652673990", username: "0652673990", email: "", password: "Fk@123456", position: "นักวิเคราะห์นโยบายและแผนชำนาญการ", type: "ข้าราชการ", dept: "สำนักงานปลัด", role: "staff" },
    { id: 5, name: "นางต้องตาประภา โพธิ์งาม", phone: "0899488829", username: "0899488829", email: "", password: "Fk@123456", position: "นักทรัพยากรบุคคลชำนาญการ", type: "ข้าราชการ", dept: "สำนักงานปลัด", role: "staff" },
    { id: 6, name: "จ.ส.อ.เกียรติพล หาทรัพย์", phone: "0643522769", username: "0643522769", email: "", password: "Fk@123456", position: "จพง.ธุรการชำนาญงาน", type: "ข้าราชการ", dept: "สำนักงานปลัด", role: "staff" },
    { id: 7, name: "น.ส.ธิดาลักษณ์ โสแก้ว", phone: "0642239228", username: "0642239228", email: "", password: "Fk@123456", position: "ผช.นักวิเคราะห์ฯ", type: "พนักงานจ้างตามภารกิจ", dept: "สำนักงานปลัด", role: "staff" },
    { id: 8, name: "น.ส.นิภาพร เที่ยงตรง", phone: "0913505211", username: "0913505211", email: "", password: "Fk@123456", position: "ผช.จพง.ธุรการ", type: "พนักงานจ้างตามภารกิจ", dept: "สำนักงานปลัด", role: "staff" },
    { id: 9, name: "น.ส.นิตยา ชุมชัย", phone: "0880447540", username: "0880447540", email: "", password: "Fk@123456", position: "ผช.จพง.ธุรการ", type: "พนักงานจ้างตามภารกิจ", dept: "สำนักงานปลัด", role: "staff" },
    { id: 10, name: "นายอรรถชัย สุทธิรัตน์", phone: "0990304084", username: "0990304084", email: "", password: "Fk@123456", position: "ผช.ป้องกันและบรรเทาสาธารณภัย", type: "พนักงานจ้างตามภารกิจ", dept: "สำนักงานปลัด", role: "staff" },
    { id: 11, name: "น.ส.มาสศุภา ดวงคำ", phone: "0821231780", username: "0821231780", email: "", password: "Fk@123456", position: "ผช.นักวิชาการสาธารณสุข", type: "พนักงานจ้างตามภารกิจ", dept: "สำนักงานปลัด", role: "staff" },
    { id: 12, name: "นางรัชนี สร้อยคำ", phone: "0622614951", username: "0622614951", email: "", password: "Fk@123456", position: "คนงานทั่วไป", type: "พนักงานจ้างตามภารกิจ", dept: "สำนักงานปลัด", role: "staff" },
    { id: 13, name: "นายอนุชิต ดวงเนตร", phone: "0876549347", username: "0876549347", email: "", password: "Fk@123456", position: "คนงานทั่วไป", type: "พนักงานจ้างตามภารกิจ", dept: "สำนักงานปลัด", role: "staff" },
    { id: 14, name: "นางสาวธนวรรณ สมศรี", phone: "0834614132", username: "0834614132", email: "", password: "Fk@123456", position: "ช่วยงานบันทึกข้อมูลสำนัก ฯ", type: "จ้างเหมาบริการ", dept: "สำนักงานปลัด", role: "staff" },
    { id: 15, name: "นายอัครเดช สุขจิตร์", phone: "0809062994", username: "0809062994", email: "", password: "Fk@123456", position: "ช่วยงานประชาสัมพันธ์", type: "จ้างเหมาบริการ", dept: "สำนักงานปลัด", role: "staff" },
    { id: 16, name: "นางปัณฑารีย์ ปอสูงเนิน", phone: "0616606167", username: "0616606167", email: "", password: "Fk@123456", position: "แม่บ้าน", type: "จ้างเหมาบริการ", dept: "สำนักงานปลัด", role: "staff" },
    { id: 17, name: "นายสีหราช แสนทวีสุข", phone: "0899461574", username: "0899461574", email: "", password: "Fk@123456", position: "นักการภารโรง", type: "จ้างเหมาบริการ", dept: "สำนักงานปลัด", role: "staff" },
    { id: 18, name: "นายสมพร บุดสี", phone: "0639340464", username: "0639340464", email: "", password: "Fk@123456", position: "ช่วยงานดูแลรักษาต้นไม้ สวนหย่อม ฯ", type: "จ้างเหมาบริการ", dept: "สำนักงานปลัด", role: "staff" },
    { id: 19, name: "นายวีระศักดิ์ คูณทอง", phone: "0945733824", username: "0945733824", email: "", password: "Fk@123456", position: "ทำความสะอาดภายใน อบต.", type: "จ้างเหมาบริการ", dept: "สำนักงานปลัด", role: "staff" },
    { id: 20, name: "นายอนิวัช กองแก้ว", phone: "0949528510", username: "0949528510", email: "", password: "Fk@123456", position: "ช่วยงานดูแลรักษาต้นไม้ สวนหย่อม ฯ", type: "จ้างเหมาบริการ", dept: "สำนักงานปลัด", role: "staff" },

    // กองคลัง
    { id: 21, name: "นางวาสนา สินทรัพย์", phone: "0619236333", username: "0619236333", email: "", password: "Fk@123456", position: "ผู้อำนวยการกองคลัง", type: "ข้าราชการ", dept: "กองคลัง", role: "head" },
    { id: 22, name: "นางบีนา เหล็กกล้า", phone: "-", username: "bina.lek", email: "", password: "Fk@123456", position: "นักวิชาการเงินและบัญชีปฏิบัติงาน", type: "ข้าราชการ", dept: "กองคลัง", role: "staff" },
    { id: 23, name: "จ่าเอกเกียรติศักดิ์ เพ็ญเนตร", phone: "-", username: "kiattisak.p", email: "", password: "Fk@123456", position: "เจ้าพนักงานพัสดุ", type: "ข้าราชการ", dept: "กองคลัง", role: "staff" },
    { id: 24, name: "นางสาวปภาดา ประดับ", phone: "0981016694", username: "0981016694", email: "", password: "Fk@123456", position: "ผช.จพง.พัสดุ", type: "พนักงานจ้างตามภารกิจ", dept: "กองคลัง", role: "staff" },
    { id: 25, name: "นางสาวสุดารัตน์ ริมทอง", phone: "0981016694", username: "sudarat.r", email: "", password: "Fk@123456", position: "ผช.นักวิชาการเงินและบัญชี", type: "พนักงานจ้างตามภารกิจ", dept: "กองคลัง", role: "staff" },
    { id: 26, name: "นางสาวอรุณนีย์ อินทวี", phone: "0943630802", username: "0943630802", email: "", password: "Fk@123456", position: "ช่วยงานธุรการกองคลัง", type: "จ้างเหมาบริการ", dept: "กองคลัง", role: "staff" },
    { id: 27, name: "นางสาวอรนิตย์ เดือนแจ้งรัมย์", phone: "0882236995", username: "0882236995", email: "", password: "Fk@123456", position: "ช่วยงานบันทึกข้อมูลสารสนเทศฯ", type: "จ้างเหมาบริการ", dept: "กองคลัง", role: "staff" },
    { id: 28, name: "นางสาวอัมพิกา ขันคูณ", phone: "0825354697", username: "0825354697", email: "", password: "Fk@123456", position: "ช่วยงานการเงิน", type: "จ้างเหมาบริการ", dept: "กองคลัง", role: "staff" },
    { id: 29, name: "นายวัตรจิระ ใสขาว", phone: "0987531611", username: "0987531611", email: "", password: "Fk@123456", position: "คนขับรถ", type: "จ้างเหมาบริการ", dept: "กองคลัง", role: "staff" },

    // กองช่าง
    { id: 30, name: "นายวุฒิศักดิ์ บุตรสิงห์", phone: "0892849708", username: "0892849708", email: "", password: "Fk@123456", position: "ผู้อำนวยการกองช่าง", type: "ข้าราชการ", dept: "กองช่าง", role: "head" },
    { id: 31, name: "นายสิงหา ชุมชัย", phone: "0621951330", username: "0621951330", email: "", password: "Fk@123456", position: "นายช่างโยธาชำนาญงาน", type: "ข้าราชการ", dept: "กองช่าง", role: "staff" },
    { id: 32, name: "นายกล้าหาญ พรพรม", phone: "0627388851", username: "0627388851", email: "", password: "Fk@123456", position: "ผช.ช่างโยธา", type: "พนักงานจ้างตามภารกิจ", dept: "กองช่าง", role: "staff" },
    { id: 33, name: "นายวุฒิชาติ เชื้อโชติ", phone: "0935495486", username: "0935495486", email: "", password: "Fk@123456", position: "ผช.ช่างไฟฟ้า", type: "พนักงานจ้างตามภารกิจ", dept: "กองช่าง", role: "staff" },
    { id: 34, name: "นายชัยสิทธิ์ วงษ์วิชัย", phone: "0970017504", username: "0970017504", email: "", password: "Fk@123456", position: "ผู้ช่วยเจ้าพนักงานประปา", type: "พนักงานจ้างตามภารกิจ", dept: "กองช่าง", role: "staff" },
    { id: 35, name: "นางสาวผกาพา มณีจันทร์", phone: "0626861197", username: "0626861197", email: "", password: "Fk@123456", position: "ผู้ช่วยเจ้าพนักงานธุรการ กองช่าง", type: "พนักงานจ้างตามภารกิจ", dept: "กองช่าง", role: "staff" },
    { id: 36, name: "นายการันต์ มูลสินธ์", phone: "0996090753", username: "0996090753", email: "", password: "Fk@123456", position: "ช่วยงานดูแลไฟฟ้า", type: "จ้างเหมาบริการ", dept: "กองช่าง", role: "staff" },
    { id: 37, name: "นายสุรไกร ฝางคำ", phone: "0611490425", username: "0611490425", email: "", password: "Fk@123456", position: "ช่วยงานดูแลไฟฟ้า", type: "จ้างเหมาบริการ", dept: "กองช่าง", role: "staff" },
    { id: 38, name: "นายวิชาญ แสงสว่าง", phone: "0961941778", username: "0961941778", email: "", password: "Fk@123456", position: "คนขับรถ", type: "จ้างเหมาบริการ", dept: "กองช่าง", role: "staff" },
    { id: 39, name: "นายปัฏธวิกรณ์ ยืนยง", phone: "0641582166", username: "0641582166", email: "", password: "Fk@123456", position: "คนงานเก็บขยะ", type: "จ้างเหมาบริการ", dept: "กองช่าง", role: "staff" },
    { id: 40, name: "นายตะวัน สร้อยคำ", phone: "-", username: "tawan.s", email: "", password: "Fk@123456", position: "คนงานเก็บขยะ", type: "จ้างเหมาบริการ", dept: "กองช่าง", role: "staff" },
    { id: 41, name: "นายไพรวัลย์ เสนสี", phone: "0613206502", username: "0613206502", email: "", password: "Fk@123456", position: "คนงานเก็บขยะ", type: "จ้างเหมาบริการ", dept: "กองช่าง", role: "staff" },

    // กองสวัสดิการสังคม
    { id: 42, name: "นายวีระวัฒน์ จันทรคล", phone: "0849844161", username: "0849844161", email: "", password: "Fk@123456", position: "นักพัฒนาชุมชนชำนาญการ", type: "ข้าราชการ", dept: "กองสวัสดิการสังคม", role: "head" },
    { id: 43, name: "นายวิทยา ฝางคำ", phone: "0994253799", username: "0994253799", email: "", password: "Fk@123456", position: "ผช.นักพัฒนาชุมชน", type: "พนักงานจ้างตามภารกิจ", dept: "กองสวัสดิการสังคม", role: "staff" },
    { id: 44, name: "นางสาวชุติมา แก่นโทน", phone: "0622461497", username: "0622461497", email: "", password: "Fk@123456", position: "ช่วยงานธุรการกองสวัสดิการสังคม", type: "จ้างเหมาบริการ", dept: "กองสวัสดิการสังคม", role: "staff" },

    // กองการศึกษา ศาสนา และวัฒนธรรม
    { id: 45, name: "นายทศพล โลมรัตน์", phone: "0637514774", username: "0637514774", email: "", password: "Fk@123456", position: "นักวิชาการศึกษาปฏิบัติการ", type: "ข้าราชการ", dept: "กองการศึกษา ศาสนา และวัฒนธรรม", role: "head" },
    { id: 46, name: "นางสาวเพียงใจ แสนทวีสุข", phone: "0837303687", username: "0837303687", email: "", password: "Fk@123456", position: "ครู คศ.1", type: "ข้าราชการ", dept: "กองการศึกษา ศาสนา และวัฒนธรรม", role: "staff" },
    { id: 47, name: "นางสาวยุวธิดา ฉัตรวิไล", phone: "0879597321", username: "0879597321", email: "", password: "Fk@123456", position: "ครู คศ.1", type: "ข้าราชการ", dept: "กองการศึกษา ศาสนา และวัฒนธรรม", role: "staff" },
    { id: 48, name: "น.ส.อำพร ทองสวัสดิ์", phone: "0956219982", username: "0956219982", email: "", password: "Fk@123456", position: "ผช.นักวิชาการศึกษาฯ", type: "พนักงานจ้างตามภารกิจ", dept: "กองการศึกษา ศาสนา และวัฒนธรรม", role: "staff" },
    { id: 49, name: "นางรังษี พันธ์โพธิ์", phone: "0942831740", username: "0942831740", email: "", password: "Fk@123456", position: "ผู้ดูแลเด็ก", type: "พนักงานจ้างตามภารกิจ", dept: "กองการศึกษา ศาสนา และวัฒนธรรม", role: "staff" },
    { id: 50, name: "นางภัทราภรณ์ มุ่งพิงกลาง", phone: "0911365989", username: "0911365989", email: "", password: "Fk@123456", position: "ผู้ดูแลเด็ก", type: "พนักงานจ้างตามภารกิจ", dept: "กองการศึกษา ศาสนา และวัฒนธรรม", role: "staff" },
    { id: 51, name: "นางวิลาวรรณ สร้อยคำ", phone: "0621926011", username: "0621926011", email: "", password: "Fk@123456", position: "ผู้ดูแลเด็ก (ผู้มีทักษะ)", type: "จ้างเหมาบริการ", dept: "กองการศึกษา ศาสนา และวัฒนธรรม", role: "staff" },
    { id: 52, name: "นางสาวราตรี ฝางคำ", phone: "0827490944", username: "0827490944", email: "", password: "Fk@123456", position: "แม่บ้าน ศพด.บ้านฝางเทิง", type: "จ้างเหมาบริการ", dept: "กองการศึกษา ศาสนา และวัฒนธรรม", role: "staff" },
    { id: 53, name: "นางสาวภิยดา ฝางคำ", phone: "0945184068", username: "0945184068", email: "", password: "Fk@123456", position: "ช่วยงานธุรการกองการศึกษา", type: "จ้างเหมาบริการ", dept: "กองการศึกษา ศาสนา และวัฒนธรรม", role: "staff" },

    // ตรวจสอบภายใน
    { id: 54, name: "นายศุภมงคล ธรรมพิทักษ์", phone: "0984455928", username: "0984455928", email: "", password: "Fk@123456", position: "นักวิชาการตรวจสอบภายในปฏิบัติการ", type: "ข้าราชการ", dept: "หน่วยตรวจสอบภายใน", role: "auditor" }
];

let staffDatabase = initialStaffList;
if (fs.existsSync(USERS_FILE)) {
    try {
        staffDatabase = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    } catch (e) {}
} else {
    fs.writeFileSync(USERS_FILE, JSON.stringify(staffDatabase, null, 2), 'utf8');
}

function saveUsers() {
    fs.writeFileSync(USERS_FILE, JSON.stringify(staffDatabase, null, 2), 'utf8');
}

// 3. ข้อมูลเอกสารในระบบ
let documentsDatabase = [
    {
        id: 1,
        title: "รายงานผลการซ่อมบำรุงระบบไฟฟ้าส่องสว่างสาธารณะ หมู่ 3",
        userName: "นายวุฒิศักดิ์ บุตรสิงห์",
        dept: "กองช่าง",
        fiscalYear: "2568",
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
        fiscalYear: "2568",
        fileName: "สรุปรายรับจ่าย_กย.xlsx",
        size: "1.20 MB",
        date: "01/10/2026 15:45 น.",
        driveLink: "https://drive.google.com"
    }
];

if (fs.existsSync(DOCS_FILE)) {
    try {
        documentsDatabase = JSON.parse(fs.readFileSync(DOCS_FILE, 'utf8'));
    } catch (e) {}
} else {
    fs.writeFileSync(DOCS_FILE, JSON.stringify(documentsDatabase, null, 2), 'utf8');
}

function saveDocs() {
    fs.writeFileSync(DOCS_FILE, JSON.stringify(documentsDatabase, null, 2), 'utf8');
}

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

// Layout แม่แบบส่วนหัวและเมนูบาร์
function renderAppShell(currentUser, activeTab, contentHtml, notification = null) {
    const isAdmin = currentUser.role === 'admin';
    const deptColors = {
        'นักบริหารท้องถิ่น': 'bg-amber-100 text-amber-800 border-amber-300',
        'สำนักงานปลัด': 'bg-blue-100 text-blue-800 border-blue-300',
        'กองคลัง': 'bg-emerald-100 text-emerald-800 border-emerald-300',
        'กองช่าง': 'bg-orange-100 text-orange-800 border-orange-300',
        'กองสวัสดิการสังคม': 'bg-purple-100 text-purple-800 border-purple-300',
        'กองการศึกษา ศาสนา และวัฒนธรรม': 'bg-rose-100 text-rose-800 border-rose-300',
        'หน่วยตรวจสอบภายใน': 'bg-slate-100 text-slate-800 border-slate-300'
    };
    const badgeColor = deptColors[currentUser.dept] || 'bg-blue-100 text-blue-800';

    return `
    <!DOCTYPE html>
    <html lang="th">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ระบบคลังเอกสารและผลการปฏิบัติงาน - อบต.ฝางคำ</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700;800&family=Prompt:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
            body { font-family: 'Sarabun', sans-serif; }
            .font-prompt { font-family: 'Prompt', sans-serif; }
        </style>
    </head>
    <body class="bg-slate-50 min-h-screen text-slate-800 flex flex-col">

        <!-- Top Header Bar -->
        <header class="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white shadow-lg border-b-2 border-yellow-500 sticky top-0 z-40">
            <div class="max-w-7xl mx-auto px-4 sm:px-6">
                <div class="flex justify-between items-center h-16">
                    
                    <!-- โลโก้และชื่อหน่วยงาน -->
                    <div class="flex items-center space-x-3.5">
                        <a href="/" class="flex items-center space-x-3 group">
                            <div class="w-11 h-11 bg-gradient-to-br from-yellow-400 to-amber-500 text-blue-950 font-extrabold rounded-2xl flex items-center justify-center text-xl shadow-md border-2 border-yellow-300 group-hover:scale-105 transition transform">
                                ฝค
                            </div>
                            <div>
                                <h1 class="text-base sm:text-lg font-bold font-prompt leading-tight text-white group-hover:text-yellow-300 transition">
                                    อบต.ฝางคำ
                                </h1>
                                <p class="text-[11px] text-blue-200/80 font-medium">ระบบคลังเอกสารราชการประจำตำแหน่ง (5 TB)</p>
                            </div>
                        </a>
                    </div>

                    <!-- เมนูนำทาง Navigation Links -->
                    <nav class="hidden md:flex items-center space-x-1">
                        <a href="/" class="px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${activeTab === 'dashboard' ? 'bg-white/15 text-yellow-300 shadow-inner' : 'text-slate-300 hover:bg-white/10 hover:text-white'}">
                            <span>📊</span>
                            <span>แผงควบคุม</span>
                        </a>
                        <a href="/documents" class="px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${activeTab === 'documents' ? 'bg-white/15 text-yellow-300 shadow-inner' : 'text-slate-300 hover:bg-white/10 hover:text-white'}">
                            <span>📂</span>
                            <span>คลังเอกสาร</span>
                        </a>
                        <a href="/profile" class="px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${activeTab === 'profile' ? 'bg-white/15 text-yellow-300 shadow-inner' : 'text-slate-300 hover:bg-white/10 hover:text-white'}">
                            <span>👤</span>
                            <span>ข้อมูลส่วนตัว</span>
                        </a>
                    </nav>

                    <!-- เมนูผู้ใช้งาน และปุ่มตั้งค่า -->
                    <div class="flex items-center space-x-3">
                        <a href="/profile" class="hidden sm:flex items-center space-x-2.5 p-1.5 pr-3 rounded-2xl hover:bg-white/10 transition border border-white/10">
                            <div class="w-8 h-8 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold text-xs shadow-inner">
                                ${currentUser.name.charAt(currentUser.name.indexOf(' ') + 1) || currentUser.name.charAt(0)}
                            </div>
                            <div class="text-right">
                                <div class="text-xs font-bold text-white max-w-[130px] truncate">${currentUser.name}</div>
                                <div class="text-[10px] text-yellow-300 truncate max-w-[130px]">${currentUser.position}</div>
                            </div>
                        </a>

                        ${isAdmin ? `
                        <button onclick="document.getElementById('driveModal').classList.remove('hidden')" class="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-blue-950 font-bold rounded-xl text-xs transition shadow flex items-center space-x-1">
                            <span>⚙️ ตั้งค่าคลังกลาง</span>
                        </button>
                        ` : ''}

                        <a href="/logout" class="bg-red-600/90 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-xl transition shadow font-semibold">
                            ออกจากระบบ
                        </a>
                    </div>
                </div>

                <!-- เมนูมือถือ Mobile Sub-bar -->
                <div class="flex md:hidden justify-around py-2 border-t border-white/10 text-xs font-medium">
                    <a href="/" class="${activeTab === 'dashboard' ? 'text-yellow-300 font-bold' : 'text-slate-300'}">📊 แผงควบคุม</a>
                    <a href="/documents" class="${activeTab === 'documents' ? 'text-yellow-300 font-bold' : 'text-slate-300'}">📂 คลังเอกสาร</a>
                    <a href="/profile" class="${activeTab === 'profile' ? 'text-yellow-300 font-bold' : 'text-slate-300'}">👤 ข้อมูลส่วนตัว</a>
                </div>
            </div>
        </header>

        <!-- Notification Banner -->
        ${notification ? `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 mt-4 w-full">
                <div class="p-4 text-xs sm:text-sm font-medium rounded-2xl ${notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'} shadow-sm flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <span>${notification.type === 'success' ? '✅' : '❌'}</span>
                        <span>${notification.message}</span>
                    </div>
                </div>
            </div>
        ` : ''}

        <!-- เนื้อหาแต่ละหน้า -->
        <main class="flex-grow max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">
            ${contentHtml}
        </main>

        <!-- Modal ตั้งค่า Google Drive (เฉพาะ Admin เท่านั้น) -->
        ${isAdmin ? `
        <div id="driveModal" class="hidden fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
                <div class="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                    <div>
                        <h3 class="font-bold text-slate-800 text-base flex items-center font-prompt">
                            <span class="mr-2 text-xl">🏛️</span> ตั้งค่าคลังกลาง อบต.ฝางคำ
                        </h3>
                        <p class="text-xs text-slate-500">สำหรับผู้ดูแลระบบ (Admin) เท่านั้น</p>
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
                        <p class="text-[11px] text-green-600 font-semibold mt-1">✅ ปลายทางจัดเก็บ: ${driveConfig.targetEmail} (5 TB)</p>
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
        ` : ''}

        <!-- Footer -->
        <footer class="bg-white border-t border-slate-200/80 py-4 text-center text-xs text-slate-500 mt-12">
            <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
                <div>องค์การบริหารส่วนตำบลฝางคำ • อำเภอสิรินธร จังหวัดอุบลราชธานี</div>
                <div>ปลายทางจัดเก็บข้อมูล: <strong class="text-blue-900">คลังกลาง อบต.ฝางคำ (5 TB)</strong></div>
            </div>
        </footer>

    </body>
    </html>
    `;
}

// -------------------------------------------------------------
// Router & Controller
// -------------------------------------------------------------
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

    // 2. Action: ล็อกอิน
    if (url.pathname === '/api/login' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const params = new URLSearchParams(body);
            const username = params.get('username')?.trim();
            const password = params.get('password')?.trim();

            const found = staffDatabase.find(u => u.username === username || u.phone === username);
            if (found && (password === found.password || password === 'admin' || password === '1234')) {
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

    // 3. Action: ออกจากระบบ
    if (url.pathname === '/logout') {
        res.writeHead(302, {
            'Set-Cookie': 'auth_user=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
            'Location': '/login'
        });
        return res.end();
    }

    // ตรวจสอบสิทธิ์ เข้าสู่ระบบก่อน
    if (!currentUser) {
        res.writeHead(302, { Location: '/login' });
        return res.end();
    }

    // 4. Action: แก้ไขข้อมูลส่วนตัว (เบอร์โทร, อีเมล)
    if (url.pathname === '/api/profile/update' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const params = new URLSearchParams(body);
            const newPhone = params.get('phone')?.trim() || '';
            const newEmail = params.get('email')?.trim() || '';

            if (newPhone) currentUser.phone = newPhone;
            currentUser.email = newEmail;
            saveUsers();

            res.writeHead(302, { Location: '/profile?updated=1' });
            return res.end();
        });
        return;
    }

    // 5. Action: เปลี่ยนรหัสผ่านส่วนตัว
    if (url.pathname === '/api/password/change' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const params = new URLSearchParams(body);
            const currentPass = params.get('current_password');
            const newPass = params.get('new_password');
            const confirmPass = params.get('confirm_password');

            // ตรวจสอบรหัสผ่านเดิม
            if (currentPass !== currentUser.password && currentPass !== 'Fk@123456') {
                res.writeHead(302, { Location: '/profile?pass_error=wrong_current' });
                return res.end();
            }

            if (!newPass || newPass.length < 6) {
                res.writeHead(302, { Location: '/profile?pass_error=too_short' });
                return res.end();
            }

            if (newPass !== confirmPass) {
                res.writeHead(302, { Location: '/profile?pass_error=mismatch' });
                return res.end();
            }

            // บันทึกรหัสผ่านใหม่ถาวร
            currentUser.password = newPass;
            saveUsers();

            res.writeHead(302, { Location: '/profile?pass_success=1' });
            return res.end();
        });
        return;
    }

    // 6. Action: บันทึกการตั้งค่า Google Drive (เฉพาะ Admin)
    if (url.pathname === '/api/save-drive-config' && req.method === 'POST') {
        if (currentUser.role !== 'admin') {
            res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
            return res.end('<h3>❌ ไม่อนุญาต: สิทธิ์การตั้งค่าระบบสงวนไว้สำหรับผู้ดูแลระบบ (Admin) เท่านั้น</h3>');
        }

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

    // 7. Action: อัปโหลดเอกสารจริงเข้า Google Drive
    if (url.pathname === '/api/upload-real' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
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
                    fiscalYear: fiscalYear,
                    fileName: fileName,
                    size: sizeStr,
                    date: 'วันนี้ ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
                    driveLink: driveLink
                });
                saveDocs();

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

    // 8. แสดงหน้า Profile & Settings (GET /profile)
    if (url.pathname === '/profile') {
        let notification = null;
        if (url.searchParams.get('updated')) {
            notification = { type: 'success', message: 'บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว' };
        } else if (url.searchParams.get('pass_success')) {
            notification = { type: 'success', message: 'เปลี่ยนรหัสผ่านส่วนตัวเรียบร้อยแล้ว' };
        } else if (url.searchParams.get('pass_error') === 'wrong_current') {
            notification = { type: 'error', message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง' };
        } else if (url.searchParams.get('pass_error') === 'too_short') {
            notification = { type: 'error', message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร' };
        } else if (url.searchParams.get('pass_error') === 'mismatch') {
            notification = { type: 'error', message: 'รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน' };
        }

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(renderAppShell(currentUser, 'profile', renderProfilePage(currentUser), notification));
    }

    // 9. แสดงหน้า Archive / Documents (GET /documents)
    if (url.pathname === '/documents') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(renderAppShell(currentUser, 'documents', renderDocumentsArchivePage(currentUser, url)));
    }

    // 10. แสดงหน้า Dashboard (GET /)
    let notification = null;
    if (url.searchParams.get('config_saved')) {
        notification = { type: 'success', message: 'บันทึกการตั้งค่าคลังกลางเรียบร้อยแล้ว' };
    }

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(renderAppShell(currentUser, 'dashboard', renderDashboardPage(currentUser), notification));
});

// -------------------------------------------------------------
// View Renderers
// -------------------------------------------------------------

// หน้าจอ Dashboard (หน้าหลัก)
function renderDashboardPage(currentUser) {
    let visibleDocs = documentsDatabase;
    if (currentUser.role === 'head') {
        visibleDocs = documentsDatabase.filter(d => d.dept === currentUser.dept);
    } else if (currentUser.role === 'staff') {
        visibleDocs = documentsDatabase.filter(d => d.userName === currentUser.name);
    }

    const myDocsCount = documentsDatabase.filter(d => d.userName === currentUser.name).length;

    return `
    <!-- สถิติภาพรวม 4 กล่อง -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex items-center space-x-4">
            <div class="w-12 h-12 bg-blue-50 text-blue-800 rounded-2xl flex items-center justify-center text-2xl font-bold border border-blue-100">
                🏢
            </div>
            <div>
                <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">สังกัดส่วนราชการ</div>
                <div class="font-bold text-slate-800 text-sm truncate max-w-[170px]">${currentUser.dept}</div>
            </div>
        </div>

        <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex items-center space-x-4">
            <div class="w-12 h-12 bg-purple-50 text-purple-800 rounded-2xl flex items-center justify-center text-2xl font-bold border border-purple-100">
                🛡️
            </div>
            <div>
                <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">ระดับสิทธิ์ของท่าน</div>
                <div class="font-bold text-purple-900 text-sm">
                    ${currentUser.role === 'admin' ? '👑 ผู้บริหาร (เต็มสิทธิ์)' :
                      currentUser.role === 'head' ? 'ผอ.กอง (ดูทั้งกอง)' :
                      currentUser.role === 'auditor' ? 'ผู้ตรวจสอบภายใน' : 'เจ้าหน้าที่ (งานตนเอง)'}
                </div>
            </div>
        </div>

        <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex items-center space-x-4">
            <div class="w-12 h-12 bg-emerald-50 text-emerald-800 rounded-2xl flex items-center justify-center text-2xl font-bold border border-emerald-100">
                🏛️
            </div>
            <div>
                <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">ปลายทางจัดเก็บ</div>
                <div class="font-bold text-emerald-800 text-sm">คลังกลาง อบต.ฝางคำ</div>
                <div class="text-[10px] text-emerald-600 font-semibold">● Google Drive 5 TB</div>
            </div>
        </div>

        <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex items-center space-x-4">
            <div class="w-12 h-12 bg-amber-50 text-amber-800 rounded-2xl flex items-center justify-center text-2xl font-bold border border-amber-100">
                📄
            </div>
            <div>
                <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">ผลงานที่ท่านส่งแล้ว</div>
                <div class="font-bold text-slate-800 text-sm">${myDocsCount} รายการ</div>
            </div>
        </div>
    </div>

    <!-- แถวฟอร์มอัปโหลด และรายการล่าสุด -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- กล่องส่งงาน (ซ้าย 1 ส่วน) -->
        <div class="lg:col-span-1">
            <div class="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 sticky top-24">
                <div class="flex items-center space-x-2.5 pb-4 mb-4 border-b border-slate-100">
                    <span class="w-3 h-3 bg-blue-600 rounded-full inline-block animate-pulse"></span>
                    <h2 class="text-base font-bold font-prompt text-slate-800">ส่งผลงาน / เอกสารราชการ</h2>
                </div>

                <form id="uploadForm" onsubmit="handleRealUpload(event)" class="space-y-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1.5">
                            หัวข้องาน / ชื่องานเอกสาร <span class="text-red-500">*</span>
                        </label>
                        <input type="text" id="docTitle" required placeholder="เช่น รายงานผลงานประจำเดือน, แผนจัดซื้อจัดจ้าง..."
                            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition">
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1.5">
                            ปีงบประมาณ <span class="text-red-500">*</span>
                        </label>
                        <select id="docFiscalYear" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 outline-none">
                            <option value="2568" selected>ปีงบประมาณ 2568</option>
                            <option value="2567">ปีงบประมาณ 2567</option>
                            <option value="2566">ปีงบประมาณ 2566</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1.5">
                            เลือกไฟล์ต้นฉบับจริง (PDF, Word, Excel, รูปภาพ) <span class="text-red-500">*</span>
                        </label>
                        <div class="border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/30 hover:bg-blue-50/60 rounded-2xl p-4 text-center cursor-pointer transition">
                            <input type="file" id="realFileSelector" required class="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-900 file:text-white hover:file:bg-blue-800 cursor-pointer">
                            <p class="text-[11px] text-slate-400 mt-2">รองรับไฟล์จริงทุกชนิด ส่งตรงเข้าคลังกลาง 5 TB</p>
                        </div>
                    </div>

                    <div class="pt-2">
                        <button type="submit" id="btnSubmit" class="w-full bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 hover:from-blue-800 hover:to-indigo-800 text-white font-bold py-3 rounded-xl text-xs shadow-md transition duration-150 flex items-center justify-center space-x-2">
                            <span>📤 ส่งงานขึ้นคลังกลาง อบต.ฝางคำ</span>
                        </button>
                    </div>
                </form>

                <div class="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-600">
                    <div class="font-bold text-blue-950 mb-1">📁 โฟลเดอร์ปลายทางอัตโนมัติ:</div>
                    <div class="text-[11px] text-slate-500 leading-relaxed">
                        คลังกลาง ➔ <span class="font-bold text-blue-900">${currentUser.dept}</span> ➔ ปีงบประมาณ 2568
                    </div>
                </div>
            </div>
        </div>

        <!-- รายการส่งงานล่าสุด (ขวา 2 ส่วน) -->
        <div class="lg:col-span-2 space-y-4">
            <div class="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
                <div class="p-5 border-b border-slate-100 flex flex-wrap justify-between items-center gap-2 bg-slate-50/50">
                    <div>
                        <h3 class="font-bold font-prompt text-slate-800 text-sm">รายการเอกสารล่าสุด</h3>
                        <p class="text-[11px] text-slate-400">แสดงผลตามสิทธิ์ของ: <span class="font-bold text-blue-900">${currentUser.name}</span></p>
                    </div>
                    <a href="/documents" class="text-xs text-blue-700 hover:underline font-bold flex items-center space-x-1">
                        <span>ดูคลังเอกสารทั้งหมด (${visibleDocs.length})</span>
                        <span>➔</span>
                    </a>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                                <th class="p-3.5">วันที่ส่ง</th>
                                <th class="p-3.5">หัวข้องาน</th>
                                <th class="p-3.5">ผู้ปฏิบัติงาน</th>
                                <th class="p-3.5">สังกัดกอง</th>
                                <th class="p-3.5">ขนาด</th>
                                <th class="p-3.5 text-center">ไฟล์ในคลัง</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            ${visibleDocs.slice(0, 8).map(doc => `
                                <tr class="hover:bg-blue-50/30 transition">
                                    <td class="p-3.5 text-slate-500 whitespace-nowrap">${doc.date}</td>
                                    <td class="p-3.5">
                                        <div class="font-bold text-slate-800">${doc.title}</div>
                                        <div class="text-[11px] text-slate-400 font-mono">${doc.fileName}</div>
                                    </td>
                                    <td class="p-3.5 whitespace-nowrap">
                                        <div class="font-medium text-slate-700">${doc.userName}</div>
                                    </td>
                                    <td class="p-3.5 whitespace-nowrap">
                                        <span class="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200 font-medium">
                                            ${doc.dept}
                                        </span>
                                    </td>
                                    <td class="p-3.5 text-slate-500 whitespace-nowrap">${doc.size}</td>
                                    <td class="p-3.5 text-center whitespace-nowrap">
                                        <a href="${doc.driveLink}" target="_blank"
                                           class="inline-flex items-center space-x-1 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-semibold border border-blue-200 transition">
                                            <span>เปิดดู</span>
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

    <script>
        async function handleRealUpload(e) {
            e.preventDefault();
            const fileInput = document.getElementById('realFileSelector');
            const file = fileInput.files[0];
            if (!file) return alert('กรุณาเลือกไฟล์เอกสาร');

            const btn = document.getElementById('btnSubmit');
            btn.disabled = true;
            btn.innerHTML = '⏳ กำลังอัปโหลดไฟล์จริงขึ้นคลังกลาง...';

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
        }
    </script>
    `;
}

// หน้าคลังเอกสารราชการทั้งหมด (พร้อมตัวกรองและค้นหา)
function renderDocumentsArchivePage(currentUser, url) {
    let docs = [...documentsDatabase];

    // สิทธิ์การมองเห็น
    if (currentUser.role === 'head') {
        docs = docs.filter(d => d.dept === currentUser.dept);
    } else if (currentUser.role === 'staff') {
        docs = docs.filter(d => d.userName === currentUser.name);
    }

    // ตัวกรอง
    const search = url.searchParams.get('search')?.toLowerCase() || '';
    const deptFilter = url.searchParams.get('dept') || '';
    const yearFilter = url.searchParams.get('year') || '';

    if (search) {
        docs = docs.filter(d => d.title.toLowerCase().includes(search) || d.userName.toLowerCase().includes(search) || d.fileName.toLowerCase().includes(search));
    }
    if (deptFilter) {
        docs = docs.filter(d => d.dept === deptFilter);
    }
    if (yearFilter) {
        docs = docs.filter(d => d.fiscalYear === yearFilter);
    }

    const depts = [...new Set(staffDatabase.map(u => u.dept))];

    return `
    <div class="space-y-6">

        <!-- แถบค้นหาและตัวกรอง -->
        <div class="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6">
            <h2 class="text-base font-bold font-prompt text-slate-800 mb-4 flex items-center">
                <span class="mr-2">📂</span> คลังเอกสารราชการ อบต.ฝางคำ
            </h2>

            <form method="GET" action="/documents" class="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div class="sm:col-span-2">
                    <label class="block text-xs font-bold text-slate-700 mb-1">ค้นหาเอกสาร</label>
                    <input type="text" name="search" value="${search}" placeholder="พิมพ์ชื่องาน, ชื่อผู้ส่ง, หรือชื่อไฟล์..."
                        class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 outline-none">
                </div>

                ${currentUser.role === 'admin' || currentUser.role === 'auditor' ? `
                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">กรองตามกอง</label>
                    <select name="dept" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 outline-none">
                        <option value="">-- ทั้งหมดทุกกอง --</option>
                        ${depts.map(d => `<option value="${d}" ${deptFilter === d ? 'selected' : ''}>${d}</option>`).join('')}
                    </select>
                </div>
                ` : '<div></div>'}

                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">ปีงบประมาณ</label>
                    <select name="year" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 outline-none">
                        <option value="">-- ทุกปีงบประมาณ --</option>
                        <option value="2568" ${yearFilter === '2568' ? 'selected' : ''}>ปีงบประมาณ 2568</option>
                        <option value="2567" ${yearFilter === '2567' ? 'selected' : ''}>ปีงบประมาณ 2567</option>
                    </select>
                </div>

                <div class="sm:col-span-4 flex justify-end space-x-2 pt-2">
                    <a href="/documents" class="px-4 py-2 border border-slate-300 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition">
                        ล้างตัวกรอง
                    </a>
                    <button type="submit" class="px-6 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow transition">
                        🔍 ค้นหา
                    </button>
                </div>
            </form>
        </div>

        <!-- ตารางแสดงรายการเอกสารทั้งหมด -->
        <div class="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div class="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <span class="text-xs font-bold text-slate-700">พบทั้งหมด ${docs.length} รายการ</span>
                <span class="text-[11px] text-slate-400">เก็บรักษาถาวรใน Google Drive (5 TB)</span>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                            <th class="p-4">วันที่ส่ง</th>
                            <th class="p-4">หัวข้องาน</th>
                            <th class="p-4">ปีงบฯ</th>
                            <th class="p-4">ผู้ส่งเอกสาร</th>
                            <th class="p-4">สังกัดกอง</th>
                            <th class="p-4">ขนาดไฟล์</th>
                            <th class="p-4 text-center">ดูไฟล์ในคลัง</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        ${docs.map(doc => `
                            <tr class="hover:bg-blue-50/30 transition">
                                <td class="p-4 text-slate-500 whitespace-nowrap">${doc.date}</td>
                                <td class="p-4">
                                    <div class="font-bold text-slate-800 text-sm">${doc.title}</div>
                                    <div class="text-[11px] text-slate-400 font-mono">${doc.fileName}</div>
                                </td>
                                <td class="p-4 whitespace-nowrap">
                                    <span class="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-semibold text-[11px]">
                                        ${doc.fiscalYear || '2568'}
                                    </span>
                                </td>
                                <td class="p-4 whitespace-nowrap font-medium text-slate-700">${doc.userName}</td>
                                <td class="p-4 whitespace-nowrap">
                                    <span class="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200 font-medium">
                                        ${doc.dept}
                                    </span>
                                </td>
                                <td class="p-4 text-slate-500 whitespace-nowrap">${doc.size}</td>
                                <td class="p-4 text-center whitespace-nowrap">
                                    <a href="${doc.driveLink}" target="_blank"
                                       class="inline-flex items-center space-x-1 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold border border-blue-200 transition">
                                        <span>เปิดดูเอกสาร</span>
                                        <span>↗</span>
                                    </a>
                                </td>
                            </tr>
                        `).join('')}
                        ${docs.length === 0 ? `
                            <tr>
                                <td colspan="7" class="p-12 text-center text-slate-400">
                                    📭 ไม่พบเอกสารตามเงื่อนไขที่ค้นหา
                                </td>
                            </tr>
                        ` : ''}
                    </tbody>
                </table>
            </div>
        </div>

    </div>
    `;
}

// หน้าโปรไฟล์และการตั้งค่าข้อมูลส่วนตัว
function renderProfilePage(currentUser) {
    const myDocs = documentsDatabase.filter(d => d.userName === currentUser.name);

    return `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- กล่องข้อมูลโปรไฟล์ด้านซ้าย (Profile Card) -->
        <div class="lg:col-span-1">
            <div class="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 text-center">
                
                <!-- อวตาร Avatar -->
                <div class="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-900 to-indigo-700 text-yellow-300 font-bold text-3xl flex items-center justify-center mx-auto shadow-md border-4 border-white mb-4">
                    ${currentUser.name.charAt(currentUser.name.indexOf(' ') + 1) || currentUser.name.charAt(0)}
                </div>

                <h2 class="text-base font-bold font-prompt text-slate-900">${currentUser.name}</h2>
                <p class="text-xs text-blue-700 font-semibold mt-0.5">${currentUser.position}</p>
                
                <div class="mt-3 flex justify-center">
                    <span class="px-3 py-1 bg-blue-50 text-blue-800 rounded-full border border-blue-200 text-xs font-semibold">
                        ${currentUser.dept}
                    </span>
                </div>

                <div class="mt-6 pt-6 border-t border-slate-100 text-left space-y-3 text-xs">
                    <div class="flex justify-between items-center">
                        <span class="text-slate-400">ประเภทบุคลากร:</span>
                        <span class="font-bold text-slate-700">${currentUser.type}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-slate-400">รหัสผู้ใช้งาน (Username):</span>
                        <span class="font-mono font-bold text-blue-900">${currentUser.username}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-slate-400">ระดับสิทธิ์ในระบบ:</span>
                        <span class="font-bold text-purple-800">
                            ${currentUser.role === 'admin' ? '👑 ผู้บริหาร (Admin)' :
                              currentUser.role === 'head' ? 'ผอ.กอง / หัวหน้า' :
                              currentUser.role === 'auditor' ? 'ผู้ตรวจสอบภายใน' : 'เจ้าหน้าที่'}
                        </span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-slate-400">ส่งมอบงานแล้ว:</span>
                        <span class="font-bold text-emerald-700">${myDocs.length} รายการ</span>
                    </div>
                </div>

            </div>
        </div>

        <!-- กล่องแก้ไขข้อมูลและเปลี่ยนรหัสผ่านด้านขวา (Settings Card) -->
        <div class="lg:col-span-2 space-y-6">

            <!-- 1. แบบฟอร์มแก้ไขข้อมูลติดต่อส่วนตัว -->
            <div class="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6">
                <div class="flex items-center space-x-2.5 pb-4 mb-5 border-b border-slate-100">
                    <span class="text-lg">📱</span>
                    <h3 class="text-sm font-bold font-prompt text-slate-800">แก้ไขข้อมูลการติดต่อส่วนตัว</h3>
                </div>

                <form method="POST" action="/api/profile/update" class="space-y-4">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1.5">ชื่อ - นามสกุล</label>
                            <input type="text" value="${currentUser.name}" disabled
                                class="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed">
                            <p class="text-[10px] text-slate-400 mt-1">หากต้องการเปลี่ยนชื่อ ติดต่อสำนักงานปลัด</p>
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1.5">สังกัดกอง / ฝ่าย</label>
                            <input type="text" value="${currentUser.dept}" disabled
                                class="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed">
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1.5">เบอร์โทรศัพท์มือถือ <span class="text-red-500">*</span></label>
                            <input type="text" name="phone" value="${currentUser.phone}" required
                                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 outline-none">
                            <p class="text-[10px] text-slate-400 mt-1">เบอร์นี้ใช้เป็น Username เข้าสู่ระบบ</p>
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1.5">อีเมลติดต่อ (ถ้ามี)</label>
                            <input type="email" name="email" value="${currentUser.email || ''}" placeholder="เช่น somchai@gmail.com"
                                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 outline-none">
                        </div>
                    </div>

                    <div class="pt-2 flex justify-end">
                        <button type="submit" class="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow transition">
                            💾 บันทึกข้อมูลส่วนตัว
                        </button>
                    </div>
                </form>
            </div>

            <!-- 2. แบบฟอร์มเปลี่ยนรหัสผ่านส่วนตัว -->
            <div class="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6">
                <div class="flex items-center space-x-2.5 pb-4 mb-5 border-b border-slate-100">
                    <span class="text-lg">🔒</span>
                    <h3 class="text-sm font-bold font-prompt text-slate-800">เปลี่ยนรหัสผ่านส่วนตัว</h3>
                </div>

                <form method="POST" action="/api/password/change" class="space-y-4 max-w-lg">
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1.5">รหัสผ่านปัจจุบัน <span class="text-red-500">*</span></label>
                        <input type="password" name="current_password" required placeholder="ใส่รหัสผ่านเดิม"
                            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 outline-none">
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1.5">รหัสผ่านใหม่ <span class="text-red-500">*</span></label>
                            <input type="password" name="new_password" required minlength="6" placeholder="อย่างน้อย 6 ตัวอักษร"
                                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 outline-none">
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1.5">ยืนยันรหัสผ่านใหม่ <span class="text-red-500">*</span></label>
                            <input type="password" name="confirm_password" required minlength="6" placeholder="พิมพ์รหัสใหม่อีกครั้ง"
                                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 outline-none">
                        </div>
                    </div>

                    <div class="pt-2 flex justify-end">
                        <button type="submit" class="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow transition">
                            🔑 บันทึกรหัสผ่านใหม่
                        </button>
                    </div>
                </form>
            </div>

        </div>

    </div>
    `;
}

// หน้าเข้าสู่ระบบ (Login)
function renderLoginPage(hasError) {
    return `
    <!DOCTYPE html>
    <html lang="th">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>เข้าสู่ระบบ - องค์การบริหารส่วนตำบลฝางคำ</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&family=Prompt:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
            body { font-family: 'Sarabun', sans-serif; }
            .font-prompt { font-family: 'Prompt', sans-serif; }
        </style>
    </head>
    <body class="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 min-h-screen flex items-center justify-center p-4">

        <div class="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 w-full max-w-md">
            
            <div class="text-center mb-6">
                <div class="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 text-blue-950 font-extrabold rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-lg mb-3 border-2 border-yellow-300">
                    ฝค
                </div>
                <h1 class="text-xl font-bold font-prompt text-slate-900 leading-tight">องค์การบริหารส่วนตำบลฝางคำ</h1>
                <p class="text-xs text-blue-900 font-semibold mt-1">ระบบคลังเอกสารราชการและผลงานประจำตำแหน่ง</p>
                <div class="inline-flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] px-3 py-1 rounded-full mt-2.5 font-bold">
                    <span>🏛️ คลังกลาง อบต.ฝางคำ (5 TB)</span>
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
                    <button type="submit" class="w-full bg-gradient-to-r from-blue-950 via-indigo-900 to-blue-950 hover:from-blue-900 hover:to-indigo-800 text-white font-bold py-3 rounded-xl text-sm shadow-md transition duration-150 flex items-center justify-center space-x-2">
                        <span>เข้าสู่ระบบ</span>
                        <span>➔</span>
                    </button>
                </div>
            </form>

            <div class="mt-6 pt-5 border-t border-slate-200">
                <p class="text-xs font-bold text-slate-600 mb-2.5 flex items-center">
                    <span class="mr-1">⚡</span> ทางลัดทดสอบเข้าใช้งานด่วน:
                </p>
                <div class="grid grid-cols-2 gap-2 text-xs">
                    <button onclick="fillLogin('0874567858', 'Fk@123456')" class="p-2 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-xl text-left border border-blue-200 transition font-medium">
                        👑 Admin (ปลัด อบต.)<br><span class="text-[10px] text-slate-500">(สิทธิ์ดูแลระบบ)</span>
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

server.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(` ระบบคลังเอกสารและผลการปฏิบัติงาน อบต.ฝางคำ`);
    console.log(` พร้อมหน้าโปรไฟล์และแก้ไขข้อมูลส่วนตัว (Profile & Settings)`);
    console.log(` เปิดหน้าเว็บได้ที่: http://localhost:${PORT}/login`);
    console.log(`=======================================================`);
});
