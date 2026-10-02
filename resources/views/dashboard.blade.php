@extends('layouts.app')

@section('title', 'หน้าหลัก - แผงควบคุม')

@section('content')
<!-- กล่องสถานะภาพรวม -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-3">
        <div class="w-12 h-12 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center text-xl font-bold">
            🏢
        </div>
        <div>
            <div class="text-xs text-slate-400">หน่วยงาน / สังกัด</div>
            <div class="font-bold text-slate-800 text-sm truncate max-w-[170px]">{{ Auth::user()->department?->name }}</div>
        </div>
    </div>

    <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-3">
        <div class="w-12 h-12 bg-indigo-50 text-indigo-700 rounded-xl flex items-center justify-center text-xl font-bold">
            👤
        </div>
        <div>
            <div class="text-xs text-slate-400">ระดับสิทธิ์ในระบบ</div>
            <div class="font-bold text-indigo-900 text-sm">
                @if(Auth::user()->role === 'admin')
                    ผู้บริหาร (ดูได้ทุกกอง)
                @elseif(Auth::user()->role === 'head')
                    ผอ.กอง / หัวหน้างาน
                @elseif(Auth::user()->role === 'auditor')
                    หน่วยตรวจสอบภายใน
                @else
                    เจ้าหน้าที่ (ดูงานตนเอง)
                @endif
            </div>
        </div>
    </div>

    <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-3">
        <div class="w-12 h-12 bg-green-50 text-green-700 rounded-xl flex items-center justify-center text-xl font-bold">
            ☁️
        </div>
        <div>
            <div class="text-xs text-slate-400">ระบบจัดเก็บไฟล์</div>
            <div class="font-bold text-green-800 text-sm">Google Drive (5 TB)</div>
        </div>
    </div>

    <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-3">
        <div class="w-12 h-12 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center text-xl font-bold">
            📄
        </div>
        <div>
            <div class="text-xs text-slate-400">จำนวนงานที่ส่งแล้ว</div>
            <div class="font-bold text-slate-800 text-sm">{{ $myDocuments }} รายการ</div>
        </div>
    </div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

    <!-- ฟอร์มส่งงาน (ด้านซ้าย 1 ส่วน) -->
    <div class="lg:col-span-1">
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sticky top-20">
            <div class="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
                <span class="w-2.5 h-2.5 bg-blue-600 rounded-full inline-block"></span>
                <h2 class="text-base font-bold text-slate-800">ส่งผลงาน / อัปโหลดเอกสาร</h2>
            </div>

            <form action="{{ route('documents.store') }}" method="POST" enctype="multipart/form-data" class="space-y-4">
                @csrf

                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">
                        หัวข้องาน / ชื่อเอกสาร <span class="text-red-500">*</span>
                    </label>
                    <input type="text" name="title" required value="{{ old('title') }}"
                        placeholder="เช่น รายงานผลงานประจำเดือน, แผนจัดซื้อจัดจ้าง..."
                        class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none">
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">
                        ปีงบประมาณ <span class="text-red-500">*</span>
                    </label>
                    <select name="fiscal_year" class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 outline-none">
                        <option value="2568" selected>ปีงบประมาณ 2568</option>
                        <option value="2567">ปีงบประมาณ 2567</option>
                        <option value="2566">ปีงบประมาณ 2566</option>
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">
                        คำอธิบาย / รายละเอียดเพิ่มเติม
                    </label>
                    <textarea name="description" rows="2" placeholder="ระบุรายละเอียดของงาน (ถ้ามี)"
                        class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none">{{ old('description') }}</textarea>
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">
                        เลือกไฟล์แนบ <span class="text-red-500">*</span>
                    </label>
                    <div class="border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/40 rounded-xl p-4 text-center cursor-pointer transition">
                        <input type="file" name="file" required class="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer">
                        <p class="text-[11px] text-slate-400 mt-2">รองรับ PDF, Word, Excel, รูปภาพ, ZIP (สูงสุด 100 MB)</p>
                    </div>
                </div>

                <div class="pt-2">
                    <button type="submit" class="w-full bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white font-semibold py-2.5 rounded-xl text-xs shadow-md transition duration-150 flex items-center justify-center space-x-1.5">
                        <span>📤 ส่งงานขึ้น Google Drive</span>
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- ตารางแสดงรายการเอกสาร (ด้านขวา 2 ส่วน) -->
    <div class="lg:col-span-2 space-y-4">

        <!-- ตัวกรองค้นหา (เฉพาะผู้บริหารหรือผอ.กอง) -->
        @if(Auth::user()->isAdmin() || Auth::user()->isAuditor() || Auth::user()->isHead())
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
            <form method="GET" action="{{ route('dashboard') }}" class="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                @if(Auth::user()->isAdmin() || Auth::user()->isAuditor())
                <div>
                    <label class="block text-[11px] font-bold text-slate-600 mb-1">กรองตามกอง / สำนัก</label>
                    <select name="department_id" class="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none">
                        <option value="">-- ทั้งหมดทุกกอง --</option>
                        @foreach($departments as $dept)
                            <option value="{{ $dept->id }}" {{ request('department_id') == $dept->id ? 'selected' : '' }}>
                                {{ $dept->name }}
                            </option>
                        @endforeach
                    </select>
                </div>
                @endif

                <div>
                    <label class="block text-[11px] font-bold text-slate-600 mb-1">ปีงบประมาณ</label>
                    <select name="fiscal_year" class="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none">
                        <option value="">-- ทุกปีงบประมาณ --</option>
                        <option value="2568" {{ request('fiscal_year') == '2568' ? 'selected' : '' }}>2568</option>
                        <option value="2567" {{ request('fiscal_year') == '2567' ? 'selected' : '' }}>2567</option>
                    </select>
                </div>

                <div>
                    <button type="submit" class="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-1.5 rounded-lg text-xs transition">
                        🔍 ค้นหาเอกสาร
                    </button>
                </div>
            </form>
        </div>
        @endif

        <!-- รายการเอกสาร -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                    <h3 class="font-bold text-slate-800 text-sm">คลังเอกสารและผลการปฏิบัติงาน</h3>
                    <p class="text-[11px] text-slate-400">แสดงผลตามสิทธิ์ของท่าน</p>
                </div>
                <span class="text-xs bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full font-semibold">
                    ทั้งหมด {{ $documents->total() }} รายการ
                </span>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                            <th class="p-3">วันที่ส่ง</th>
                            <th class="p-3">หัวข้องาน</th>
                            <th class="p-3">ผู้ปฏิบัติงาน</th>
                            <th class="p-3">สังกัด</th>
                            <th class="p-3">ขนาด</th>
                            <th class="p-3 text-center">ไฟล์ใน Drive</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        @forelse($documents as $doc)
                        <tr class="hover:bg-blue-50/30 transition">
                            <td class="p-3 text-slate-500 whitespace-nowrap">
                                {{ $doc->created_at->format('d/m/Y') }}
                                <span class="text-[10px] block text-slate-400">{{ $doc->created_at->format('H:i') }} น.</span>
                            </td>
                            <td class="p-3">
                                <div class="font-bold text-slate-800">{{ $doc->title }}</div>
                                <div class="text-[11px] text-slate-400 truncate max-w-xs">{{ $doc->file_name }}</div>
                            </td>
                            <td class="p-3 whitespace-nowrap">
                                <div class="font-medium text-slate-700">{{ $doc->user?->name }}</div>
                                <div class="text-[10px] text-slate-400">{{ $doc->user?->position }}</div>
                            </td>
                            <td class="p-3 whitespace-nowrap">
                                <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                                    {{ $doc->department?->name }}
                                </span>
                            </td>
                            <td class="p-3 text-slate-500 whitespace-nowrap">
                                {{ number_format($doc->file_size / 1024 / 1024, 2) }} MB
                            </td>
                            <td class="p-3 text-center whitespace-nowrap">
                                <a href="{{ $doc->web_view_link }}" target="_blank"
                                   class="inline-flex items-center space-x-1 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold border border-blue-200 transition">
                                    <span>เปิดดู</span>
                                    <span>↗</span>
                                </a>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="6" class="p-10 text-center text-slate-400">
                                📭 ยังไม่มีข้อมูลการส่งเอกสารในระบบ
                            </td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            @if($documents->hasPages())
            <div class="p-3 border-t border-slate-100">
                {{ $documents->links() }}
            </div>
            @endif
        </div>

    </div>

</div>
@endsection
