<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $query = ActivityLog::with('user');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('user_name', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%");
            });
        }

        if ($request->filled('module')) {
            $query->where('module', $request->module);
        }

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->date);
        }

        $logs = $query->latest('id')->paginate(15)->withQueryString();

        $modules = ActivityLog::distinct()->pluck('module')->filter()->values();
        $actions = ActivityLog::distinct()->pluck('action')->filter()->values();

        return Inertia::render('ActivityLogs/Index', [
            'logs' => $logs,
            'modules' => $modules,
            'actions' => $actions,
            'filters' => $request->only(['search', 'module', 'action', 'date']),
        ]);
    }
}
