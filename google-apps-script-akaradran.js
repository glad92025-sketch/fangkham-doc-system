/**
 * โค้ด Google Apps Script สำหรับบัญชี: akaradran2568@gmail.com
 * ใช้สำหรับรับไฟล์จากระบบเว็บ อบต.ฝางคำ แล้วบันทึกลงใน Google Drive โดยอัตโนมัติ
 * 
 * วิธีติดตั้ง:
 * 1. ล็อกอินบัญชี akaradran2568@gmail.com ในเบราว์เซอร์
 * 2. เข้าเว็บ https://script.google.com/ แล้วกด "โครงการใหม่ (New Project)"
 * 3. ลบโค้ดเดิมออกทั้งหมด แล้ววางโค้ดชุดนี้ลงไป
 * 4. กดปุ่ม "ทำให้ใช้งานได้ (Deploy)" > "การทำให้ใช้งานได้ใหม่ (New deployment)"
 * 5. เลือกประเภท: "เว็บแอป (Web app)"
 *    - คำอธิบาย: ระบบจัดเก็บเอกสาร อบต.ฝางคำ
 *    - ดำเนินการในฐานะ: ฉัน (akaradran2568@gmail.com)
 *    - ผู้ที่มีสิทธิ์เข้าถึง: ทุกคน (Anyone)  <-- สำคัญมาก!
 * 6. กด "ทำให้ใช้งานได้ (Deploy)" แล้วอนุญาตสิทธิ์เข้าถึง
 * 7. คัดลอก "URL ของเว็บแอป (Web App URL)" นำไปใส่ในหน้าระบบ
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    var fileName = data.fileName || "เอกสารราชการ.pdf";
    var fileContentBase64 = data.fileBase64;
    var department = data.department || "สำนักงานปลัด";
    var fiscalYear = data.fiscalYear || "2568";
    var uploaderName = data.uploaderName || "เจ้าหน้าที่";
    var title = data.title || "ผลการปฏิบัติงาน";

    // 1. หาหรือสร้างโฟลเดอร์หลัก "ระบบจัดเก็บเอกสาร อบต.ฝางคำ"
    var rootFolder = getOrCreateFolder("ระบบจัดเก็บเอกสาร อบต.ฝางคำ");
    
    // 2. หาหรือสร้างโฟลเดอร์ตามชื่อกอง/ส่วนงาน
    var deptFolder = getOrCreateSubFolder(rootFolder, department);

    // 3. หาหรือสร้างโฟลเดอร์ตามปีงบประมาณ
    var yearFolder = getOrCreateSubFolder(deptFolder, "ปีงบประมาณ_" + fiscalYear);

    // 4. แปลงไฟล์ Base64 เป็นไฟล์จริงและบันทึกลงใน Drive
    var decoded = Utilities.base64Decode(fileContentBase64);
    var blob = Utilities.newBlob(decoded, data.mimeType || "application/pdf", fileName);
    var savedFile = yearFolder.createFile(blob);
    
    // บันทึกคำอธิบายชื่องานและผู้ส่ง
    savedFile.setDescription("ชื่องาน: " + title + "\nผู้ส่ง: " + uploaderName + "\nสังกัด: " + department);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      fileId: savedFile.getId(),
      fileUrl: savedFile.getUrl(),
      fileName: savedFile.getName(),
      size: savedFile.getSize(),
      folderName: yearFolder.getName()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("ระบบเชื่อมต่อ Google Drive อบต.ฝางคำ (akaradran2568@gmail.com) ทำงานปกติ").setMimeType(ContentService.MimeType.TEXT);
}

function getOrCreateFolder(folderName) {
  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(folderName);
}

function getOrCreateSubFolder(parentFolder, subFolderName) {
  var folders = parentFolder.getFoldersByName(subFolderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parentFolder.createFolder(subFolderName);
}
