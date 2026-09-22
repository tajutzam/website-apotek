<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class DatabaseBackupTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $kasir;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'name' => 'Admin Apotek',
            'email' => 'admin@test.com',
            'role' => 'admin',
            'password' => Hash::make('password'),
        ]);

        $this->kasir = User::factory()->create([
            'name' => 'Kasir Apotek',
            'email' => 'kasir@test.com',
            'role' => 'kasir',
            'password' => Hash::make('password'),
        ]);
    }

    public function test_kasir_cannot_access_database_settings(): void
    {
        $response = $this->actingAs($this->kasir)->get('/settings/database');
        $response->assertStatus(403);
    }

    public function test_admin_can_access_database_settings(): void
    {
        $response = $this->actingAs($this->admin)->get('/settings/database');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Settings/Database'));
    }

    public function test_admin_can_create_backup_snapshot(): void
    {
        $response = $this->actingAs($this->admin)->post('/settings/database/create-backup');
        $response->assertRedirect();
        $response->assertSessionHas('success');
    }

    public function test_admin_can_download_database_backup(): void
    {
        $response = $this->actingAs($this->admin)->get('/settings/database/download');
        $response->assertStatus(200);
        $this->assertTrue(str_contains($response->headers->get('content-disposition') ?? '', 'attachment;'));
    }

    public function test_rejects_invalid_file_on_restore(): void
    {
        $invalidFile = UploadedFile::fake()->create('fake_database.txt', 10, 'text/plain');

        $response = $this->actingAs($this->admin)->post('/settings/database/restore', [
            'file' => $invalidFile,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');
    }
}
