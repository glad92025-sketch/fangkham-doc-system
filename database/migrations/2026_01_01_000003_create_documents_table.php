<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->string('title');                       // หัวข้องาน
            $table->text('description')->nullable();       // รายละเอียด/หมายเหตุ
            $table->string('fiscal_year', 4);              // ปีงบประมาณ เช่น 2567, 2568
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('department_id')->constrained('departments')->onDelete('cascade');
            $table->string('google_drive_file_id');        // File ID ใน Google Drive
            $table->string('file_name');                   // ชื่อไฟล์ต้นฉบับ
            $table->unsignedBigInteger('file_size');       // ขนาดเป็น Bytes
            $table->string('file_mime_type', 100);         // ชนิดไฟล์
            $table->text('web_view_link')->nullable();     // ลิงก์เปิดดูใน Google Drive
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
