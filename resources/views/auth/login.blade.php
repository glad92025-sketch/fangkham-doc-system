@extends('layouts.app')

@section('title', 'เข้าสู่ระบบ')

@section('content')
<div class="min-h-[75vh] flex items-center justify-center py-6">
    <div class="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 w-full max-w-md">
        
        <div class="text-center mb-6">
            <div class="w-16 h-16 bg-blue-900 text-yellow-400 font-extrabold rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-md mb-3">
                ฝค
            </div>
            <h2 class="text-xl font-bold text-slate-800">เข้าสู่ระบบส่งงาน</h2>
            <p class="text-xs text-slate-500 mt-1">อบต.ฝางคำ • เข้าใช้งานด้วยเบอร์โทรศัพท์ของท่าน</p>
        </div>

        <form method="POST" action="{{ route('login') }}" class="space-y-4">
            @csrf

            <div>
                <label for="username" class="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อผู้ใช้งาน (เบอร์โทรศัพท์มือถือ)
                </label>
                <div class="relative">
                    <input type="text" id="username" name="username" value="{{ old('username') }}" required autofocus
                        placeholder="เช่น 0874567858"
                        class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        📱
                    </div>
                </div>
            </div>

            <div>
                <label for="password" class="block text-xs font-semibold text-slate-700 mb-1">
                    รหัสผ่าน
                </label>
                <div class="relative">
                    <input type="password" id="password" name="password" required
                        placeholder="รหัสผ่านของท่าน"
                        class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        🔒
                    </div>
                </div>
            </div>

            <div class="pt-2">
                <button type="submit" class="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-2.5 rounded-xl text-sm shadow-md transition duration-150 flex items-center justify-center space-x-2">
                    <span>เข้าสู่ระบบ</span>
                    <span>➔</span>
                </button>
            </div>
        </form>

        <div class="mt-6 p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-slate-600">
            <p class="font-semibold text-blue-900 mb-1">💡 คำแนะนำการใช้งาน:</p>
            <p>• ใช้เบอร์โทรศัพท์ที่ลงทะเบียนไว้เป็น Username</p>
            <p>• รหัสผ่านเริ่มต้นคือ <code class="bg-blue-200/60 px-1 py-0.5 rounded text-blue-950 font-bold">Fk@123456</code></p>
            <p>• หากลืมรหัสผ่าน กรุณาติดต่อสำนักงานปลัด</p>
        </div>

    </div>
</div>
@endsection
