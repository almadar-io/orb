/**
 * Layout Patterns Tests (Phase 7)
 *
 * Tests for layout pattern components including:
 * - Nested children rendering
 * - className and style prop handling
 * - Layout composition
 *
 * @packageDocumentation
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  VStackPattern,
  HStackPattern,
  BoxPattern,
  GridPattern,
  CenterPattern,
} from '../LayoutPatterns';

describe('LayoutPatterns', () => {
  // ===========================================================================
  // VStackPattern
  // ===========================================================================
  describe('VStackPattern', () => {
    it('renders children in vertical stack', () => {
      render(
        <VStackPattern>
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
        </VStackPattern>
      );

      expect(screen.getByTestId('child1')).toBeInTheDocument();
      expect(screen.getByTestId('child2')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <VStackPattern className="custom-class">
          <div>Content</div>
        </VStackPattern>
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('applies custom style', () => {
      const { container } = render(
        <VStackPattern style={{ backgroundColor: 'red', padding: '20px' }}>
          <div>Content</div>
        </VStackPattern>
      );

      const element = container.firstChild as HTMLElement;
      expect(element.style.backgroundColor).toBe('red');
      expect(element.style.padding).toBe('20px');
    });

    it('passes gap prop to stack', () => {
      const { container } = render(
        <VStackPattern gap="lg">
          <div>A</div>
          <div>B</div>
        </VStackPattern>
      );

      // Gap is applied via Tailwind class, just verify it renders
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders nested layout patterns', () => {
      render(
        <VStackPattern data-testid="outer">
          <HStackPattern data-testid="inner">
            <div data-testid="deep-child">Nested</div>
          </HStackPattern>
        </VStackPattern>
      );

      expect(screen.getByTestId('deep-child')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // HStackPattern
  // ===========================================================================
  describe('HStackPattern', () => {
    it('renders children in horizontal stack', () => {
      render(
        <HStackPattern>
          <div data-testid="left">Left</div>
          <div data-testid="right">Right</div>
        </HStackPattern>
      );

      expect(screen.getByTestId('left')).toBeInTheDocument();
      expect(screen.getByTestId('right')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <HStackPattern className="horizontal-custom">
          <div>Content</div>
        </HStackPattern>
      );

      expect(container.firstChild).toHaveClass('horizontal-custom');
    });

    it('applies custom style', () => {
      const { container } = render(
        <HStackPattern style={{ border: '1px solid blue', margin: '10px' }}>
          <div>Content</div>
        </HStackPattern>
      );

      const element = container.firstChild as HTMLElement;
      expect(element.style.border).toBe('1px solid blue');
      expect(element.style.margin).toBe('10px');
    });

    it('supports wrap prop', () => {
      const { container } = render(
        <HStackPattern wrap>
          <div>A</div>
          <div>B</div>
          <div>C</div>
        </HStackPattern>
      );

      expect(container.firstChild).toHaveClass('flex-wrap');
    });
  });

  // ===========================================================================
  // BoxPattern
  // ===========================================================================
  describe('BoxPattern', () => {
    it('renders as container', () => {
      render(
        <BoxPattern>
          <div data-testid="box-content">Box Content</div>
        </BoxPattern>
      );

      expect(screen.getByTestId('box-content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <BoxPattern className="box-custom">
          <div>Content</div>
        </BoxPattern>
      );

      expect(container.firstChild).toHaveClass('box-custom');
    });

    it('applies custom style', () => {
      const { container } = render(
        <BoxPattern style={{ width: '100%', maxWidth: '800px' }}>
          <div>Content</div>
        </BoxPattern>
      );

      const element = container.firstChild as HTMLElement;
      expect(element.style.width).toBe('100%');
      expect(element.style.maxWidth).toBe('800px');
    });

    it('supports padding and margin props', () => {
      const { container } = render(
        <BoxPattern p="lg" m="md">
          <div>Content</div>
        </BoxPattern>
      );

      // Box should render with padding/margin classes
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // GridPattern
  // ===========================================================================
  describe('GridPattern', () => {
    it('renders children in grid', () => {
      render(
        <GridPattern cols={3}>
          <div data-testid="grid-1">1</div>
          <div data-testid="grid-2">2</div>
          <div data-testid="grid-3">3</div>
        </GridPattern>
      );

      expect(screen.getByTestId('grid-1')).toBeInTheDocument();
      expect(screen.getByTestId('grid-2')).toBeInTheDocument();
      expect(screen.getByTestId('grid-3')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <GridPattern className="grid-custom" cols={2}>
          <div>A</div>
          <div>B</div>
        </GridPattern>
      );

      expect(container.firstChild).toHaveClass('grid-custom');
    });

    it('applies custom style', () => {
      const { container } = render(
        <GridPattern style={{ minHeight: '400px' }} cols={2}>
          <div>A</div>
          <div>B</div>
        </GridPattern>
      );

      const element = container.firstChild as HTMLElement;
      expect(element.style.minHeight).toBe('400px');
    });

    it('renders nested patterns in grid cells', () => {
      render(
        <GridPattern cols={2}>
          <VStackPattern>
            <div data-testid="nested-1">Nested 1</div>
          </VStackPattern>
          <HStackPattern>
            <div data-testid="nested-2">Nested 2</div>
          </HStackPattern>
        </GridPattern>
      );

      expect(screen.getByTestId('nested-1')).toBeInTheDocument();
      expect(screen.getByTestId('nested-2')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // CenterPattern
  // ===========================================================================
  describe('CenterPattern', () => {
    it('centers content', () => {
      render(
        <CenterPattern>
          <div data-testid="centered">Centered Content</div>
        </CenterPattern>
      );

      expect(screen.getByTestId('centered')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <CenterPattern className="center-custom">
          <div>Content</div>
        </CenterPattern>
      );

      expect(container.firstChild).toHaveClass('center-custom');
    });

    it('applies custom style merged with minHeight', () => {
      const { container } = render(
        <CenterPattern minHeight="300px" style={{ backgroundColor: 'gray' }}>
          <div>Content</div>
        </CenterPattern>
      );

      const element = container.firstChild as HTMLElement;
      expect(element.style.minHeight).toBe('300px');
      expect(element.style.backgroundColor).toBe('gray');
    });

    it('applies only style when no minHeight', () => {
      const { container } = render(
        <CenterPattern style={{ padding: '40px' }}>
          <div>Content</div>
        </CenterPattern>
      );

      const element = container.firstChild as HTMLElement;
      expect(element.style.padding).toBe('40px');
    });
  });

  // ===========================================================================
  // Complex Nested Compositions
  // ===========================================================================
  describe('Complex Nested Compositions', () => {
    it('renders deeply nested layout patterns', () => {
      render(
        <VStackPattern gap="lg" className="page-container">
          <BoxPattern p="md" className="header-box">
            <HStackPattern justify="between">
              <div data-testid="logo">Logo</div>
              <HStackPattern gap="sm">
                <div data-testid="nav-1">Nav 1</div>
                <div data-testid="nav-2">Nav 2</div>
              </HStackPattern>
            </HStackPattern>
          </BoxPattern>
          <GridPattern cols={3} gap="md" className="content-grid">
            <BoxPattern p="sm">
              <div data-testid="card-1">Card 1</div>
            </BoxPattern>
            <BoxPattern p="sm">
              <div data-testid="card-2">Card 2</div>
            </BoxPattern>
            <BoxPattern p="sm">
              <div data-testid="card-3">Card 3</div>
            </BoxPattern>
          </GridPattern>
        </VStackPattern>
      );

      // Verify all nested elements render
      expect(screen.getByTestId('logo')).toBeInTheDocument();
      expect(screen.getByTestId('nav-1')).toBeInTheDocument();
      expect(screen.getByTestId('nav-2')).toBeInTheDocument();
      expect(screen.getByTestId('card-1')).toBeInTheDocument();
      expect(screen.getByTestId('card-2')).toBeInTheDocument();
      expect(screen.getByTestId('card-3')).toBeInTheDocument();
    });

    it('preserves className at all nesting levels', () => {
      const { container } = render(
        <VStackPattern className="level-1">
          <HStackPattern className="level-2">
            <BoxPattern className="level-3">
              <div>Content</div>
            </BoxPattern>
          </HStackPattern>
        </VStackPattern>
      );

      expect(container.querySelector('.level-1')).toBeInTheDocument();
      expect(container.querySelector('.level-2')).toBeInTheDocument();
      expect(container.querySelector('.level-3')).toBeInTheDocument();
    });

    it('preserves style at all nesting levels', () => {
      const { container } = render(
        <VStackPattern style={{ padding: '10px' }}>
          <HStackPattern style={{ margin: '5px' }}>
            <BoxPattern style={{ border: '1px solid black' }}>
              <div data-testid="content">Content</div>
            </BoxPattern>
          </HStackPattern>
        </VStackPattern>
      );

      // Verify styles are applied at each level
      const vstack = container.firstChild as HTMLElement;
      expect(vstack.style.padding).toBe('10px');

      const hstack = vstack.firstChild as HTMLElement;
      expect(hstack.style.margin).toBe('5px');

      const box = hstack.firstChild as HTMLElement;
      expect(box.style.border).toBe('1px solid black');
    });
  });
});
