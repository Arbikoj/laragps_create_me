@seoTitle(__('Detail'))

<x-app-layout>
    <x-slot:header>
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Employee') }}
            {{-- {{ $employee->nama }} --}}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-xl sm:rounded-lg">
                <div id="map"></div>
                <br>
                {{-- {{ $employee->id }}
                {{ $employee->id }}  
                {{ $employee->uid }}  
                {{ $employee->nama }}  
                {{ $employee->gender }}  

                @foreach ($detail as $item)
                <br> lat : {{ $item->lat }} long : {{ $item->long }}
                @endforeach --}}

                <x-splade-table :for="$em">
                    <x-splade-cell actions>
                        <Link modal href="{{ route('employee.edit', $item->id) }}" class="px-4 py-1 bg-indigo-100 border border-indigo-400 rounded-md text-indigo-600 hover:bg-indigo-200 mr-4"> Edit </Link>
                        <Link href="{{ route('employee.destroy', $item->id) }}" method="DELETE" class="px-4 py-1 bg-red-100 border border-red-400 rounded-md text-red-600 hover:bg-red-200 mr-4"> Delete </Link>
                        <Link href="{{ route('employee.show', $item->id) }}" class="px-4 py-1 bg-indigo-100 border border-indigo-400 rounded-md text-indigo-600 hover:bg-indigo-200 mr-4"> Show </Link>

                    </x-splade-cell>
                </x-splade-table> 
            </div>
        </div>
    </div>
    <x-splade-script src="https://code.jquery.com/jquery-3.6.0.min.js"></x-splade-script>

    <x-splade-script>

    </x-splade-script>


    <x-splade-script>
        console.log("show")
        var latlngs = [
            [-7.275791355265137, 112.79304304779649],
            [-7.276619222747623, 112.79021996428808],
            [-7.278834524356996, 112.79020165860294],
            [-7.279342952691109, 112.78974401647433],
            [-7.279869538572467, 112.78606457376024],
            [-7.280541388648063, 112.7807925364166],
            [-7.277490818149759, 112.78088406484233],
        ];

        var x = [
            <?php foreach ($detail as $item) { ?>
            
                [{{ $item->lat }},{{ $item->long }}],
    
                <?php } ?>
            ]
    
            
            console.log(x)
        


        function initMap(dataku) {
            mapku = L.map('map', {
                center: {
                    lat: -7.275435177186381,
                    lng: 112.79366084960017
                },
                zoom: 15
            });
            L.marker([-7.275791355265137, 112.79304304779649]).addTo(mapku);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap'
            }).addTo(mapku);
        
            var polyline = L.polyline(dataku, { color: 'red' }).addTo(mapku);
        
            // zoom the map to the polyline
            mapku.fitBounds(polyline.getBounds());
        }

        initMap(x);

        
    </x-splade-script>
</x-app-layout>