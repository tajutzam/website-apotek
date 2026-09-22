<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;
use Native\Laravel\Facades\Window;
use Native\Laravel\Contracts\ProvidesPhpIni;

class NativeAppServiceProvider implements ProvidesPhpIni
{
    /**
     * Executed once the native application has been booted.
     * Use this method to open windows, register global shortcuts, etc.
     */
    public function boot(): void
    {
        $this->ensureDatabaseIsReady();

        Window::open()
            ->width(1280)
            ->height(800)
            ->minWidth(1024)
            ->minHeight(700)
            ->title('Apotek Mandiri')
            ->rememberState();
    }

    /**
     * Ensure database migrations and initial seeders are run on desktop install.
     */
    protected function ensureDatabaseIsReady(): void
    {
        try {
            Artisan::call('migrate', ['--force' => true]);

            if (Schema::hasTable('users') && User::count() === 0) {
                Artisan::call('db:seed', ['--force' => true]);
            }
        } catch (\Throwable $e) {
        }
    }

    /**
     * Return an array of php.ini directives to be set.
     */
    public function phpIni(): array
    {
        return [
        ];
    }
}
