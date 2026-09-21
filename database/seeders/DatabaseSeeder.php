<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Medicine;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Users
        $admin = User::create([
            'name' => 'Apoteker Admin',
            'email' => 'admin@apotek.com',
            'role' => 'admin',
            'phone' => '081234567890',
            'password' => Hash::make('password'),
        ]);

        $kasir = User::create([
            'name' => 'Siti Kasir',
            'email' => 'kasir@apotek.com',
            'role' => 'kasir',
            'phone' => '082345678901',
            'password' => Hash::make('password'),
        ]);

        // 2. Units
        $units = [
            'Tablet', 'Kapsul', 'Strip', 'Botol', 'Box', 'Tube', 'Sachet', 'Ampul', 'Pcs'
        ];
        $unitModels = [];
        foreach ($units as $unitName) {
            $unitModels[$unitName] = Unit::create(['name' => $unitName]);
        }

        // 3. Categories
        $categoriesData = [
            ['name' => 'Analgesik & Antipiretik', 'slug' => 'analgesik-antipiretik', 'description' => 'Pereda nyeri dan penurun demam'],
            ['name' => 'Antibiotik & Antimikroba', 'slug' => 'antibiotik-antimikroba', 'description' => 'Obat infeksi bakteri (resep dokter)'],
            ['name' => 'Vitamin & Suplemen', 'slug' => 'vitamin-suplemen', 'description' => 'Penjaga daya tahan tubuh dan nutrisi'],
            ['name' => 'Obat Batuk & Flu', 'slug' => 'obat-batuk-flu', 'description' => 'Mengatasi gejala batuk, pilek, dan flu'],
            ['name' => 'Antihistamin & Alergi', 'slug' => 'antihistamin-alergi', 'description' => 'Meredakan reaksi alergi dan gatal'],
            ['name' => 'Pencernaan & Maag', 'slug' => 'pencernaan-maag', 'description' => 'Obat maag, asam lambung, dan diare'],
            ['name' => 'Salep & Antiseptik Kulit', 'slug' => 'salep-antiseptik-kulit', 'description' => 'Perawatan luka dan infeksi kulit'],
        ];
        $catModels = [];
        foreach ($categoriesData as $cat) {
            $catModels[$cat['slug']] = Category::create($cat);
        }

        // 4. Medicines
        $medicinesData = [
            [
                'code' => 'MED-001',
                'name' => 'Paracetamol 500mg',
                'category_id' => $catModels['analgesik-antipiretik']->id,
                'unit_id' => $unitModels['Strip']->id,
                'purchase_price' => 4500,
                'selling_price' => 7000,
                'stock' => 120,
                'min_stock' => 20,
                'expired_date' => now()->addMonths(18)->format('Y-m-d'),
                'location_rack' => 'Rak A-01',
                'description' => 'Meredakan sakit kepala, sakit gigi, dan demam.',
                'is_prescription' => false,
            ],
            [
                'code' => 'MED-002',
                'name' => 'Sanmol Forte Syrup 60ml',
                'category_id' => $catModels['analgesik-antipiretik']->id,
                'unit_id' => $unitModels['Botol']->id,
                'purchase_price' => 24000,
                'selling_price' => 32000,
                'stock' => 35,
                'min_stock' => 10,
                'expired_date' => now()->addMonths(14)->format('Y-m-d'),
                'location_rack' => 'Rak A-02',
                'description' => 'Sirup penurun panas dan pereda nyeri untuk anak dan dewasa.',
                'is_prescription' => false,
            ],
            [
                'code' => 'MED-003',
                'name' => 'Amoxicillin 500mg',
                'category_id' => $catModels['antibiotik-antimikroba']->id,
                'unit_id' => $unitModels['Strip']->id,
                'purchase_price' => 8000,
                'selling_price' => 13500,
                'stock' => 8, // Stok menipis
                'min_stock' => 15,
                'expired_date' => now()->addMonths(10)->format('Y-m-d'),
                'location_rack' => 'Rak B-01 (Resep)',
                'description' => 'Antibiotik spektrum luas untuk infeksi bakteri.',
                'is_prescription' => true,
            ],
            [
                'code' => 'MED-004',
                'name' => 'Enervon-C Multivitamin',
                'category_id' => $catModels['vitamin-suplemen']->id,
                'unit_id' => $unitModels['Strip']->id,
                'purchase_price' => 6000,
                'selling_price' => 9500,
                'stock' => 90,
                'min_stock' => 15,
                'expired_date' => now()->addMonths(20)->format('Y-m-d'),
                'location_rack' => 'Rak C-01',
                'description' => 'Suplemen vitamin C dan vitamin B kompleks harian.',
                'is_prescription' => false,
            ],
            [
                'code' => 'MED-005',
                'name' => 'OBH Combi Batuk Berdahak 100ml',
                'category_id' => $catModels['obat-batuk-flu']->id,
                'unit_id' => $unitModels['Botol']->id,
                'purchase_price' => 16500,
                'selling_price' => 22000,
                'stock' => 4, // Stok sangat menipis
                'min_stock' => 10,
                'expired_date' => now()->addMonths(12)->format('Y-m-d'),
                'location_rack' => 'Rak D-01',
                'description' => 'Obat batuk hitam untuk mengencerkan dahak.',
                'is_prescription' => false,
            ],
            [
                'code' => 'MED-006',
                'name' => 'Cetirizine 10mg',
                'category_id' => $catModels['antihistamin-alergi']->id,
                'unit_id' => $unitModels['Strip']->id,
                'purchase_price' => 4000,
                'selling_price' => 7500,
                'stock' => 65,
                'min_stock' => 10,
                'expired_date' => now()->addMonths(16)->format('Y-m-d'),
                'location_rack' => 'Rak B-03',
                'description' => 'Antihistamin untuk rinitis alergi dan urtikaria.',
                'is_prescription' => false,
            ],
            [
                'code' => 'MED-007',
                'name' => 'Promag Tablet Kunyah',
                'category_id' => $catModels['pencernaan-maag']->id,
                'unit_id' => $unitModels['Strip']->id,
                'purchase_price' => 6500,
                'selling_price' => 9500,
                'stock' => 110,
                'min_stock' => 20,
                'expired_date' => now()->addMonths(22)->format('Y-m-d'),
                'location_rack' => 'Rak A-04',
                'description' => 'Meringankan gejala sakit maag dan nyeri lambung.',
                'is_prescription' => false,
            ],
            [
                'code' => 'MED-008',
                'name' => 'Omeprazole 20mg',
                'category_id' => $catModels['pencernaan-maag']->id,
                'unit_id' => $unitModels['Strip']->id,
                'purchase_price' => 9000,
                'selling_price' => 15000,
                'stock' => 45,
                'min_stock' => 10,
                'expired_date' => now()->addMonths(15)->format('Y-m-d'),
                'location_rack' => 'Rak B-02',
                'description' => 'Inhibitor pompa proton untuk tukak lambung dan GERD.',
                'is_prescription' => true,
            ],
            [
                'code' => 'MED-009',
                'name' => 'Betadine Antiseptic Solution 30ml',
                'category_id' => $catModels['salep-antiseptik-kulit']->id,
                'unit_id' => $unitModels['Botol']->id,
                'purchase_price' => 21000,
                'selling_price' => 28000,
                'stock' => 25,
                'min_stock' => 5,
                'expired_date' => now()->addMonths(24)->format('Y-m-d'),
                'location_rack' => 'Rak E-01',
                'description' => 'Povidone Iodine 10% untuk pencegahan infeksi pada luka.',
                'is_prescription' => false,
            ],
            [
                'code' => 'MED-010',
                'name' => 'Bioplacenton Gel 15g',
                'category_id' => $catModels['salep-antiseptik-kulit']->id,
                'unit_id' => $unitModels['Tube']->id,
                'purchase_price' => 23000,
                'selling_price' => 31000,
                'stock' => 18,
                'min_stock' => 5,
                'expired_date' => now()->addMonths(8)->format('Y-m-d'),
                'location_rack' => 'Rak E-02',
                'description' => 'Salep untuk luka bakar ringan, luka bernanah, dan luka sayat.',
                'is_prescription' => false,
            ],
        ];

        $createdMedicines = [];
        foreach ($medicinesData as $med) {
            $createdMedicines[] = Medicine::create($med);
        }

        // 5. Sample Transactions for Dashboard Analytics
        $trx1 = Transaction::create([
            'invoice_number' => 'INV-' . date('Ymd') . '-0001',
            'user_id' => $kasir->id,
            'customer_name' => 'Budi Santoso',
            'total_amount' => 46000,
            'paid_amount' => 50000,
            'change_amount' => 4000,
            'payment_method' => 'Cash',
            'notes' => 'Pembelian obat bebas',
            'transaction_date' => now()->subHours(4),
        ]);

        TransactionItem::create([
            'transaction_id' => $trx1->id,
            'medicine_id' => $createdMedicines[0]->id, // Paracetamol
            'quantity' => 2,
            'unit_price' => 7000,
            'subtotal' => 14000,
        ]);
        TransactionItem::create([
            'transaction_id' => $trx1->id,
            'medicine_id' => $createdMedicines[1]->id, // Sanmol Forte
            'quantity' => 1,
            'unit_price' => 32000,
            'subtotal' => 32000,
        ]);

        $trx2 = Transaction::create([
            'invoice_number' => 'INV-' . date('Ymd') . '-0002',
            'user_id' => $kasir->id,
            'customer_name' => 'Rina Wijaya',
            'total_amount' => 47000,
            'paid_amount' => 47000,
            'change_amount' => 0,
            'payment_method' => 'QRIS',
            'notes' => 'Pembelian suplemen & obat alergi',
            'transaction_date' => now()->subHours(2),
        ]);

        TransactionItem::create([
            'transaction_id' => $trx2->id,
            'medicine_id' => $createdMedicines[3]->id, // Enervon C
            'quantity' => 2,
            'unit_price' => 9500,
            'subtotal' => 19000,
        ]);
        TransactionItem::create([
            'transaction_id' => $trx2->id,
            'medicine_id' => $createdMedicines[8]->id, // Betadine
            'quantity' => 1,
            'unit_price' => 28000,
            'subtotal' => 28000,
        ]);

        $trx3 = Transaction::create([
            'invoice_number' => 'INV-' . date('Ymd') . '-0003',
            'user_id' => $admin->id,
            'customer_name' => 'Dr. Hendra (Klinik)',
            'total_amount' => 70000,
            'paid_amount' => 100000,
            'change_amount' => 30000,
            'payment_method' => 'Transfer',
            'notes' => 'Resep antibiotik & lambung',
            'transaction_date' => now()->subMinutes(30),
        ]);

        TransactionItem::create([
            'transaction_id' => $trx3->id,
            'medicine_id' => $createdMedicines[2]->id, // Amoxicillin
            'quantity' => 2,
            'unit_price' => 13500,
            'subtotal' => 27000,
        ]);
        TransactionItem::create([
            'transaction_id' => $trx3->id,
            'medicine_id' => $createdMedicines[7]->id, // Omeprazole
            'quantity' => 2,
            'unit_price' => 15000,
            'subtotal' => 30000,
        ]);
        TransactionItem::create([
            'transaction_id' => $trx3->id,
            'medicine_id' => $createdMedicines[5]->id, // Cetirizine
            'quantity' => 1,
            'unit_price' => 7500,
            'subtotal' => 7500,
        ]);
    }
}
