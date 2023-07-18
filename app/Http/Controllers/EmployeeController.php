<?php

namespace App\Http\Controllers;
use Illuminate\Support\Collection;
use App\Models\Employee;
use App\Models\Data;
use Illuminate\Http\Request;

use ProtoneMedia\Splade\SpladeTable;

use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;


class EmployeeController extends Controller
{
    public $detail;
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $employeeku = Employee::all();
        return view('employee.index', [
            'em' => SpladeTable::for(Employee::class)
                ->defaultSort('id')
                ->column(key: 'id', sortable: true)
                ->column(key: 'uid', searchable: true, sortable: true)
                ->column(key: 'nama', searchable: true, sortable: true)
                ->column(key: 'gender', searchable: true, sortable: true)
                ->column(key: 'tgl_lahir', searchable: true, sortable: true)
                ->column(key: 'tgl_masuk', searchable: true, sortable: true)
                ->column(label: 'Actions')
                ->paginate(5),
            ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('employee.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        Employee::create([
            'uid'     => $request->uid,
            'nama'     => $request->nama,
            'gender'     => $request->gender,
            'tgl_lahir'   => $request->tgl_lahir,
            'tgl_masuk'   => $request->tgl_masuk,
        ]);
        return redirect()->route('employee.index')->with('message', 'data created.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Employee $employee)
    {

        $detail = Data::where('employees_id', $employee->id)->distinct()->orderBy('created_at', 'ASC')->get();
        // $detail = Data::select('date')->where('employees_id', $employee->id)->distinct('date')->orderBy('created_at', 'ASC')->get();
        
        
        $globalSearch = AllowedFilter::callback('global', function ($query, $value) {
            $query->where(function ($query) use ($value) {
                Collection::wrap($value)->each(function ($value) use ($query) {
                    $query
                        ->orWhere('name', 'LIKE', "%{$value}%")
                        ->orWhere('email', 'LIKE', "%{$value}%");
                });
            });
        });

        $detail_employee = QueryBuilder::for(Data::select('employees_id','date','uid','sn')->distinct('date')->where('employees_id', $employee->id));

        return view('employee.show', compact('employee','detail'), [
            'em' => SpladeTable::for($detail_employee)
                ->defaultSort('date')
                ->column(key: 'date', searchable: true, sortable: true)
                ->column(key: 'uid', searchable: true, sortable: true)
                ->column(key: 'sn', searchable: true, sortable: true)
                ->column(label: 'Actions')
                ->paginate(10),
            ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Employee $employee)
    {
        return view('employee.edit', compact('employee'));
        
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Employee $employee)
    {
        $employee->update([
            'uid'     => $request->uid,
            'nama'     => $request->nama,
            'gender'     => $request->gender,
            'tgl_lahir'   => $request->tgl_lahir,
            'tgl_masuk'   => $request->tgl_masuk,
        ]);

        return redirect()->route('employee.index')->with('message', 'Data updated.');

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Employee $employee)
    {
        $employee->delete();
        return redirect()->route('employee.index')->with('message', 'Post deleted.');

    }

    public function detail($id, $tgl){
        $detail = Data::where('employees_id', $id)->where('date', $tgl)->orderBy('created_at', 'ASC')->get();

        return view('employee.detail', compact('detail'));
    }
}
