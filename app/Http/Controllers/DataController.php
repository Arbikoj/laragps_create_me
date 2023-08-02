<?php

namespace App\Http\Controllers;

use App\Models\Data;
use App\Models\Employee;
use Illuminate\Http\Request;

use ProtoneMedia\Splade\SpladeTable;

class DataController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return view('data.data', [
            'dataku' => SpladeTable::for(Data::class)
                ->defaultSort('id')
                ->column(key: 'id', sortable: true)
                ->column(key: 'uid', searchable: true, sortable: true)
                ->column(key: 'lat', searchable: true, sortable: true)
                ->column(key: 'long', searchable: true, sortable: true)
                ->column(label: 'Actions')
                ->paginate(5),
            ]        
        );
    }

    public function json($id){
        $jsondata = Data::select('lat', 'long')->where('employees_id', $id)->orderBy('created_at', 'ASC')->get();
        // $jsondata = Data::all();
        return response()->json($jsondata);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('data.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Data::create(
        //     Request::validate([
        //     'uid' => ['required', 'max:50'],
        //     'lat' => ['required'],
        //     'long' => ['required'],
        //     'date' => ['required'],
        //     ])
        // );
        Data::create([
            'uid'     => $request->uid,
            'employees_id' => 2,
            'sn'     => $request->sn,
            'lat'     => $request->lat,
            'long'   => $request->long,
            'date'   => $request->date,
        ]);
        return redirect()->route('data.index')->with('message', 'data created.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Data $data)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Data $data)
    {
        return view('data.edit', compact('data'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Data $data)
    {
        $data->update([
            'uid'     => $request->uid,
            'sn'     => $request->sn,
            'lat'     => $request->lat,
            'long'   => $request->long,
            'date'   => $request->date,
        ]);

        return redirect()->route('data.index')->with('message', 'Data updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Data $data)
    {
        $data->delete();
        return redirect()->route('data.index')->with('message', 'Post deleted.');
    }
    // /employee/{slug}/{sn}/{uid}/{lat}/{long}/{date}
    public function tambah($uid,$sn,$lat,$long,$date)
    {
        $n = Employee::where('uid',$uid)->first();
        // $foreignId = $n->id;
        Data::create([
            'employees_id' => $n->id,
            'uid'     => $uid,
            'sn'     => $sn,
            'lat'     => $lat,
            'long'   => $long,
            'date'   => $date,
        ]);
        return redirect()->back();

    }
}
