# ระบบจัดเก็บเอกสารและผลการปฏิบัติงาน - องค์การบริหารส่วนตำบลฝางคำ

ระบบบันทึกและส่งมอบงานราชการประจำตำแหน่ง พร้อมจัดเก็บเอกสารลงใน **Google Drive Enterprise (5 TB)** พัฒนาด้วย Laravel 11 และ Tailwind CSS 

---

## 🚀 ฟังก์ชันหลักของระบบ

1. **ระบบยืนยันตัวตนแยกตามรายบุคคล (48 ท่าน):**
   * **Username:** เบอร์โทรศัพท์มือถือของเจ้าหน้าที่
   * **Default Password:** `Fk@123456`
   * บังคับเปลี่ยนรหัสผ่านเมื่อเข้าใช้งานครั้งแรกเพื่อความปลอดภัย
2. **การจัดสิทธิ์การเข้าถึงข้อมูลตามบทบาท (Role-Based Access Control):**
   * **ผู้บริหาร (ปลัด / รองปลัด):** สิทธิ์ `admin` ดูและดาวน์โหลดเอกสารของทุกกองได้ 100%
   * **ผู้อำนวยการกอง / หน.สำนักปลัด:** สิทธิ์ `head` ตรวจสอบและดูงานของเจ้าหน้าที่ทุกคนในสังกัดกองตนเอง
   * **หน่วยตรวจสอบภายใน:** สิทธิ์ `auditor` เรียกดูเอกสารโครงการ เบิกจ่าย ทุกกอง (Read-Only)
   * **เจ้าหน้าที่ทั่วไป:** สิทธิ์ `staff` บันทึกส่งงานและดูประวัติเฉพาะตนเอง
3. **การเชื่อมต่อ Google Drive 5 TB:**
   * เชื่อมต่อผ่าน **Google Drive API v3 (Service Account)**
   * ไฟล์จะถูกจัดส่งเข้า Shared Drive แยกตามโครงสร้างกองให้อัตโนมัติ

---

## 📁 โครงสร้างโปรเจกต์

```text
fangkham-doc-system/
├── app/
│   ├── Http/Controllers/
│   │   ├── AuthController.php          # ระบบล็อกอิน / ออกจากระบบ / เปลี่ยนรหัสผ่าน
│   │   └── DocumentController.php      # แสดงแดชบอร์ด / กรองเอกสาร / อัปโหลดไฟล์
│   ├── Models/
│   │   ├── Department.php              # ข้อมูลกอง/สำนัก
│   │   ├── Document.php                # ข้อมูลเอกสารและลิงก์ Google Drive
│   │   └── User.php                    # ข้อมูลพนักงานและสิทธิ์
│   └── Services/
│       └── GoogleDriveService.php      # โมดูลเชื่อมต่อ Google Drive API v3
├── database/
│   ├── migrations/                     # โครงสร้างตารางฐานข้อมูล
│   └── seeders/
│       └── UserStaffSeeder.php         # บรรจุข้อมูลพนักงาน อบต.ฝางคำ ทั้ง 48 ท่าน
├── resources/views/
│   ├── layouts/app.blade.php           # Template หลัก (สีกรมท่า-ทองราชการ)
│   ├── auth/login.blade.php            # หน้าล็อกอิน
│   ├── auth/change-password.blade.php  # หน้าเปลี่ยนรหัสผ่าน
│   └── dashboard.blade.php             # หน้าส่งงานและตารางค้นหาเอกสาร
├── Dockerfile                          # คอนฟิกรันระบบบน Render / Docker
├── render.yaml                         # Blueprint Deploy บน Render.com ในคลิกเดียว
└── README.md
```

---

## ☁️ ขั้นตอนการเชื่อมต่อ Google Drive 5 TB (Shared Drive)

1. เข้าไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้าง Project ใหม่ เช่น `FangKham-Doc-System`
3. ไปที่เมนู **APIs & Services** > **Library** > ค้นหา **Google Drive API** แล้วกด **Enable**
4. ไปที่ **Credentials** > **Create Credentials** > **Service Account**
5. ตั้งชื่อ เช่น `laravel-drive` > กด Create
6. คลิกที่ Service Account ที่สร้าง > ไปที่แท็บ **Keys** > **Add Key** > **Create New Key (JSON)**
7. บันทึกไฟล์ที่ดาวน์โหลดมา นำไปวางไว้ที่ `storage/app/google-service-account.json`
8. **ขั้นตอนสำคัญที่สุด:** 
   * คัดลอกอีเมลของ Service Account (เช่น `laravel-drive@fangkham-doc.iam.gserviceaccount.com`)
   * เปิด Google Drive (5 TB) > คลิกขวาที่โฟลเดอร์หลักหรือ **Shared Drive**
   * กด **แชร์ (Share)** > ใส่อีเมลของ Service Account ลงไป และกำหนดสิทธิ์เป็น **"Content Manager (ผู้จัดการเนื้อหา)"**

---

## 🚢 การนำขึ้น Deploy บน Render.com

โปรเจกต์นี้มีไฟล์ `render.yaml` และ `Dockerfile` พร้อมใช้งาน:

1. ดันโค้ดโปรเจกต์ขึ้น **GitHub** (แนะนำตั้งค่าเป็น Repository แบบ Private)
2. เข้าสู่ระบบ [Render.com](https://render.com)
3. กด **New +** > เลือก **Blueprint** > เลือก Git Repository ของท่าน
4. Render จะตรวจจับ `render.yaml` และเตรียมสร้าง **Web Service** + **PostgreSQL Database** ให้อัตโนมัติ
5. ไปที่แท็บ **Environment** > **Secret Files**:
   * เพิ่มไฟล์ชื่อ: `google-service-account.json`
   * วางเนื้อหา JSON ที่ได้จาก Google Cloud ลงไป
6. กด Deploy
7. เมื่อ Deploy สำเร็จ ให้เปิดหน้าต่าง **Shell** บน Render แล้วรันคำสั่ง:
   ```bash
   php artisan migrate --seed --class=UserStaffSeeder --force
   ```
   ระบบจะสร้างฐานข้อมูลและเพิ่มรายชื่อเจ้าหน้าที่ทั้ง 48 ท่านพร้อมใช้งานทันที!
