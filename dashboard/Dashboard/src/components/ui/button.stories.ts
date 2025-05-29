import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './button';

import { action } from '@storybook/addon-actions';

const meta: Meta<typeof Button> = {
  title: 'Components/ui/button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      description: 'The variant of the button',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      description: 'The size of the button',
      options: ['default', 'sm', 'lg', 'icon'],
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    onClick: {
      action: 'clicked',
      description: 'The function to call when the button is clicked',
    },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default button',
    variant: 'default',
    size: 'default',
    disabled: false,
    onClick: action('default clicked'),
    asChild: false,
    className: 'shadow-lg',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Destructive button',
    variant: 'destructive',
    size: 'default',
    disabled: false,
    onClick: action('destructive clicked'),
    asChild: false,
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline button',
    variant: 'outline',
    size: 'default',
    disabled: false,
    onClick: action('outline clicked'),
    asChild: false,
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary button',
    variant: 'secondary',
    size: 'default',
    disabled: false,
    onClick: action('secondary clicked'),
    asChild: false,
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost button',
    variant: 'ghost',
    size: 'default',
    disabled: false,
    onClick: action('ghost clicked'),
    asChild: false,
  },
};

export const Link: Story = {
  args: {
    children: 'Link button',
    variant: 'link',
    size: 'default',
    disabled: false,
    onClick: action('link clicked'),
    asChild: false,
  },
};
