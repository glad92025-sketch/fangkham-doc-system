<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('name');              // ชื่อกอง เช่น สำนักงานปลัด, กองคลัง
            $table->string('code')->unique();    // รหัสย่อ เช่น PALAD, KLANG
            $table->string('drive_folder_id')->nullable(); // Folder ID บน Google Drive
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('departments');
    }
};
