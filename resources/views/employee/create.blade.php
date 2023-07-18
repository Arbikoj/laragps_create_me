<x-splade-modal>
    <x-splade-form>
        <x-splade-input name="uid" placeholder="title" :label="__('UID')"/>
        <x-splade-input name="nama" placeholder="title" :label="__('Nama')"/>
        <x-splade-input name="gender" placeholder="type here" :label="__('Gender')"/>
        <x-splade-input name="tgl_lahir" type="date" placeholder="type here" :label="__('Tgl Lahir')"/>
        <x-splade-input name="tgl_masuk" type="date" placeholder="type here" :label="__('Tgl Masuk')"/>
        <x-splade-submit class="mt-3" :label="__('Add Data')" />
    </x-splade-form>
</x-splade-modal>