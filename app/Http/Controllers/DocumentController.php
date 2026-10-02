<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Document;
use App\Services\GoogleDriveService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DocumentController extends Controller
{
    protected GoogleDriveService $driveService;

    public function __construct(GoogleDriveService $driveService)
    {
        $this->driveService = $driveService;
    }

    public function dashboard(Request $request)
    {
        $user = Auth::user();
        $query = Document::with(['user', 'department'])->latest();

        // กรองข้อมูลตามสิทธิ์ Role
        if ($user->isAdmin() || $user->isAuditor()) {
            // ดูได้ทุกกอง และสามารถเลือกตัวกรองตามกองได้
            if ($request->filled('department_id')) {
                $query->where('department_id', $request->department_id);
            }
        } elseif ($user->isHead()) {
            // ดูได้เฉพาะในกองของตนเอง
            $query->where('department_id', $user->department_id);
        } else {
            // เจ้าหน้าที่ทั่วไป ดูเฉพาะงานของตนเอง
            $query->where('user_id', $user->id);
        }

        if ($request->filled('fiscal_year')) {
            $query->where('fiscal_year', $request->fiscal_year);
        }

        $documents = $query->paginate(15);
        $departments = Department::all();

        // สรุปยอด
        $totalDocuments = Document::count();
        $myDocuments = Document::where('user_id', $user->id)->count();

        return view('dashboard', compact('documents', 'departments', 'totalDocuments', 'myDocuments'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'fiscal_year' => 'required|string|size:4',
            'file' => 'required|file|max:102400', // จำกัด 100 MB ต่อไฟล์
            'description' => 'nullable|string',
        ]);

        $user = Auth::user();
        $file = $request->file('file');

        // หา Folder ID ของกอง (ถ้ามี)
        $departmentFolderId = $user->department?->drive_folder_id;

        // อัปโหลดไฟล์ขึ้น Google Drive
        $uploadResult = $this->driveService->uploadFile($file, $departmentFolderId);

        // บันทึกประวัติลงฐานข้อมูล
        Document::create([
            'title' => $request->title,
            'description' => $request->description,
            'fiscal_year' => $request->fiscal_year,
            'user_id' => $user->id,
            'department_id' => $user->department_id,
            'google_drive_file_id' => $uploadResult['id'],
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $uploadResult['size'],
            'file_mime_type' => $uploadResult['mime_type'],
            'web_view_link' => $uploadResult['link'],
        ]);

        $message = 'ส่งงานและบันทึกไฟล์ขึ้น Google Drive เรียบร้อยแล้ว';
        if (!empty($uploadResult['is_mock'])) {
            $message .= ' (โหมดทดสอบในเครื่อง: ยังไม่ได้เชื่อม Service Account จริง)';
        }

        return redirect()->route('dashboard')->with('success', $message);
    }
}
