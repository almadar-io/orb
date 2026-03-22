/**
 * Custom Prism language definition for .orb files.
 *
 * This file is loaded by Docusaurus via the prism config's
 * additionalLanguages mechanism. It extends the JSON grammar
 * with semantic token classification for .orb constructs.
 *
 * Uses Prism's token hook to classify strings based on registries.
 */

// Load the generated token data
const tokens = require('@almadar/syntax/tokens.json');

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function wordsToAlternation(words) {
  return [...words].sort((a, b) => b.length - a.length).map(escapeRegex).join('|');
}

// Build word sets for fast lookup
const effectSet = new Set(tokens.effectTypes);
const slotSet = new Set(tokens.uiSlots);
const structuralSet = new Set(tokens.structuralKeys);
const fieldTypeSet = new Set(tokens.fieldTypes);
const persistenceSet = new Set(tokens.persistenceKinds);
const patternSet = new Set(tokens.patternNames);
const behaviorSet = new Set(tokens.behaviorNames);
const allOpsSet = new Set(tokens.allOperatorNames);

// Build namespace lookup
const opToNamespace = {};
for (const [ns, ops] of Object.entries(tokens.operatorsByNamespace)) {
  for (const op of ops) {
    opToNamespace[op] = ns;
  }
}

function classifyString(text) {
  // Remove quotes
  const unquoted = text.slice(1, -1);

  // Bindings
  if (/^@(entity|payload|state|now|config|computed|trait)(\.[a-zA-Z0-9_.]+)?$/.test(unquoted)) return 'orb-binding';
  if (/^@[A-Z][a-zA-Z0-9]*(\.[a-zA-Z0-9_.]+)?$/.test(unquoted)) return 'orb-binding';

  // Effects
  if (effectSet.has(unquoted)) return 'orb-effect';

  // Operator by namespace
  const ns = opToNamespace[unquoted];
  if (ns) return 'orb-op-' + ns;

  // Events (UPPER_SNAKE_CASE, 3+ chars)
  if (/^[A-Z][A-Z0-9_]{2,}$/.test(unquoted)) return 'orb-event';

  // UI slots
  if (slotSet.has(unquoted)) return 'orb-slot';

  // Structural keys
  if (structuralSet.has(unquoted)) return 'orb-structural';

  // Field types
  if (fieldTypeSet.has(unquoted)) return 'orb-field-type';

  // Persistence
  if (persistenceSet.has(unquoted)) return 'orb-persistence';

  // Known patterns
  if (patternSet.has(unquoted)) return 'orb-pattern';

  // Behaviors
  if (behaviorSet.has(unquoted)) return 'orb-behavior';

  return null; // default string
}

/**
 * Register the orb language with Prism.
 * Called at import time by Docusaurus.
 */
module.exports = function defineOrbLanguage(Prism) {
  // Extend JSON
  Prism.languages.orb = Prism.languages.extend('json', {});

  // Add hooks for semantic classification
  Prism.hooks.add('after-tokenize', function (env) {
    if (env.language !== 'orb') return;

    function processTokens(tokenList) {
      for (let i = 0; i < tokenList.length; i++) {
        const token = tokenList[i];
        if (typeof token === 'string') continue;
        if (token.type === 'string') {
          const content = typeof token.content === 'string'
            ? token.content
            : Array.isArray(token.content)
              ? token.content.map(t => typeof t === 'string' ? t : t.content).join('')
              : '';

          const cls = classifyString(content);
          if (cls) {
            token.type = cls;
          }
        }
        // Recurse into nested tokens
        if (Array.isArray(token.content)) {
          processTokens(token.content);
        }
      }
    }

    processTokens(env.tokens);
  });
};
