import React from "react";
import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import Translate, { translate } from "@docusaurus/Translate";
import CodeBlock from "@theme/CodeBlock";
import {
  VStack,
  HStack,
  Typography,
  Button,
  Badge,
  Icon,
  Card,
  Box,
  SimpleGrid,
  Divider,
  AnimatedReveal,
  InstallBox,
} from "@almadar/ui/marketing";
import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { OrbitalHeroBackground } from "../components/OrbitalHeroBackground";

const EXAMPLE_CODE = `app std-todo "1.0.0"
"Todo list with Add (modal) and Remove (confirmation) flows, closed-circuit fetch + persist"

orbital TodoOrbital {
  uses Confirmation from "std/behaviors/std-confirmation"
  uses Modal        from "std/behaviors/std-modal"

  entity Todo [persistent: todos] {
    id          : string!
    name        : string!
    description : string
    status      : "active" | "inactive" | "pending" = "active"
    createdAt   : string
    pendingId   : string = ""
  }

  type TodoLoaded     = Event { data : [Todo] }                    "Fired when the Todo collection finishes loading"
  type TodoLoadFailed = Event { error : string, code : string }    "Fired when the Todo collection fails to load"

  trait TodoBrowse -> Todo [interaction, collection] {
    initial: loading
    state loading {
      INIT -> loading
        (fetch Todo { emit: { success: "TodoLoaded", failure: "TodoLoadFailed" } })
        (render-ui main { type: "stack", direction: "vertical", gap: "md", align: "center", className: "py-12", children: [{ type: "spinner" }, { type: "typography", variant: "caption", color: "muted", content: "Loading todos…" }] })
      TodoLoaded -> browsing
        (render-ui main { type: "stack", direction: "vertical", gap: "lg", className: "max-w-5xl mx-auto w-full", children: [{ type: "stack", direction: "horizontal", gap: "md", justify: "between", children: [{ type: "stack", direction: "horizontal", gap: "md", children: [{ type: "icon", name: "list-checks" }, { type: "typography", content: "Todos", variant: "h2" }] }, { type: "button", label: "Add Todo", action: "ADD_TODO", variant: "primary", icon: "plus" }] }, { type: "divider" }, { type: "data-grid", entity: @payload.data, itemActions: [{ label: "Remove", event: "REMOVE_TODO", variant: "danger" }], fields: [{ name: "name", label: "Name", variant: "h4", icon: "check-square" }, { name: "description", label: "Description", variant: "caption" }, { name: "status", label: "Status", variant: "badge" }] }] })
      TodoLoadFailed -> error
        (render-ui main { type: "stack", direction: "vertical", gap: "md", align: "center", className: "py-12", children: [{ type: "icon", name: "alert-triangle", color: "destructive" }, { type: "typography", variant: "h3", content: "Failed to load todos" }, { type: "typography", variant: "body", color: "muted", content: "@payload.error" }, { type: "button", label: "Retry", action: "INIT", variant: "primary", icon: "rotate-ccw" }] })
    }
    state browsing {
      INIT -> loading
        (fetch Todo { emit: { success: "TodoLoaded", failure: "TodoLoadFailed" } })
        (render-ui main { type: "spinner" })
    }
    state error {
      INIT -> loading
        (fetch Todo { emit: { success: "TodoLoaded", failure: "TodoLoadFailed" } })
        (render-ui main { type: "spinner" })
    }
    emits: [TodoLoaded, TodoLoadFailed]
    listens {
      TodoLoadFailed { error : string, code : string }
      TodoPersistor TODO_ADDED   -> INIT
      TodoPersistor TODO_REMOVED -> INIT
    }
  }

  ;; Add: configured via \`config\`, no effects overrides.
  trait TodoAdd = Modal.traits.ModalRecordModal -> Todo {
    config: {
      icon:   "plus-circle",
      title:  "Add Todo",
      fields: ["name", "description", "status"],
      mode:   "create"
    }
    events {
      OPEN: ADD_TODO
      SAVE: TODO_ADDED
    }
  }

  ;; Remove: confirmation dialog.
  trait TodoRemove = Confirmation.traits.ConfirmActionConfirmation -> Todo {
    config: {
      icon:         "alert-triangle",
      title:        "Remove Todo",
      alertMessage: "Are you sure you want to remove this todo? This cannot be undone.",
      confirmLabel: "Remove"
    }
    events {
      REQUEST: REMOVE_TODO
      CONFIRM: TODO_REMOVED
    }
  }

  ;; Coordinator: side-effects for Add / Remove. Listens to the bound atoms'
  ;; emits and runs the actual persist calls.
  trait TodoPersistor -> Todo [lifecycle, instance] {
    initial: idle
    state idle {
      INIT -> idle
      DO_ADD -> idle
        (persist create Todo @payload.data)
        (emit TODO_ADDED { id: "@payload.data.id" })
      DO_REMOVE -> idle
        (persist delete Todo @payload.id)
        (emit TODO_REMOVED { id: "@payload.id" })
    }
    emits {
      TODO_ADDED   external { id : string! }
      TODO_REMOVED external { id : string! }
    }
    listens {
      DO_ADD    { data : Todo }
      DO_REMOVE { id   : string! }
      TodoAdd    TODO_ADDED   -> DO_ADD
      TodoRemove TODO_REMOVED -> DO_REMOVE
    }
  }

  page "/todos" as TodoPage -> TodoBrowse, TodoAdd, TodoRemove, TodoPersistor
}`;

