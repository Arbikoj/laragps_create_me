@seoTitle(__('Maps'))

<x-app-layout>
    <x-slot:header>
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Maps') }}
        </h2>
    </x-slot>

        <div class="py-12">
            <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
                {{ Route::current()->getName() }}
                <div class="bg-white overflow-hidden shadow-xl sm:rounded-lg">
                    ini adalah maps 
                    {{ $nama }}
                    {{-- <?php echo json_encode($initialMarkers); ?> --}}

                    <div id="map"></div>
                </div>
            </div>
        </div>
</x-app-layout>