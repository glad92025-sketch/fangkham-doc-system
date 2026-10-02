<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'ระบบจัดเก็บเอกสารและผลงาน') - อบต.ฝางคำ</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Sarabun', sans-serif; }
    </style>
</head>
<body class="bg-slate-100 min-h-screen text-slate-800 flex flex-col">

    <!-- Header Navigation -->
    <header class="bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-md sticky top-0 z-50 border-b-2 border-yellow-500">
        <div class="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
            <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-yellow-400 text-blue-950 font-extrabold rounded-xl flex items-center justify-center text-lg shadow-inner">
                    ฝค
                </div>
                <div>
                    <h1 class="text-base sm:text-lg font-bold leading-tight">องค์การบริหารส่วนตำบลฝางคำ</h1>
                    <p class="text-xs text-blue-200">ระบบส่งงานและจัดเก็บเอกสารราชการประจำตำแหน่ง (คลัง 5 TB)</p>
                </div>
            </div>

            @auth
            <div class="flex items-center space-x-4">
                <div class="text-right hidden sm:block">
                    <div class="text-sm font-semibold text-white">{{ Auth::user()->name }}</div>
                    <div class="text-xs text-yellow-300 font-medium">{{ Auth::user()->position }} • {{ Auth::user()->department?->name }}</div>
                </div>
                <div class="flex items-center space-x-2">
                    <a href="{{ route('password.change') }}" class="bg-blue-800/80 hover:bg-blue-700 text-xs px-2.5 py-1.5 rounded-lg border border-blue-600 transition">
                        เปลี่ยนรหัส
                    </a>
                    <form method="POST" action="{{ route('logout') }}">
                        @csrf
                        <button type="submit" class="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-lg transition shadow-sm font-medium">
                            ออกจากระบบ
                        </button>
                    </form>
                </div>
            </div>
            @endauth
        </div>
    </header>

    <!-- Flash Messages -->
    <div class="max-w-7xl mx-auto px-4 mt-4 w-full">
        @if(session('success'))
            <div class="p-4 mb-4 text-sm text-green-800 rounded-xl bg-green-50 border border-green-200 shadow-sm flex items-center">
                <span class="mr-2 text-lg">✅</span>
                <span>{{ session('success') }}</span>
            </div>
        @endif

        @if(session('warning'))
            <div class="p-4 mb-4 text-sm text-amber-800 rounded-xl bg-amber-50 border border-amber-200 shadow-sm flex items-center">
                <span class="mr-2 text-lg">⚠️</span>
                <span>{{ session('warning') }}</span>
            </div>
        @endif

        @if($errors->any())
            <div class="p-4 mb-4 text-sm text-red-800 rounded-xl bg-red-50 border border-red-200 shadow-sm">
                <p class="font-bold mb-1">เกิดข้อผิดพลาด:</p>
                <ul class="list-disc list-inside">
                    @foreach($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif
    </div>

    <!-- Main Content -->
    <main class="flex-grow max-w-7xl mx-auto px-4 py-4 w-full">
        @yield('content')
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 mt-8">
        องค์การบริหารส่วนตำบลฝางคำ • ระบบจัดเก็บไฟล์ข้อมูลเอกสารผ่าน Google Drive Enterprise (5 TB)
    </footer>

</body>
</html>
