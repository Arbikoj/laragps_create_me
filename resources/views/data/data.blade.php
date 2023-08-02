@seoTitle(__('Data'))
{{-- @vite('resources/js/serial.js') --}}
<x-app-layout>
    <x-slot:header>
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Data') }}
        </h2>
    </x-slot>



    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-xl sm:rounded-lg p-5">

                <div class="my-3 flex xl:w-1/2 w-full justify-between block">
                    <div class="mr-2">
                        <button id="connect-button" class="px-5 py-2 text-white bg-blue-800 rounded-lg focus:outline-none">Connect</button>
                        <x-splade-button id="readfile-button" class="my-2 hidden">Read File</x-splade-button>

                    </div>
                    <div class="w-full mx-2">
                        <select name="country_code" class="rounded w-full">
                            <option selected value="1">CreateMe GPS</option>
                        </select>
                    </div>
                    
                    <div class="mx-2">
                        <button id="disconnect-button" class="px-5 py-2 text-white bg-blue-800 rounded-lg focus:outline-none opacity-50 cursor-not-allowed">Disconnect</button>
                    </div>
                </div>

                <div class="my-5">
                
                    <Link modal href="{{ route('data.create') }}" class="px-4 py-1 bg-indigo-100 border border-indigo-400 rounded-md text-indigo-600 hover:bg-indigo-200 mr-4"> Add </Link>
                </div>

                <div>
                    <table class="min-w-full text-left text-sm font-light">
                        <thead
                        class="border-b bg-white font-medium dark:border-neutral-500 dark:bg-neutral-600">
                        <tr>
                            <th scope="col" class="px-6 py-2">#</th>
                            <th scope="col" class="px-6 py-2">aksi</th>
                        </tr>
                        </thead>
                        <tbody id="data-file">
                        
                        </tbody>
                    </table>
                </div>

                {{-- TABEL --}}
                {{-- <x-splade-table :for="$dataku">

                    <x-splade-cell actions>
                        <Link modal href="{{ route('data.edit', $item->id) }}" class="px-4 py-1 bg-indigo-100 border border-indigo-400 rounded-md text-indigo-600 hover:bg-indigo-200 mr-4"> Edit </Link>
                        <Link href="{{ route('data.destroy', $item->id) }}" method="DELETE" class="px-4 py-1 bg-red-100 border border-red-400 rounded-md text-red-600 hover:bg-red-200"> Delete </Link>
                    </x-splade-cell>
                </x-splade-table> --}}
            </div>
        </div>
    </div>

    <x-splade-script>
        var gogo = "";  
        var fileku = '';
        fileku = `
        <p> hehe 354 </p>
        `;
        

        class LineBreakTransformer {
            constructor() {
                // A container for holding stream data until a new line.
                this.chunks = "";
            }
        
            transform(chunk, controller) {
                // Append new chunks to existing chunks.
                this.chunks += chunk;
                // For each line breaks in chunks, send the parsed lines out.
                const lines = this.chunks.split("\r\n");
                this.chunks = lines.pop();
                lines.forEach((line) => controller.enqueue(line));
            }
        
            flush(controller) {
                // When the stream is closed, flush any remaining chunks out.
                controller.enqueue(this.chunks);
            }
        }


        
        document.querySelector('#connect-button').addEventListener('click', async() => {
            console.log("connect");
            
            var sumdata = "";
            // Request serial port access
            port = await navigator.serial.requestPort();
    
            // Open the port
            {{-- await port.open({ baudRate: 9600 }); --}}
            await port.open({ baudRate: 9600 });

            {{-- disable button --}}
            document.querySelector('#connect-button').disabled = true;
            document.getElementById("connect-button").classList.add("opacity-50");
            document.getElementById("connect-button").classList.add("cursor-not-allowed");

            document.querySelector('#disconnect-button').disabled = false;
            document.getElementById("disconnect-button").classList.remove("opacity-50");
            document.getElementById("disconnect-button").classList.remove("cursor-not-allowed");
            document.getElementById("readfile-button").style.display = "block";
            {{-- opacity-50 cursor-not-allowed --}}
            
            const textDecoder = new TextDecoderStream();
            const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
            const reader = textDecoder.readable.pipeThrough(new TransformStream(new LineBreakTransformer())).getReader();

            // Listen to data coming from the serial device.
            
            while (true) {
            const { value, done } = await reader.read();
            if (done) {
                // Allow the serial port to be closed later.
                reader.releaseLock();
                break;
            }
            // value is a string.
            
            var dataku = "";
            var tempsub = "";
            dataku = dataku + value;
            
            {{-- for(let a=0; a<=4; a++){
                gogo[a] = dataku;
            } --}}
            {{-- console.log(gogo[0]); --}}
            
            
            console.log(dataku);
            tempsub = dataku;
            if(tempsub.slice(0, 2) == "##"){
                dataku = dataku.substring(2);
                var myArray = dataku.split("*");
                
                console.log(myArray);

                let lengthList = myArray.length;
                for(let a=0; a < lengthList; a++){
                    document.getElementById("data-file").innerHTML += `
                    <tr class="border-b bg-neutral-100 dark:border-neutral-500 dark:bg-neutral-700">
                        <td class="whitespace-nowrap px-6 py-2 font-medium">${myArray[a]}</td>
                        <td class="whitespace-nowrap px-6 py-2 font-medium">
                            <button onclick="
                                const writer = port.writable.getWriter();
                                const data = new Uint8Array([57]); //asci 9
                                writer.write(data);
                                // Allow the serial port to be closed later.
                                writer.releaseLock();   
                            " class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded-lg">upload</button>
                        </td>
                    </tr>
                    `
                }
            }else{
                var [date, time, sn, uid, lat, long] = dataku.split('*');
                console.log(date);
                console.log(time);
                console.log(sn);
                console.log(uid); //angka
                console.log(lat);
                console.log(long);
    
                window.location = ('http://127.0.0.1:8000/employee/'+uid+'/'+sn+'/'+lat+'/'+long+'/'+date+'');
                
            }
            
            {{-- {slug}/{sn}/{uid}/{lat}/{long}/{date} --}}
            {{-- "2023-06-23*09:47:36*11230616001*arbi-id*-6.952174000*110.235268667"; --}}

            }

            console.log(sumdata);
        });

        document.querySelector('#readfile-button').addEventListener('click', async() => {
            document.getElementById("data-file").innerHTML = "";
            console.log("send read data")

            const writer = port.writable.getWriter();

            const data = new Uint8Array([49]); // 1 ascii
            await writer.write(data);


            // Allow the serial port to be closed later.
            writer.releaseLock();
        });

        document.querySelector('#disconnect-button').addEventListener('click', async() => {
            location.reload();
            await port.close();
            console.log("disconnect");
            document.querySelector('#connect-button').disabled = false;
            document.getElementById("connect-button").classList.remove("opacity-50");
            document.getElementById("connect-button").classList.remove("cursor-not-allowed");

            document.querySelector('#disconnect-button').disabled = true;
            document.getElementById("disconnect-button").classList.add("opacity-50");
            document.getElementById("disconnect-button").classList.add("cursor-not-allowed");
        });
    </x-splade-script>
        

    <x-splade-script>
    </x-splade-script>

    <x-splade-script src="resources/js/serial.js"></x-splade-script>
</x-app-layout>