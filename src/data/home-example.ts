/**
 * Home page hero example — a complete .orb app (Todo) shown in the
 * "One File, Full Application" section.
 *
 * SOURCE OF TRUTH for both the Code tab and the Preview tab. After editing this
 * string, regenerate the preview schema:
 *   npx tsx scripts/generate-home-example-schema.ts
 *
 * Passes `orbital validate` 0/0. Body is orbital-format output with the
 * uses+type header block tidied (formatter over-indents type decls).
 */

export const HOME_EXAMPLE_CODE = `app std-todo "1.0.0"
"Todo list with Add (modal) and Remove (confirmation) flows, closed-circuit fetch + persist"
orbital TodoOrbital {
  uses Confirmation from "std/behaviors/std-confirmation"
  uses Modal from "std/behaviors/std-modal"
  type TodoLoaded = Event { data : [Todo] } "Fired when the Todo collection finishes loading"
  type TodoLoadFailed = Event { error : string, code : string } "Fired when the Todo collection fails to load"

  entity Todo [persistent: todos] {
    id : string!
    name : string!
    description : string
    status : "active" | "inactive" | "pending" = active
    createdAt : string
    pendingId : string = ""
  }

  trait TodoBrowse -> Todo [interaction, collection] {
    initial: loading

    state loading {
      INIT -> loading
        (fetch Todo {
          emit: { failure: TodoLoadFailed, success: TodoLoaded }
        })
        (render-ui main {
          align: center
          children: [{ type: spinner }, {
            color: muted
            content: "Loading todos…"
            type: typography
            variant: caption
          }]
          className: py-12
          direction: vertical
          gap: md
          type: stack
        })
      TodoLoaded -> browsing
        (render-ui main {
          children: [{
            children: [{
              children: [{ name: list-checks, type: icon }, {
                content: Todos
                type: typography
                variant: h2
              }]
              direction: horizontal
              gap: md
              type: stack
            }, {
              action: ADD_TODO
              icon: plus
              label: "Add Todo"
              type: button
              variant: primary
            }]
            direction: horizontal
            gap: md
            justify: between
            type: stack
          }, { type: divider }, {
            entity: ?data
            fields: [{
              icon: check-square
              label: Name
              name: name
              variant: h4
            }, {
              label: Description
              name: description
              variant: caption
            }, {
              label: Status
              name: status
              variant: badge
            }]
            itemActions: [{
              event: REMOVE_TODO
              label: Remove
              variant: danger
            }]
            type: data-grid
          }]
          className: "max-w-5xl mx-auto w-full"
          direction: vertical
          gap: lg
          type: stack
        })
      TodoLoadFailed -> error
        (render-ui main {
          align: center
          children: [{
            color: destructive
            name: alert-triangle
            type: icon
          }, {
            content: "Failed to load todos"
            type: typography
            variant: h3
          }, {
            color: muted
            content: ?error
            type: typography
            variant: body
          }, {
            action: INIT
            icon: rotate-ccw
            label: Retry
            type: button
            variant: primary
          }]
          className: py-12
          direction: vertical
          gap: md
          type: stack
        })
    }

    state browsing {
      INIT -> loading
        (fetch Todo {
          emit: { failure: TodoLoadFailed, success: TodoLoaded }
        })
        (render-ui main { type: spinner })
    }

    state error {
      INIT -> loading
        (fetch Todo {
          emit: { failure: TodoLoadFailed, success: TodoLoaded }
        })
        (render-ui main { type: spinner })
    }

    emits {
      TodoLoaded
      TodoLoadFailed
      ADD_TODO -> external {
        id : string
        row : Todo
      }
      REMOVE_TODO -> external {
        id : string!
        name : string
      }
    }

    listens {
      TodoLoadFailed {
        error : string
        code : string
      }
      TodoPersistor.TODO_ADDED -> INIT
      TodoPersistor.TODO_REMOVED -> INIT
    }
  }

  ;; Add: configured via \`config\`, no effects overrides.
  trait TodoAdd = Modal.traits.ModalRecordModal -> Todo {
    events {
      OPEN: ADD_TODO
      SAVE: TODO_ADDED
    }

    config {
      icon: plus-circle
      title: "Add Todo"
      fields: (name description status)
      mode: create
    }

    listens {
      TodoBrowse.ADD_TODO -> ADD_TODO
    }
  }

  ;; Remove: confirmation dialog.
  trait TodoRemove = Confirmation.traits.ConfirmActionConfirmation -> Todo {
    events {
      REQUEST: REMOVE_TODO
      CONFIRM: TODO_REMOVED
    }

    config {
      icon: alert-triangle
      title: "Remove Todo"
      alertMessage: "Are you sure you want to remove this todo? This cannot be undone."
      confirmLabel: Remove
    }

    listens {
      TodoBrowse.REMOVE_TODO -> REMOVE_TODO
    }
  }

  ;; Coordinator: side-effects for Add / Remove. Listens to the bound atoms'
  ;; emits and runs the actual persist calls.
  trait TodoPersistor -> Todo [lifecycle, instance] {
    initial: idle

    state idle {
      INIT -> idle
      DO_ADD -> idle
        (persist create Todo ?data)
        (emit TODO_ADDED { id: ?data.id })
      DO_REMOVE -> idle
        (persist delete Todo ?id)
        (emit TODO_REMOVED { id: ?id })
    }

    emits {
      TODO_ADDED -> external {
        id : string!
      }
      TODO_REMOVED -> external {
        id : string!
      }
    }

    listens {
      DO_ADD {
        data : Todo
      }
      DO_REMOVE {
        id : string!
      }
      TodoAdd.TODO_ADDED -> DO_ADD
      TodoRemove.TODO_REMOVED -> DO_REMOVE
    }
  }

  page "/todos" as TodoPage -> TodoBrowse, TodoAdd, TodoRemove, TodoPersistor
}`;
