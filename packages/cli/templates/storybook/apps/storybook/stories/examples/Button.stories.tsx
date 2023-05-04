import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';

const meta = {
  component: Button,
  argTypes: {
    children: {
      type: 'string',
      defaultValue: 'This is a button',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'This is an example button',
  },
};

function Button({ children }: { children: ReactNode }) {
  return <button>{children}</button>;
}
