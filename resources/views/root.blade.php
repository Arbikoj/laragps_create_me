<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel='stylesheet' href='https://unpkg.com/leaflet@1.8.0/dist/leaflet.css' crossorigin='' />

        @spladeHead
        @vite('resources/js/app.js')
        {{-- @vite('resources/js/serial.js') --}}
        {{-- @vite('resources/js/maps.js') --}}
        {{-- @vite('resources/js/ajax/mapscoordinates.js') --}}
    </head>
    <body class="font-sans antialiased">
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

        {{-- maps --}}
        <script src='https://unpkg.com/leaflet@1.8.0/dist/leaflet.js' crossorigin=''></script>
        @splade
    </body>
</html>
