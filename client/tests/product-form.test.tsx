import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductForm, {
  draftFromProduct,
  emptyProductDraft,
  payloadFromDraft,
  saveProduct,
} from '@/components/admin/product-form';
import { api } from '@/lib/api';
import { productFixture } from './fixtures';

vi.mock('@/lib/api', () => ({
  api: {
    products: {
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

interface HarnessProps {
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  saving?: boolean;
  creating?: boolean;
  error?: string | null;
}

function Harness({
  onSubmit = vi.fn(),
  saving = false,
  creating = true,
  error = null,
}: HarnessProps) {
  const [draft, setDraft] = useState(emptyProductDraft);

  return (
    <ProductForm
      draft={draft}
      onChange={setDraft}
      onSubmit={onSubmit}
      onCancel={vi.fn()}
      saving={saving}
      creating={creating}
      error={error}
    />
  );
}

describe('ProductForm', () => {
  it('updates the controlled fields as the operator types', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByLabelText('Name'), 'Aurora Display');
    await user.type(screen.getByLabelText('Description'), 'A 27-inch colour accurate display.');
    await user.type(screen.getByLabelText('Price'), '45000');
    await user.type(screen.getByLabelText('Stock'), '7');
    await user.type(screen.getByLabelText('Image URL'), 'https://example.com/display.png');
    await user.click(screen.getByLabelText('Feature on the storefront'));

    expect(screen.getByLabelText('Name')).toHaveValue('Aurora Display');
    expect(screen.getByLabelText('Description')).toHaveValue('A 27-inch colour accurate display.');
    expect(screen.getByLabelText('Price')).toHaveValue(45000);
    expect(screen.getByLabelText('Stock')).toHaveValue(7);
    expect(screen.getByLabelText('Image URL')).toHaveValue('https://example.com/display.png');
    expect(screen.getByLabelText('Feature on the storefront')).toBeChecked();
  });

  it('submits the form when the create button is pressed', async () => {
    const preventDefault = vi.fn();
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      preventDefault();
    });
    const user = userEvent.setup();
    render(<Harness onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Name'), 'Aurora Display');
    await user.type(screen.getByLabelText('Description'), 'A 27-inch colour accurate display.');
    await user.type(screen.getByLabelText('Price'), '45000');
    await user.click(screen.getByRole('button', { name: 'Create product' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  it('shows the error and disables submission while saving', () => {
    render(<Harness saving creating={false} error="The catalogue rejected that product" />);

    expect(screen.getByText('The catalogue rejected that product')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  });

  it('maps a product to a draft and back to an API payload', () => {
    const draft = draftFromProduct(productFixture());

    expect(draft).toEqual({
      name: 'Aurora Pro 14 Ultrabook',
      description: 'A 14-inch ultrabook with a 120Hz LTPO display and all-day battery.',
      price: '118000',
      compareAtPrice: '135000',
      stock: '18',
      imageUrl: 'https://example.com/laptop.png',
      featured: true,
    });
    expect(payloadFromDraft(draft)).toEqual({
      name: 'Aurora Pro 14 Ultrabook',
      description: 'A 14-inch ultrabook with a 120Hz LTPO display and all-day battery.',
      price: 118000,
      compareAtPrice: 135000,
      stock: 18,
      imageUrl: 'https://example.com/laptop.png',
      featured: true,
      active: true,
    });
  });

  it('normalises empty optional fields', () => {
    expect(
      payloadFromDraft({
        ...emptyProductDraft,
        name: 'Bare product',
        description: 'A minimal product record.',
      }),
    ).toMatchObject({
      price: 0,
      compareAtPrice: null,
      stock: 0,
      imageUrl: null,
      featured: false,
    });
  });
});

describe('saveProduct', () => {
  const create = vi.mocked(api.products.create);
  const update = vi.mocked(api.products.update);

  beforeEach(() => {
    create.mockReset();
    update.mockReset();
  });

  it('creates a product when there is no editing id', async () => {
    const draft = draftFromProduct(productFixture());
    const created = productFixture({ id: 'product-new', slug: 'new-product' });
    create.mockResolvedValue({ product: created });

    const result = await saveProduct({ draft });

    expect(create).toHaveBeenCalledWith(payloadFromDraft(draft));
    expect(update).not.toHaveBeenCalled();
    expect(result).toEqual(created);
  });

  it('updates the selected product when an editing id is present', async () => {
    const draft = draftFromProduct(productFixture({ name: 'Updated name' }));
    const updated = productFixture({ id: 'product-9', name: 'Updated name' });
    update.mockResolvedValue({ product: updated });

    const result = await saveProduct({ editingId: 'product-9', draft });

    expect(update).toHaveBeenCalledWith('product-9', payloadFromDraft(draft));
    expect(create).not.toHaveBeenCalled();
    expect(result).toEqual(updated);
  });

  it('propagates API failures to the caller', async () => {
    const draft = draftFromProduct(productFixture());
    create.mockRejectedValue(new Error('The catalogue rejected that product'));

    await expect(saveProduct({ draft })).rejects.toThrow('The catalogue rejected that product');
  });
});
