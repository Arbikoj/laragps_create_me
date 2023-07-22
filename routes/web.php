<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\DataController;
use App\Http\Controllers\DetailEmployee;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\MapsController;
use Symfony\Component\HttpKernel\DataCollector\DataCollector;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::middleware(['splade'])->group(function () {
    // Registers routes to support the interactive components...
    Route::spladeWithVueBridge();

    // Registers routes to support password confirmation in Form and Link components...
    Route::spladePasswordConfirmation();

    // Registers routes to support Table Bulk Actions and Exports...
    Route::spladeTable();

    // Registers routes to support async File Uploads with Filepond...
    Route::spladeUploads();

    Route::get('/maps', [MapsController::class, 'index'])->name('maps');

    Route::get('/', function () {
        return view('welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    });

    Route::middleware([
        'auth:sanctum',
        config('jetstream.auth_session'),
        'verified',
    ])->group(function () {
        Route::view('/dashboard', 'dashboard')->name('dashboard');
        Route::resource('/employee', EmployeeController::class);
        Route::get('/employee/{id}/{tgl}', [EmployeeController::class, 'detail'])->name('employee.detail');


        Route::get('/employee/{slug}/{sn}/{uid}/{lat}/{long}/{date}', [DataController::class, 'tambah']);
        // http://127.0.0.1:8000/employee/1/snkk/uidd/-7.271785218038426/112.79703277179932/2023-07-01
        
        

        Route::resource('/data', DataController::class);


        // JSON DATA
        Route::get('/jsondata/{id}', [DataController::class,'json']);

    });
});
