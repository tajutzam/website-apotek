<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Medicine;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ApotekWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Category $category;
    protected Unit $unit;
    protected Medicine $medicine;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'email' => 'admin@apotek.com',
            'password' => Hash::make('password'),
        ]);

        $this->category = Category::create([
            'name' => 'Analgesik',
            'slug' => 'analgesik-123',
            'description' => 'Pereda nyeri',
        ]);

        $this->unit = Unit::create([
            'name' => 'Strip',
        ]);

        $this->medicine = Medicine::create([
            'code' => 'MED-001',
            'name' => 'Paracetamol 500mg',
            'category_id' => $this->category->id,
            'unit_id' => $this->unit->id,
            'purchase_price' => 5000,
            'selling_price' => 8000,
            'stock' => 50,
            'min_stock' => 10,
            'expired_date' => '2027-12-31',
            'location_rack' => 'Rak A-1',
            'description' => 'Pereda demam',
            'is_prescription' => false,
        ]);
    }

    public function test_login_page_renders_inertia_data_properly(): void
    {
        $response = $this->get('/login');
        $response->assertStatus(200);
        $content = $response->getContent();
        $this->assertTrue(
            str_contains($content, 'data-page="app"') || str_contains($content, 'id="app"')
        );
    }

    public function test_user_can_login_with_correct_credentials(): void
    {
        $response = $this->post('/login', [
            'email' => 'admin@apotek.com',
            'password' => 'password',
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertAuthenticatedAs($this->user);
    }

    public function test_user_cannot_login_with_incorrect_password(): void
    {
        $response = $this->post('/login', [
            'email' => 'admin@apotek.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_authenticated_user_can_access_dashboard(): void
    {
        $response = $this->actingAs($this->user)->get('/dashboard');
        $response->assertStatus(200);
    }

    public function test_user_can_create_medicine(): void
    {
        $response = $this->actingAs($this->user)->post('/medicines', [
            'code' => 'MED-002',
            'name' => 'Amoxicillin 500mg',
            'category_id' => $this->category->id,
            'unit_id' => $this->unit->id,
            'purchase_price' => 8000,
            'selling_price' => 12000,
            'stock' => 30,
            'min_stock' => 5,
            'expired_date' => '2028-01-01',
            'location_rack' => 'Rak B-1',
            'description' => 'Antibiotik',
            'is_prescription' => true,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('medicines', [
            'code' => 'MED-002',
            'name' => 'Amoxicillin 500mg',
        ]);
    }

    public function test_user_can_update_medicine(): void
    {
        $response = $this->actingAs($this->user)->put("/medicines/{$this->medicine->id}", [
            'code' => 'MED-001',
            'name' => 'Paracetamol 500mg Updated',
            'category_id' => $this->category->id,
            'unit_id' => $this->unit->id,
            'purchase_price' => 5500,
            'selling_price' => 8500,
            'stock' => 45,
            'min_stock' => 10,
            'expired_date' => '2027-12-31',
            'location_rack' => 'Rak A-1',
            'description' => 'Pereda demam dan sakit kepala',
            'is_prescription' => false,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('medicines', [
            'id' => $this->medicine->id,
            'name' => 'Paracetamol 500mg Updated',
            'selling_price' => 8500,
        ]);
    }

    public function test_user_can_delete_medicine(): void
    {
        $response = $this->actingAs($this->user)->delete("/medicines/{$this->medicine->id}");
        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('medicines', ['id' => $this->medicine->id]);
    }

    public function test_user_can_perform_pos_checkout(): void
    {
        $initialStock = $this->medicine->stock;

        $response = $this->actingAs($this->user)->post('/pos', [
            'customer_name' => 'Ahmad Fauzi',
            'payment_method' => 'Cash',
            'paid_amount' => 50000,
            'notes' => 'Catatan test',
            'items' => [
                [
                    'medicine_id' => $this->medicine->id,
                    'quantity' => 3,
                ],
            ],
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('transactions', [
            'customer_name' => 'Ahmad Fauzi',
            'total_amount' => 24000, // 3 * 8000
            'paid_amount' => 50000,
            'change_amount' => 26000,
        ]);

        // Check stock deduction
        $this->assertEquals($initialStock - 3, $this->medicine->fresh()->stock);
    }
}
