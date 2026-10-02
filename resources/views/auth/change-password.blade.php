@extends('layouts.app')

@section('title', 'เปลี่ยนรหัสผ่าน')

@section('content')
<div class="max-w-md mx-auto py-8">
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 class="text-lg font-bold text-slate-800 mb-2">ตั้งค่ารหัสผ่านใหม่</h2>
        <p class="text-xs text-slate-500 mb-6">เพื่อความปลอดภัยของข้อมูล กรุณากำหนดรหัสผ่านส่วนตัวของท่าน</p>

        <form method="POST" action="{{ route('password.change') }}" class="space-y-4">
            @csrf

            <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">รหัสผ่านปัจจุบัน</label>
                <input type="password" name="current_password" required
                    class="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            </div>

            <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)</label>
                <input type="password" name="new_password" required minlength="6"
                    class="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            </div>

            <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">ยืนยันรหัสผ่านใหม่</label>
                <input type="password" name="new_password_confirmation" required minlength="6"
                    class="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            </div>

            <div class="pt-2 flex justify-end space-x-2">
                <a href="{{ route('dashboard') }}" class="px-4 py-2 border border-slate-300 text-slate-600 rounded-xl text-xs hover:bg-slate-50">
                    ยกเลิก
                </a>
                <button type="submit" class="bg-blue-900 hover:bg-blue-800 text-white font-medium px-5 py-2 rounded-xl text-xs shadow">
                    บันทึกรหัสผ่านใหม่
                </button>
            </div>
        </form>
    </div>
</div>
@endsection
