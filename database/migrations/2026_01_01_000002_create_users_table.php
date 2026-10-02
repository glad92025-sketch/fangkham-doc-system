<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('username')->unique();          // เบอร์โทรศัพท์ หรือ ชื่อภาษาอังกฤษ
            $table->string('password');
            $table->string('phone')->nullable();
            $table->string('position');                    // ตำแหน่ง
            $table->string('employment_type');             // ข้าราชการ, พนักงานจ้างตามภารกิจ, จ้างเหมาบริการ
            $table->foreignId('department_id')->constrained('departments')->onDelete('cascade');
            $table->enum('role', ['admin', 'head', 'auditor', 'staff'])->default('staff');
            $table->boolean('must_change_password')->default(true);
            $table->boolean('is_active')->default(true);
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
