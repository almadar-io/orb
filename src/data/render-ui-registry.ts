/**
 * render-ui demo examples.
 *
 * Pattern type strings use kebab-case — they map via PATTERN_TO_COMPONENT in UISlotRenderer
 * to the registered React component. No manual component registry here; UISlotComponent
 * handles all resolution internally.
 *
 * Supported patterns (from PATTERN_TO_COMPONENT in UISlotRenderer.tsx):
 *   badge, progress-bar, alert, heading, text, button, card, vstack, hstack,
 *   box, grid, input, select, checkbox, spinner, avatar, icon, ...
 */

export interface RenderUIExample {
  id: string;
  label: string;
  description: string;
  code: string;
}

export const RENDER_UI_EXAMPLES: RenderUIExample[] = [
  {
    id: 'badge-simple',
    label: 'Badge',
    description: 'A badge with a static variant',
    code: JSON.stringify(
      ['render-ui', 'main', 'badge', { label: 'Approved', variant: 'success' }],
      null,
      2,
    ),
  },
  {
    id: 'badge-computed',
    label: 'Computed props',
    description: 'Badge variant computed from entity state at runtime',
    code: JSON.stringify(
      [
        'do',
        ['set', '@entity.score', 85],
        [
          'render-ui',
          'main',
          'badge',
          {
            label: ['str/concat', 'Score: ', '@entity.score'],
            variant: ['if', ['>', '@entity.score', 80], 'success', 'warning'],
          },
        ],
      ],
      null,
      2,
    ),
  },
  {
    id: 'progress-bar',
    label: 'Progress bar',
    description: 'ProgressBar value derived from entity field',
    code: JSON.stringify(
      [
        'do',
        ['set', '@entity.completion', 72],
        [
          'render-ui',
          'main',
          'progress-bar',
          {
            value: '@entity.completion',
            max: 100,
            variant: 'primary',
            showLabel: true,
          },
        ],
      ],
      null,
      2,
    ),
  },
  {
    id: 'alert',
    label: 'Alert',
    description: 'Informational alert with a title',
    code: JSON.stringify(
      [
        'render-ui',
        'main',
        'alert',
        {
          variant: 'info',
          title: 'Note',
          message: 'This component is rendered entirely from an s-expression.',
        },
      ],
      null,
      2,
    ),
  },
  {
    id: 'layout-nested',
    label: 'Nested layout',
    description: 'VStack with heading, badge, and progress bar as children',
    code: JSON.stringify(
      [
        'render-ui',
        'main',
        'vstack',
        {
          gap: 'md',
          children: [
            { type: 'heading', props: { content: 'Status Overview', level: 3 } },
            { type: 'badge', props: { label: 'Active', variant: 'success' } },
            { type: 'progress-bar', props: { value: 75, showLabel: true } },
          ],
        },
      ],
      null,
      2,
    ),
  },
];
