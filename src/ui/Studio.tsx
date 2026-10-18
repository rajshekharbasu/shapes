import { useEffect, useState, useSyncExternalStore } from 'react'
import { Box, Circle, Cone, Cylinder, Pill, Redo2, Square, Torus, Undo2, List } from 'lucide-react'
import type { ShapeKind } from '../editor/model'
import type { Editor, Snapshot } from '../editor/store'
import { Inspector } from './Inspector'
import { Viewport } from './Viewport'

const SHAPES: { kind: ShapeKind; label: string; icon: typeof Box }[] = [
  { kind: 'box', label: 'Cube', icon: Box },
  { kind: 'sphere', label: 'Sphere', icon: Circle },
  { kind: 'plane', label: 'Plane', icon: Square },
  { kind: 'cone', label: 'Cone', icon: Cone },
  { kind: 'cylinder', label: 'Cylinder', icon: Cylinder },
  { kind: 'torus', label: 'Torus', icon: Torus },
  { kind: 'capsule', label: 'Capsule', icon: Pill },
]

function useSnapshot(editor: Editor): Snapshot {
  return useSyncExternalStore(editor.subscribe, editor.snapshot, editor.snapshot)
}

function fieldFocused(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable
}

export function Studio({ editor }: { editor: Editor }) {
  const snapshot = useSnapshot(editor)
  const [renaming, setRenaming] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (fieldFocused(event.target)) return
      if (event.isComposing || event.repeat) return
      const ctrl = event.ctrlKey || event.metaKey
      const key = event.key.toLowerCase()
      if (ctrl && key === 'z' && event.shiftKey) {
        event.preventDefault()
        editor.dispatch({ kind: 'redo' })
        return
      }
      if (ctrl && key === 'y') {
        event.preventDefault()
        editor.dispatch({ kind: 'redo' })
        return
      }
      if (ctrl && key === 'z') {
        event.preventDefault()
        editor.dispatch({ kind: 'undo' })
        return
      }
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault()
        editor.dispatch({ kind: 'delete' })
        return
      }
      if (key === 'm') {
        event.preventDefault()
        editor.dispatch({ kind: 'setTool', tool: 'move' })
        return
      }
      if (key === 'r') {
        event.preventDefault()
        editor.dispatch({ kind: 'setTool', tool: 'rotate' })
        return
      }
      if (key === 's') {
        event.preventDefault()
        editor.dispatch({ kind: 'setTool', tool: 'scale' })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [editor])

  return (
    <div className="studio">
      <header className="header">
        <h1 className="wordmark">shapes</h1>
        <div className="header-actions">
          <button
            type="button"
            className="chrome-btn icon"
            aria-label="Undo"
            disabled={!snapshot.canUndo}
            onClick={() => editor.dispatch({ kind: 'undo' })}
          >
            <Undo2 size={16} strokeWidth={1.75} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="chrome-btn icon"
            aria-label="Redo"
            disabled={!snapshot.canRedo}
            onClick={() => editor.dispatch({ kind: 'redo' })}
          >
            <Redo2 size={16} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
      </header>
      <div className="body">
        <nav className="rail" aria-label="Tools">
          <button type="button" className="rail-btn active" aria-label="Objects" aria-pressed="true">
            <List size={18} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            className="rail-btn"
            aria-label="Undo"
            disabled={!snapshot.canUndo}
            onClick={() => editor.dispatch({ kind: 'undo' })}
          >
            <Undo2 size={18} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            className="rail-btn"
            aria-label="Redo"
            disabled={!snapshot.canRedo}
            onClick={() => editor.dispatch({ kind: 'redo' })}
          >
            <Redo2 size={18} strokeWidth={1.75} />
          </button>
        </nav>
        <aside className="outliner" aria-label="Objects">
          <h2>Objects</h2>
          {snapshot.document.objects.length === 0 ? (
            <p className="empty-copy">Add a cube, sphere, or plane.</p>
          ) : (
            <div className="object-list">
              {snapshot.document.objects.map((object) => {
                const item = SHAPES.find((shape) => shape.kind === object.kind)
                const Icon = item?.icon ?? Box
                const selected = snapshot.selection === object.id
                return (
                  <div key={object.id} className={selected ? 'object-row selected' : 'object-row'}>
                    <button
                      type="button"
                      className="object-hit"
                      aria-current={selected ? 'true' : undefined}
                      onClick={() => editor.dispatch({ kind: 'select', id: object.id })}
                      onDoubleClick={() => {
                        editor.dispatch({ kind: 'select', id: object.id })
                        setRenaming(object.id)
                      }}
                    >
                      <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
                    </button>
                    {renaming === object.id ? (
                      <input
                        className="name-input"
                        aria-label={`Rename ${object.name}`}
                        defaultValue={object.name}
                        autoFocus
                        onBlur={(event) => {
                          if (event.target.dataset.skip !== '1') {
                            editor.dispatch({ kind: 'rename', name: event.target.value })
                          }
                          setRenaming(null)
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') event.currentTarget.blur()
                          if (event.key === 'Escape') {
                            event.currentTarget.dataset.skip = '1'
                            event.currentTarget.blur()
                          }
                        }}
                      />
                    ) : (
                      <button
                        type="button"
                        className="object-name"
                        onClick={() => editor.dispatch({ kind: 'select', id: object.id })}
                        onDoubleClick={() => {
                          editor.dispatch({ kind: 'select', id: object.id })
                          setRenaming(object.id)
                        }}
                      >
                        {object.name}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </aside>
        <div className="workspace">
          <Viewport editor={editor} snapshot={snapshot} />
          <div className="stage-switch" aria-hidden="true">
            3D Stage
          </div>
        </div>
        <Inspector editor={editor} snapshot={snapshot} />
      </div>
    </div>
  )
}
