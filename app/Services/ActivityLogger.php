<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class ActivityLogger
{
    public static function log(string $action, string $module, string $description, ?array $properties = null): ActivityLog
    {
        $user = Auth::user();

        return ActivityLog::create([
            'user_id' => $user ? $user->id : null,
            'user_name' => $user ? $user->name : 'Sistem / Anonim',
            'action' => $action,
            'module' => $module,
            'description' => $description,
            'properties' => $properties,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);
    }
}
