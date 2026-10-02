<?php

namespace App\Services;

use Google\Client;
use Google\Service\Drive;
use Google\Service\Drive\DriveFile;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

class GoogleDriveService
{
    protected ?Drive $drive = null;
    protected bool $isConfigured = false;

    public function __construct()
    {
        $credentialsPath = base_path(config('services.google.service_account_json', env('GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON', 'storage/app/google-service-account.json')));

        if (file_exists($credentialsPath)) {
            try {
                $client = new Client();
                $client->setAuthConfig($credentialsPath);
                $client->addScope(Drive::DRIVE);
                $this->drive = new Drive($client);
                $this->isConfigured = true;
            } catch (\Exception $e) {
                Log::error('Google Drive Client Init Failed: ' . $e->getMessage());
            }
        }
    }

    /**
     * ตรวจสอบว่าระบบเชื่อมต่อ Google Drive Service Account สำเร็จหรือไม่
     */
    public function isConnected(): bool
    {
        return $this->isConfigured && $this->drive !== null;
    }

    /**
     * อัปโหลดไฟล์ไปยังโฟลเดอร์ Google Drive
     */
    public function uploadFile(UploadedFile $file, ?string $parentFolderId = null): array
    {
        if (!$this->isConnected()) {
            // โหมดทดสอบ Local (ถ้ายังไม่ได้วางไฟล์ service account ให้จำลองข้อมูล)
            $mockId = 'local_mock_' . uniqid();
            return [
                'id' => $mockId,
                'name' => $file->getClientOriginalName(),
                'link' => 'https://drive.google.com/drive/my-drive',
                'size' => $file->getSize(),
                'mime_type' => $file->getClientMimeType(),
                'is_mock' => true,
            ];
        }

        $folderId = $parentFolderId ?: env('GOOGLE_DRIVE_SHARED_DRIVE_ID', 'root');

        $fileMetadata = new DriveFile([
            'name' => date('Ymd_His') . '_' . $file->getClientOriginalName(),
            'parents' => [$folderId],
        ]);

        $content = file_get_contents($file->getRealPath());

        $uploadedFile = $this->drive->files->create($fileMetadata, [
            'data' => $content,
            'mimeType' => $file->getClientMimeType(),
            'uploadType' => 'multipart',
            'fields' => 'id, name, webViewLink, webContentLink, size',
            'supportsAllDrives' => true,
        ]);

        return [
            'id' => $uploadedFile->id,
            'name' => $uploadedFile->name,
            'link' => $uploadedFile->webViewLink,
            'size' => $uploadedFile->size,
            'mime_type' => $file->getClientMimeType(),
            'is_mock' => false,
        ];
    }
}
