import flushPromises from 'flush-promises';
import { useField } from '@/vee-validate';
import { mountWithHoc, setValue } from './helpers';

describe('useField()', () => {
  const REQUIRED_MESSAGE = 'Field is required';
  test('validates when value changes', async () => {
    mountWithHoc({
      setup() {
        const { value, errorMessage } = useField('field', val => (val ? true : REQUIRED_MESSAGE));

        return {
          value,
          errorMessage,
        };
      },
      template: `
      <input name="field" v-model="value" />
      <span>{{ errorMessage }}</span>
    `,
    });

    const input = document.querySelector('input');
    const error = document.querySelector('span');

    setValue(input as any, '');
    await flushPromises();
    expect(error?.textContent).toBe(REQUIRED_MESSAGE);
  });

  test('valid flag is true after reset', async () => {
    mountWithHoc({
      setup() {
        const { value, meta, resetField } = useField('field', val => (val ? true : REQUIRED_MESSAGE));

        return {
          value,
          meta,
          resetField,
        };
      },
      template: `
      <input name="field" v-model="value" />
      <span id="meta">{{ meta.valid ? 'valid' : 'invalid' }}</span>
      <button @click="resetField()">Reset</button>
    `,
    });

    const input = document.querySelector('input') as HTMLInputElement;
    const meta = document.querySelector('#meta');

    await flushPromises();
    expect(meta?.textContent).toBe('invalid');

    setValue(input, '');
    await flushPromises();
    expect(meta?.textContent).toBe('invalid');

    // trigger reset
    document.querySelector('button')?.click();
    await flushPromises();
    expect(meta?.textContent).toBe('valid');
  });

  test('valid flag is synced with fields errors length', async () => {
    mountWithHoc({
      setup() {
        const { value, meta, resetField } = useField('field', val => (val ? true : REQUIRED_MESSAGE));

        return {
          value,
          meta,
          resetField,
        };
      },
      template: `
      <input name="field" v-model="value" />
      <span id="meta">{{ meta.valid ? 'valid' : 'invalid' }}</span>
      <button @click="resetField({ errors: ['bad'] })">Reset</button>
    `,
    });

    await flushPromises();
    const meta = document.querySelector('#meta');
    const input = document.querySelector('input') as HTMLInputElement;

    expect(meta?.textContent).toBe('invalid');

    setValue(input, '12');
    await flushPromises();
    expect(meta?.textContent).toBe('valid');

    // trigger reset
    document.querySelector('button')?.click();
    await flushPromises();
    expect(meta?.textContent).toBe('invalid');
  });
});
