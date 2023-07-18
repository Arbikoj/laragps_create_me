<x-splade-modal>
    <x-splade-form>
        <x-splade-input name="uid" placeholder="title" :label="__('UID')"/>
        <x-splade-input name="sn" placeholder="title" :label="__('Serial Number')"/>
        <x-splade-input name="lat" placeholder="type here" :label="__('Lat')"/>
        <x-splade-input name="long" placeholder="type here" :label="__('long')"/>
        <x-splade-input name="date" type="date" placeholder="type here" :label="__('DAte')"/>
        <x-splade-submit class="mt-3" :label="__('Add Data')" />
    </x-splade-form>
</x-splade-modal>