const WHY_FEATURES = [
  {
    icon: "monitor-smartphone" as const,
    title: translate({ id: "orb.why.compile.title", message: "Write Once, Compile Anywhere" }),
    description: translate({ id: "orb.why.compile.desc", message: "One .orb model compiles to web, mobile, desktop, or any future platform. The behavior is platform-independent." }),
  },
  {
    icon: "shield-check" as const,
    title: translate({ id: "orb.why.correct.title", message: "Compiler-Verified" }),
    description: translate({ id: "orb.why.correct.desc", message: "The compiler checks every possible screen your app can reach. If it compiles, users never hit a broken or missing page." }),
  },
  {
    icon: "bot" as const,
    title: translate({ id: "orb.why.ai.title", message: "AI Generates It Natively" }),
    description: translate({ id: "orb.why.ai.desc", message: "Structured, formal, and compact. AI models generate valid .orb programs more reliably than arbitrary code." }),
  },
];

const DOMAIN_TAGS = [
  "Commerce", "Healthcare", "Education", "Finance", "Scheduling", "Workflow",
  "Social", "Media", "Gaming", "IoT", "CRM", "Analytics",
  "Communication", "Content", "Location", "HR", "Legal", "Real Estate",
];

export default function OrbHome(): ReactNode {
  return (
    <Layout
      title={translate({ id: "orb.meta.title", message: "Orb — A Programming Language for Formal World Models" })}
      description={translate({ id: "orb.meta.desc", message: "Orb describes how software systems behave. Write the model, the compiler proves it correct." })}
    >
      {/* Hero */}
      <Box as="header" className="w-full min-h-[60vh] flex items-center relative overflow-hidden">
        <OrbitalHeroBackground />
        <Box className="site-container py-20 relative z-10">
          <VStack gap="lg" align="start">
            <Badge variant="primary">{translate({ id: "orb.hero.tag", message: "Open Source" })}</Badge>
            <Typography variant="h1">{translate({ id: "orb.hero.title", message: "Orb" })}</Typography>
            <Typography variant="body1" color="muted">{translate({ id: "orb.hero.subtitle", message: "A formal language for describing how software systems behave. Write the model. The compiler proves it correct. AI generates and consumes it natively." })}</Typography>
            <InstallBox command="curl -fsSL https://orb.almadar.io/install.sh | sh" className="max-w-full overflow-hidden" />
            <HStack gap="md" className="flex-wrap">
              <Link to="/docs/getting-started/introduction">
                <Button variant="primary" size="lg">{translate({ id: "orb.hero.cta1", message: "Get Started" })}</Button>
              </Link>
              <Link to="/playground">
                <Button variant="secondary" size="lg">{translate({ id: "orb.hero.cta2", message: "Standard Library" })}</Button>
              </Link>
            </HStack>
          </VStack>
        </Box>
      </Box>

      {/* Split: One File, Full Application */}
      <Box className="w-full">
        <Box className="site-container py-24">
          <HStack gap="xl" className="flex-col lg:flex-row items-start w-full">
            <AnimatedReveal animation="fade-right" className="flex-1 min-w-0 w-full">
              <VStack gap="md">
                <Typography variant="h2">{translate({ id: "orb.example.title", message: "One File, Full Application" })}</Typography>
                <Typography variant="body1" color="muted">{translate({ id: "orb.example.subtitle", message: "A complete task manager in a single .orb file. Entity, state machine, UI — all in one place. The compiler generates frontend, backend, and database." })}</Typography>
              </VStack>
            </AnimatedReveal>
            <AnimatedReveal animation="fade-left" className="flex-1 lg:flex-[2] min-w-0 w-full [&_pre]:!whitespace-pre-wrap [&_pre]:!break-words [&_code]:!whitespace-pre-wrap [&_code]:!break-words">
              <CodeBlock language="lolo" title="task-manager.orb">
                {EXAMPLE_CODE}
              </CodeBlock>
            </AnimatedReveal>
          </HStack>
        </Box>
      </Box>

      {/* Why .orb? */}
      <Box className="w-full bg-[var(--color-surface)]">
        <Box className="site-container py-24">
          <VStack gap="lg" align="center" className="w-full">
            <AnimatedReveal animation="fade-in">
              <Typography variant="h2">
                <Translate id="orb.why.title">Why .orb?</Translate>
              </Typography>
            </AnimatedReveal>
            <SimpleGrid cols={3} gap="lg" className="!grid-cols-1 sm:!grid-cols-3">
              {WHY_FEATURES.map((f, i) => (
                <AnimatedReveal key={f.title} animation="fade-up" delay={i * 100} className="h-full">
                  <Card className="p-6 h-full">
                    <VStack gap="sm">
                      <Icon name={f.icon} size={28} className="text-[var(--color-primary)]" />
                      <Typography variant="h4">{f.title}</Typography>
                      <Typography variant="body2" color="muted">{f.description}</Typography>
                    </VStack>
                  </Card>
                </AnimatedReveal>
              ))}
            </SimpleGrid>
          </VStack>
        </Box>
      </Box>

      {/* Gradient divider */}
      <Box className="w-full h-px" style={{ background: "linear-gradient(to right, transparent, var(--color-primary), transparent)" }} />

      {/* Standard Library */}
      <Box className="w-full">
        <Box className="site-container py-24">
          <HStack gap="xl" className="flex-col lg:flex-row items-center">
            <Box className="flex-1">
              <VStack gap="md">
                <AnimatedReveal animation="fade-in">
                  <Typography variant="h2">{translate({ id: "orb.stdlib.title", message: "Standard Library" })}</Typography>
                </AnimatedReveal>
                <Typography variant="body1" color="muted">{translate({ id: "orb.stdlib.subtitle", message: "93 production-quality behaviors across 18 domains. 50 atoms, 18 molecules, 25 organisms. Commerce, healthcare, education, gaming, DevOps, and more." })}</Typography>
                <HStack gap="sm" className="flex-wrap mt-2">
                  {DOMAIN_TAGS.map((tag, i) => (
                    <AnimatedReveal key={tag} animation="scale" delay={i * 30}>
                      <Badge variant="primary">{tag}</Badge>
                    </AnimatedReveal>
                  ))}
                </HStack>
                <Box className="mt-2">
                  <Link to="/playground">
                    <Button variant="primary" size="lg">
                      <Translate id="orb.stdlib.cta">Browse the Standard Library</Translate>
                    </Button>
                  </Link>
                </Box>
              </VStack>
            </Box>
            <Box className="flex-1 flex justify-center" style={{ maxWidth: 300 }}>
              <ThemedImage
                alt="Orb Standard Library Module"
                sources={{
                  light: useBaseUrl('/img/illustrations/Orb-Stdlib-Index-light.svg'),
                  dark: useBaseUrl('/img/illustrations/Orb-Stdlib-Index-dark.svg'),
                }}
                className="w-full drop-shadow-xl"
              />
            </Box>
          </HStack>
        </Box>
      </Box>

      {/* Open Source Community */}
      <Box className="w-full bg-[var(--color-surface)]">
        <AnimatedReveal animation="fade-up">
          <Box className="site-container py-24">
            <VStack gap="lg" align="center" className="w-full">
              <Typography variant="h2">
                <Translate id="orb.community.title">Open Source Community</Translate>
              </Typography>
              <Typography variant="body1" color="muted">
                <Translate id="orb.community.subtitle">Orb and its compiler are open source. Contribute, report issues, or build something new.</Translate>
              </Typography>
              <HStack gap="md" className="flex-wrap">
                <a href="https://github.com/almadar-io/orb" target="_blank" rel="noopener noreferrer">
                  <Button variant="primary" size="lg" leftIcon="github">
                    GitHub
                  </Button>
                </a>
                <a href="https://discord.gg/q83VjPJx" target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="lg" leftIcon="message-circle">
                    Discord
                  </Button>
                </a>
              </HStack>
            </VStack>
          </Box>
        </AnimatedReveal>
      </Box>
    </Layout>
  );
}
