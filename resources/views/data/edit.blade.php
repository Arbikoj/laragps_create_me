<x-splade-modal>
    <x-splade-form :default="$data" action="{{ route('data.update', $data->id) }}" method="PUT">
        {{ $data->id }}
        <x-splade-input name="uid" :label="__('UID')"/>
        <x-splade-input name="sn" :label="__('Serial Number')"/>
        <x-splade-input name="lat" :label="__('Lat')"/>
        <x-splade-input name="long" :label="__('long')"/>
        <x-splade-input name="date" type="date" :label="__('date')"/>
        <x-splade-submit class="mt-3" :label="__('Submit')" />
    </x-splade-form>
</x-splade-modal>