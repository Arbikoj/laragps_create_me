<x-splade-modal>
    <x-splade-form :default="$employee" action="{{ route('employee.update', $employee->id) }}" method="PUT">
        {{ $employee->id }}
        <x-splade-input name="uid" :label="__('UID')"/>
        <x-splade-input name="nama" :label="__('Nama')"/>
        <x-splade-input name="gender" :label="__('Gender')"/>
        <x-splade-input name="tgl_lahir" type="date" :label="__('Tgl lahir')"/>
        <x-splade-input name="tgl_masuk" type="date" :label="__('Tgl masuk')"/>
        <x-splade-submit class="mt-3" :label="__('Submit')" />
    </x-splade-form>
</x-splade-modal>